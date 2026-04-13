import { Router } from 'express';
import { ContractController } from '../controllers/contractController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(authMiddleware);

// Create contract
router.post(
  '/',
  authorize('admin', 'finance'),
  asyncHandler((req, res) => ContractController.createContract(req as any, res))
);

// Get all contracts
router.get(
  '/',
  asyncHandler((req, res) => ContractController.getAllContracts(req as any, res))
);

// Get contract by ID
router.get(
  '/:id',
  asyncHandler((req, res) => ContractController.getContract(req as any, res))
);

// Update contract
router.put(
  '/:id',
  authorize('admin', 'finance'),
  asyncHandler((req, res) => ContractController.updateContract(req as any, res))
);

// Approve contract
router.post(
  '/:id/approve',
  authorize('admin', 'finance'),
  asyncHandler((req, res) => ContractController.approveContract(req as any, res))
);

export default router;
