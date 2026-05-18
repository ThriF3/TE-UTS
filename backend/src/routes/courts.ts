// backend/src/routes/courtRoutes.ts
import { Router } from 'express';
import { CourtController } from '../controllers/courtController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(authMiddleware); // JWT auth
router.use(authorize('admin'));     // admin only for all routes under /courts

router.get('/', asyncHandler((req, res) => CourtController.list(req, res)));
router.get('/:id', asyncHandler((req, res) => CourtController.get(req, res)));
router.post('/', asyncHandler((req, res) => CourtController.create(req, res)));
router.put('/:id', asyncHandler((req, res) => CourtController.update(req, res)));
router.delete('/:id', asyncHandler((req, res) => CourtController.delete(req, res)));

export default router;
