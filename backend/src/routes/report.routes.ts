import { Router } from 'express';
import { getRevenueReport, getBookingReport, getUserReport, exportReport } from '../controllers/report.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/revenue', authenticate, requireRole('admin'), getRevenueReport);
router.get('/bookings', authenticate, requireRole('admin'), getBookingReport);
router.get('/users', authenticate, requireRole('admin'), getUserReport);
router.get('/export', authenticate, requireRole('admin'), exportReport);

export default router;
