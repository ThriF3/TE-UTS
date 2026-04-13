import { Router } from 'express';
import { ReturnController } from '../controllers/returnController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(authMiddleware);

// Create return
router.post(
  '/',
  asyncHandler((req, res) => ReturnController.createReturn(req as any, res))
);

// Get all returns
router.get(
  '/',
  asyncHandler((req, res) => ReturnController.getAllReturns(req as any, res))
);

// Get return by ID
router.get(
  '/:id',
  asyncHandler((req, res) => ReturnController.getReturn(req as any, res))
);

// Approve return
router.post(
  '/:id/approve',
  authorize('admin', 'finance'),
  asyncHandler((req, res) => ReturnController.approveReturn(req as any, res))
);

export default router;
