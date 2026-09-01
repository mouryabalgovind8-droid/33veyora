import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, closeDatabase } from './config/database.js';
import { 
  securityHeaders, 
  sanitizeInput, 
  detectSQLInjection, 
  requestSizeLimit,
  apiRateLimit,
  corsConfig
} from './middleware/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (local .env or Railway/Render env vars)
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const app = express();
// Railway/Render inject PORT at runtime; BACKEND_PORT is for local .env
const PORT = process.env.PORT || process.env.BACKEND_PORT || 3001;

// ============================================
// SECURITY MIDDLEWARE (applied globally)
// ============================================

// Security headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(securityHeaders);

// CORS with strict configuration
app.use(cors(corsConfig));

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Input sanitization (XSS prevention)
app.use(sanitizeInput);

// SQL injection detection
app.use(detectSQLInjection);

// Global rate limiting (60 requests per minute)
app.use('/api', apiRateLimit);

// Request size limit (10MB — photos Cloudinary pe upload hote hai;
// JSON bodies still capped at 1MB by express.json above)
app.use(requestSizeLimit(10240));

// Static files for uploads (with restricted access)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: '33veyora API is running'
  });
});

// Import and mount routes
import authRoutes from './routes/auth.routes.js';
import listingRoutes from './routes/listing.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import reviewRoutes from './routes/review.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import adminRoutes from './routes/admin.routes.js';
import disputeRoutes from './routes/dispute.routes.js';
import locationRoutes from './routes/location.routes.js';
import reportRoutes from './routes/report.routes.js';
import campaignRoutes from './routes/campaign.routes.js';
import guideRoutes from './routes/guide.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import uploadRoutes from './routes/upload.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/vendor', vendorRoutes);
// Image uploads — photos Cloudinary cloud pe save hoti hai (POST /api/upload/image)
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware (don't expose internal errors in production)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  // Don't expose internal error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    error: isProduction ? 'Internal Server Error' : (err.message || 'Internal Server Error')
  });
});

// Start server with database initialization
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`\n🏠 33veyora Backend`);
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`🔒 Security: Rate limiting, XSS protection, SQL injection detection enabled`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});

export default app;
