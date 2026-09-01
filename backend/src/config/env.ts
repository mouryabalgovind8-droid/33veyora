import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || './database/database.db',
  
  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Server
  BACKEND_PORT: parseInt(process.env.BACKEND_PORT || '3001'),
  FRONTEND_PORT: parseInt(process.env.FRONTEND_PORT || '5173'),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  // Google OAuth (used to verify Google ID tokens server-side)
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',

  
  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  
  // AI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  
  // Payment
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  
  // Uploads
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production'
} as const;
