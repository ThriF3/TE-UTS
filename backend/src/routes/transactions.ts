import { Router, Request, Response } from 'express';
import { TransactionController } from '../controllers/transactionController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Webhook endpoint (unauthenticated)
router.post(
  '/midtrans-notification',
  asyncHandler((req: Request, res: Response) => TransactionController.midtransNotification(req as any, res))
);

router.use(authMiddleware);

// Create transaction (for POS)
router.post(
  '/',
  authorize('admin', 'kasir'),
  asyncHandler((req: Request, res: Response) => TransactionController.createTransaction(req as any, res))
);

// Get all transactions
router.get(
  '/',
  authorize('admin', 'kasir', 'finance'),
  asyncHandler((req: Request, res: Response) => TransactionController.getAllTransactions(req as any, res))
);

// Get transaction by ID
router.get(
  '/:id',
  authorize('admin', 'kasir', 'finance'),
  asyncHandler((req: Request, res: Response) => TransactionController.getTransaction(req as any, res))
);

// Get transaction stats
router.get(
  '/stats/dashboard',
  authorize('admin', 'finance'),
  asyncHandler((req: Request, res: Response) => TransactionController.getTransactionStats(req as any, res))
);

export default router;
