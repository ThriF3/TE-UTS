import { Router } from 'express';
import { GorLocationController } from '../controllers/gorLocationController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/', asyncHandler((req, res) => GorLocationController.listGorLocations(req as any, res)));
router.get('/:id', asyncHandler((req, res) => GorLocationController.getGorLocationById(req as any, res)));
router.post('/', asyncHandler((req, res) => GorLocationController.createGorLocation(req as any, res)));
router.put('/:id', asyncHandler((req, res) => GorLocationController.updateGorLocation(req as any, res)));
router.patch('/:id/active', asyncHandler((req, res) => GorLocationController.setActive(req as any, res)));
router.delete('/:id', asyncHandler((req, res) => GorLocationController.deleteGorLocation(req as any, res)));

export default router;
