import { Router } from 'express';
import { raiseDispute, getDisputes, resolveDispute } from '../controllers/dispute.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, requireRole('user'), raiseDispute);
router.get('/', authenticate, requireRole('admin'), getDisputes);
router.put('/:id/resolve', authenticate, requireRole('admin'), resolveDispute);

export default router;
