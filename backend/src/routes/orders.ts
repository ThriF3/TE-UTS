import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(authMiddleware);

// Create order
router.post(
  '/',
  asyncHandler((req, res) => OrderController.createOrder(req as any, res))
);

// Get all orders
router.get(
  '/',
  asyncHandler((req, res) => OrderController.getAllOrders(req as any, res))
);

// Get order by ID
router.get(
  '/:id',
  asyncHandler((req, res) => OrderController.getOrder(req as any, res))
);

// Approve order
router.post(
  '/:id/approve',
  authorize('admin', 'kasir', 'finance'),
  asyncHandler((req, res) => OrderController.approveOrder(req as any, res))
);

export default router;
