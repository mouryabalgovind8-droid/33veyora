import { Router } from 'express';
import { getGuides, addGuide, updateGuide, deleteGuide, getListingGuides } from '../controllers/guide.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Vendor routes
router.get('/', authenticate, requireRole('vendor'), getGuides);
router.post('/', authenticate, requireRole('vendor'), addGuide);
router.put('/:id', authenticate, requireRole('vendor'), updateGuide);
router.delete('/:id', authenticate, requireRole('vendor'), deleteGuide);

// Public route
router.get('/listing/:listingId', getListingGuides);

export default router;
