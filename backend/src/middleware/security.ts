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
  // Only angle brackets are entity-encoded (HTML safety for email templates).
  // NOTE: quotes/apostrophes/slashes must stay raw — encoding them broke image
  // URLs (&#x2F;) and added ';' entities that tripped the SQL detector. React
  // escapes rendered output anyway, and all DB queries are parameterized.
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
  // Classic tautology: ' OR 1=1 --
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
  // UNION-based extraction
  /\bUNION\b(?:\s+ALL)?\s+\bSELECT\b/i,
  // Stacked queries: '; DROP TABLE x
  /;\s*(DROP|TRUNCATE|ALTER|CREATE|EXEC|EXECUTE|INSERT|UPDATE|DELETE)\b/i,
  // Destructive statements
  /\bDROP\s+(TABLE|DATABASE)\b/i,
  // MSSQL stored-procedure signatures
  /(xp_\w+|sp_executesql)/i,
  // SQL block comments /* ... */
  /\/\*[\s\S]*?\*\//,
  // SQL function calls
  /\b(CHAR|CONCAT|ASCII|SUBSTR|LOAD_FILE)\s*\(/i,
];
// NOTE: bare ';' / '--' / standalone keywords (SELECT, UPDATE, CREATE...) were
// removed — they false-positived on normal sentences and image URLs, blocking
// legit listing creation ("Invalid input detected"). All DB access uses
// parameterized queries, so these signatures are defense-in-depth only.

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
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'https://frontend-gamma-bay-24.vercel.app',
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
