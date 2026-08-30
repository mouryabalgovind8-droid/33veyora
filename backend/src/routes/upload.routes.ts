import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ============================================
// Cloudinary configuration
// The Node SDK also auto-reads CLOUDINARY_URL (cloudinary://key:secret@cloud_name)
// from the environment. Individual CLOUDINARY_* variables are used as an
// explicit fallback configuration.
// ============================================
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

// Multer MEMORY storage — the file never touches the server disk.
// It is streamed straight from RAM to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP and GIF images are allowed'));
    }
  },
});

const isCloudinaryConfigured = () => {
  const conf = cloudinary.config();
  return Boolean(conf.cloud_name && conf.api_key);
};

// POST /api/upload/image — upload one image from the client to Cloudinary
// Requires auth (vendors upload listing photos, KYC docs, etc.)
router.post('/image', authenticate, (req: Request, res: Response) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? `Image too large (max ${Math.round(env.MAX_FILE_SIZE / (1024 * 1024))}MB)`
          : err.message || 'Upload failed';
      return res.status(status).json({ error: message });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No image file provided (form field name must be "image")' });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        error: 'Image storage (Cloudinary) is not configured — set CLOUDINARY_URL or CLOUDINARY_* keys in backend .env',
      });
    }

    try {
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: '33veyora/listings', resource_type: 'image' },
          (error, uploadResult) => (error ? reject(error) : resolve(uploadResult))
        );
        stream.end(file.buffer);
      });

      return res.status(201).json({
        message: 'Image uploaded to Cloudinary',
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(502).json({ error: 'Failed to upload image to Cloudinary' });
    }
  });
});

export default router;
