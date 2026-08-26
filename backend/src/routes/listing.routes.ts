import { Router } from 'express';
import { 
  getListings, 
  getListing, 
  createListing, 
  updateListing, 
  deleteListing,
  getVendorListings 
} from '../controllers/listing.controller.js';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth.js';
import { writeRateLimit } from '../middleware/security.js';

const router = Router();

// GET /api/listings - Get all approved listings (public)
router.get('/', optionalAuth, getListings);

// GET /api/listings/vendor - Get vendor's own listings (vendor only)
router.get('/vendor', authenticate, requireRole('vendor'), getVendorListings);

// GET /api/listings/:id - Get single listing (public)
router.get('/:id', optionalAuth, getListing);

// POST /api/listings - Create listing (vendor only, with rate limit)
router.post('/', authenticate, requireRole('vendor'), writeRateLimit, createListing);

// PUT /api/listings/:id - Update listing (vendor only, own listings)
router.put('/:id', authenticate, requireRole('vendor'), writeRateLimit, updateListing);

// DELETE /api/listings/:id - Delete listing (vendor only, own listings)
router.delete('/:id', authenticate, requireRole('vendor'), writeRateLimit, deleteListing);

export default router;
