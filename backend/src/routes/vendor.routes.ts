import { Router } from 'express';
import {
  getVendorDashboard,
  getVendorEarnings,
  getVendorProfile,
  updateVendorProfile,
} from '../controllers/vendor.controller.js';
import { getVendorListings } from '../controllers/listing.controller.js';
import { getVendorBookings, respondToBooking } from '../controllers/booking.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { writeRateLimit } from '../middleware/security.js';

const router = Router();

// All vendor endpoints require an authenticated vendor account
router.use(authenticate, requireRole('vendor'));

// Dashboard
router.get('/dashboard', getVendorDashboard);

// Listings / bookings
router.get('/listings', getVendorListings);
router.get('/bookings', getVendorBookings);
router.post('/bookings/:id/respond', writeRateLimit, respondToBooking);

// Earnings
router.get('/earnings', getVendorEarnings);

// Profile / KYC
router.get('/profile', getVendorProfile);
router.put('/profile', writeRateLimit, updateVendorProfile);

export default router;
