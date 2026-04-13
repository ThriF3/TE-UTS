import { Router } from 'express';
import { StockController } from '../controllers/stockController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(authMiddleware);

// Create stock item
router.post(
  '/',
  authorize('admin', 'finance'),
  asyncHandler((req, res) => StockController.createStockItem(req as any, res))
);

// Get all stock items
router.get(
  '/',
  asyncHandler((req, res) => StockController.getAllStockItems(req as any, res))
);

// Get low stock items
router.get(
  '/alert/low-stock',
  authorize('admin', 'finance'),
  asyncHandler((req, res) => StockController.getLowStockItems(req as any, res))
);

// Get stock item by ID
router.get(
  '/:id',
  asyncHandler((req, res) => StockController.getStockItem(req as any, res))
);

// Update stock item
router.put(
  '/:id',
  authorize('admin', 'finance'),
  asyncHandler((req, res) => StockController.updateStockItem(req as any, res))
);

// Update stock quantity
router.patch(
  '/:id/quantity',
  authorize('admin', 'kasir', 'finance'),
  asyncHandler((req, res) => StockController.updateStockQuantity(req as any, res))
);

export default router;
