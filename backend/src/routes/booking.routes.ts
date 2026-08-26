import { Router } from 'express';
import { 
  createBooking, 
  getMyBookings, 
  getBooking, 
  cancelBooking,
  getVendorBookings,
  respondToBooking,
  requestReschedule 
} from '../controllers/booking.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// POST /api/bookings - Create booking (user only)
router.post('/', authenticate, requireRole('user'), createBooking);

// GET /api/bookings/my - Get current user's bookings
router.get('/my', authenticate, getMyBookings);

// GET /api/bookings/vendor - Get vendor's bookings
router.get('/vendor', authenticate, requireRole('vendor'), getVendorBookings);

// GET /api/bookings/:id - Get single booking
router.get('/:id', authenticate, getBooking);

// POST /api/bookings/:id/cancel - Cancel booking
router.post('/:id/cancel', authenticate, cancelBooking);

// POST /api/bookings/:id/respond - Vendor accept/reject
router.post('/:id/respond', authenticate, requireRole('vendor'), respondToBooking);

// POST /api/bookings/:id/reschedule - User request reschedule
router.post('/:id/reschedule', authenticate, requireRole('user'), requestReschedule);

export default router;
