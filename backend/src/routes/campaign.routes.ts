import { Router } from 'express';
import { createCampaign, getCampaigns, updateCampaign, deleteCampaign, validatePromoCode } from '../controllers/campaign.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Admin routes
router.get('/', authenticate, requireRole('admin'), getCampaigns);
router.post('/', authenticate, requireRole('admin'), createCampaign);
router.put('/:id', authenticate, requireRole('admin'), updateCampaign);
router.delete('/:id', authenticate, requireRole('admin'), deleteCampaign);

// User route
router.post('/validate', authenticate, validatePromoCode);

export default router;
