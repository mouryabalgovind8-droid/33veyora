import { Router } from 'express';
import { 
  register, 
  login, 
  oauthLogin,
  getMe, 
  forgotPassword, 
  verifyOTP, 
  resetPassword, 
  changePassword 
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimit, otpRateLimit } from '../middleware/security.js';

const router = Router();

// POST /api/auth/register - Register new user (with rate limit)
router.post('/register', authRateLimit, register);

// POST /api/auth/login - Login (with aggressive rate limit for brute-force protection)
router.post('/login', authRateLimit, login);

// POST /api/auth/oauth - OAuth login/register (Google, Facebook)
router.post('/oauth', authRateLimit, oauthLogin);

// GET /api/auth/me - Get current user (requires auth)
router.get('/me', authenticate, getMe);

// POST /api/auth/forgot-password - Send OTP (with rate limit)
router.post('/forgot-password', authRateLimit, forgotPassword);

// POST /api/auth/verify-otp - Verify OTP (with OTP-specific rate limit)
router.post('/verify-otp', otpRateLimit, verifyOTP);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', authRateLimit, resetPassword);

// POST /api/auth/change-password - Change password (requires auth)
router.post('/change-password', authenticate, changePassword);

export default router;
