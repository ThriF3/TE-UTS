import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Public routes
router.post('/register', asyncHandler((req, res) => AuthController.register(req, res)));
router.post('/login', asyncHandler((req, res) => AuthController.login(req, res)));

// Protected routes
router.use(authMiddleware);

router.get('/me', asyncHandler((req, res) => AuthController.getCurrentUser(req as any, res)));
router.put('/profile', asyncHandler((req, res) => AuthController.updateProfile(req as any, res)));
router.post('/change-password', asyncHandler((req, res) => AuthController.changePassword(req as any, res)));

export default router;
