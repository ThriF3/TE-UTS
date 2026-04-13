import { Router, Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';

const router = Router();

// Health check
router.get('/health', (req: Request, res: Response) => {
  sendSuccess(res, 'Server is running', { timestamp: new Date().toISOString() });
});

// Status
router.get('/status', (req: Request, res: Response) => {
  sendSuccess(res, 'API is healthy', {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
