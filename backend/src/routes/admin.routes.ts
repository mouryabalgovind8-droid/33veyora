import { Router } from 'express';
import { 
  getDashboard, 
  getUsers, 
  toggleUserStatus,
  getVendors,
  approveVendor,
  rejectVendor,
  getListings,
  approveListing,
  rejectListing,
  getBookings,
  getRefunds,
  processRefund,
  getStats
} from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// All admin routes require admin role
router.use(authenticate, requireRole('admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// User management
router.get('/users', getUsers);
router.post('/users/:id/toggle-status', toggleUserStatus);

// Vendor management
router.get('/vendors', getVendors);
router.post('/vendors/:id/approve', approveVendor);
router.post('/vendors/:id/reject', rejectVendor);

// Listing management
router.get('/listings', getListings);
router.post('/listings/:id/approve', approveListing);
router.post('/listings/:id/reject', rejectListing);

// Booking management
router.get('/bookings', getBookings);

// Refund management
router.get('/refunds', getRefunds);
router.post('/refunds/:id/process', processRefund);

// Stats
router.get('/stats', getStats);

export default router;
