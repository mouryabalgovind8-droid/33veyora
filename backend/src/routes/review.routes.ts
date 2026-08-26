import { Router } from 'express';
import { createReview, getListingReviews, respondToReview } from '../controllers/review.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { writeRateLimit } from '../middleware/security.js';

const router = Router();

// POST /api/reviews - Create review (user only, with rate limit to prevent review bombing)
router.post('/', authenticate, requireRole('user'), writeRateLimit, createReview);

// GET /api/reviews/listing/:listingId - Get reviews for a listing (public)
router.get('/listing/:listingId', getListingReviews);

// POST /api/reviews/:id/respond - Vendor responds to review
router.post('/:id/respond', authenticate, requireRole('vendor'), writeRateLimit, respondToReview);

export default router;
