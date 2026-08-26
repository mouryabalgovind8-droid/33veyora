import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/wishlist - Get user's wishlist
router.get('/', authenticate, getWishlist);

// POST /api/wishlist - Add to wishlist
router.post('/', authenticate, addToWishlist);

// DELETE /api/wishlist/:listingId - Remove from wishlist
router.delete('/:listingId', authenticate, removeFromWishlist);

export default router;
