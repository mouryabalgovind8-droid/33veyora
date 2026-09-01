import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import { NotificationService } from '../services/notification.service.js';
import { env } from '../config/env.js';

// Store OTPs in memory (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// POST /api/auth/register - Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one lowercase letter' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one number' });
    }
    
    // SECURITY: Only 'user' and 'vendor' can self-register (BRD 1 §1.3: vendors
    // register as accommodation providers). 'admin' can never be self-assigned.
    // New vendors start unverified and must be approved by an admin before
    // their listings can go live.
    const allowedRole = role === 'vendor' ? 'vendor' : 'user';
    
    const pool = getDatabase();
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user - SECURITY: Force role to 'user' regardless of input
    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role',
      [name, email, hashedPassword, phone || null, allowedRole]
    );
    
    const user = result.rows[0];

    // Vendors get a business profile that starts pending admin verification
    if (allowedRole === 'vendor') {
      const businessName = (req.body.businessName || `${name}'s Stay`).toString().trim().slice(0, 120);
      await pool.query(
        'INSERT INTO vendors (id, user_id, business_name, verification_status) VALUES ($1, $2, $3, $4)',
        [uuidv4(), user.id, businessName, 'pending']
      );
    }

    // Generate token
    const token = generateToken({ id: user.id, email, role: user.role });
    
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// POST /api/auth/login - Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const pool = getDatabase();
    
    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }
    
    // Generate token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// GET /api/auth/me - Get current user
export const getMe = async (req: Request, res: Response) => {
  try {
    const pool = getDatabase();
    const result = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
      [(req as any).userId]
    );
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// POST /api/auth/forgot-password - Send OTP for password reset
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const pool = getDatabase();
    
    // Check if user exists
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.json({ message: 'If an account exists with this email, you will receive a reset code' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 10 minute expiry
    otpStore.set(email, {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    
    console.log(`OTP for ${email}: ${otp}`);
    
    // Send OTP email
    await NotificationService.sendPasswordReset(email, otp);
    
    res.json({ message: 'If an account exists with this email, you will receive a reset code' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// POST /api/auth/verify-otp - Verify OTP
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }
    
    const storedOTP = otpStore.get(email);
    
    if (!storedOTP) {
      return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    }
    
    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }
    
    if (storedOTP.code !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    // OTP verified, generate a reset token
    const resetToken = generateToken({ id: email, email, role: 'user' });
    
    // Delete the OTP
    otpStore.delete(email);
    
    res.json({ message: 'OTP verified', resetToken });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

// POST /api/auth/reset-password - Reset password with token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    // Verify the reset token
    let decoded: any;
    try {
      const jwt = require('jsonwebtoken');
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    // Hash and update password
    const pool = getDatabase();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, decoded.email]);
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// POST /api/auth/oauth - OAuth login/register (Google only, token verified server-side)
export const oauthLogin = async (req: Request, res: Response) => {
  try {
    const { provider, credential, email, name, avatar } = req.body;

    if (provider !== 'google') {
      return res.status(400).json({ error: 'Invalid provider. Only google is supported' });
    }

    // Identity ko mehfooz rakhne ke liye token ko SERVER side verify karte hai.
    // Jab bhi credential mile, client se aaya email/name kabhi trust nahi karte.
    let verifiedEmail = '';
    let verifiedName = '';
    let verifiedAvatar: string | null = null;

    if (credential && env.GOOGLE_CLIENT_ID) {
      try {
        const { OAuth2Client } = await import('google-auth-library');
        const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          return res.status(400).json({ error: 'Google token verification failed' });
        }
        verifiedEmail = payload.email;
        verifiedName = payload.name || payload.email.split('@')[0] || 'Google User';
        verifiedAvatar = payload.picture || null;
      } catch (err) {
        console.error('Google token verification error:', err);
        return res.status(401).json({ error: 'Invalid Google credential' });
      }
    } else if (env.IS_PRODUCTION) {
      // SECURITY: Production me sirf verified Google token accept hota hai.
      // Bina credential ka fallback sirf local dev ke liye hai — production me
      // koi bhi client fake email/name bhejkar kisi bhi account pe login kar sakta.
      return res.status(401).json({ error: 'Google token verification is required' });
    } else {
      // Local/dev-only fallback (jab GOOGLE_CLIENT_ID set na ho ya credential na ho)
      verifiedEmail = email;
      verifiedName = name || (email || '').split('@')[0] || 'Google User';
      verifiedAvatar = avatar || null;
    }

    if (!verifiedEmail || !verifiedName) {
      return res.status(400).json({ error: 'Provider, email, and name are required' });
    }

    const pool = getDatabase();

    // Check if user already exists
    const existingResult = await pool.query('SELECT * FROM users WHERE email = $1', [verifiedEmail]);
    let user = existingResult.rows[0];

    if (user) {
      // Update avatar if provided and user doesn't have one
      if (verifiedAvatar && !user.avatar) {
        await pool.query('UPDATE users SET avatar = $1 WHERE email = $2', [verifiedAvatar, verifiedEmail]);
        user.avatar = verifiedAvatar;
      }
    } else {
      // Create new user
      const randomPassword = await bcrypt.hash(verifiedEmail + 'google' + Date.now(), 10);

      const result = await pool.query(
        'INSERT INTO users (name, email, password, avatar, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [verifiedName, verifiedEmail, randomPassword, verifiedAvatar, 'user']
      );

      user = result.rows[0];
    }

    // Check if user is active
    if (user.is_active === 0) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      message: 'OAuth login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('OAuth login error:', error);
    res.status(500).json({ error: 'OAuth login failed' });
  }
};

// POST /api/auth/change-password - Change password (for logged-in users)
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).userId;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    
    const pool = getDatabase();
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
