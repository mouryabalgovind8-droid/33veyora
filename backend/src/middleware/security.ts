import { Request, Response, NextFunction } from 'express';

// ============================================
// 1. RATE LIMITING (In-memory store)
// ============================================
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const createRateLimit = (windowMs: number, maxRequests: number, message?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}-${req.path}`;
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count++;
    if (record.count > maxRequests) {
      return res.status(429).json({
        error: message || 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }
    next();
  };
};

// Aggressive rate limit for auth endpoints
export const authRateLimit = createRateLimit(15 * 60 * 1000, 10, 'Too many login attempts. Try again in 15 minutes.');

// OTP rate limit - 3 attempts per 10 minutes
export const otpRateLimit = createRateLimit(10 * 60 * 1000, 3, 'Too many OTP attempts. Try again in 10 minutes.');

// General API rate limit
export const apiRateLimit = createRateLimit(1 * 60 * 1000, 60, 'Too many requests. Slow down.');

// Strict rate limit for write operations
export const writeRateLimit = createRateLimit(1 * 60 * 1000, 20, 'Too many write operations. Slow down.');

// ============================================
// 2. SECURITY HEADERS
// ============================================
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;");
  
  // Remove server header
  res.removeHeader('X-Powered-By');
  
  next();
};

// ============================================
// 3. INPUT SANITIZATION
// ============================================
const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query) as any;
  }
  next();
};

// ============================================
// 4. SQL INJECTION DETECTION
// ============================================
const sqlInjectionPatterns = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|FETCH|DECLARE|TRUNCATE)\b)/i,
  /(--|;|\/\*|\*\/|xp_|sp_)/i,
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
  /(CHAR\(|CONCAT\(|0x[0-9a-f]+)/i,
];

export const detectSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlInjectionPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
    console.error(`SQL injection attempt detected from IP: ${req.ip}, Path: ${req.path}`);
    return res.status(400).json({ error: 'Invalid input detected' });
  }
  next();
};

// ============================================
// 5. REQUEST SIZE LIMIT
// ============================================
export const requestSizeLimit = (maxSizeKB: number = 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > maxSizeKB * 1024) {
      return res.status(413).json({ error: 'Request too large' });
    }
    next();
  };
};

// ============================================
// 6. CORS CONFIGURATION
// ============================================
export const corsConfig = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

// ============================================
// 7. CLEANUP OLD RATE LIMIT ENTRIES
// ============================================
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute
