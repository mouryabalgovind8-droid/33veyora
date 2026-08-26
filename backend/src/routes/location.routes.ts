import { Router } from 'express';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../controllers/location.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getLocations);
router.post('/', authenticate, requireRole('admin'), createLocation);
router.put('/:id', authenticate, requireRole('admin'), updateLocation);
router.delete('/:id', authenticate, requireRole('admin'), deleteLocation);

export default router;
