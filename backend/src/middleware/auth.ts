import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: bigint;
    email: string;
    roleId: number;
    role: string;
  };
  token?: string;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    req.user = payload;
    req.token = token;

    next();
  } catch (error) {
    const message = (error as any).message || 'Authentication failed';
    res.status(401).json({
      success: false,
      message,
    });
  }
};

type RoleType = 'admin' | 'kasir' | 'finance' | 'supplier' | 'reseller' | 'pelanggan';

export const authorize = (...allowedRoles: RoleType[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role as RoleType)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};
