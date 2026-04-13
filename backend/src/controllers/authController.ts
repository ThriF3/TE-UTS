import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthService } from '../services/authService.js';
import { generateToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, phone, address, company_name, role_id } = req.body;

      if (!name || !email || !password) {
        return sendError(res, 'Name, email, and password are required', 400);
      }

      const user = await AuthService.createUser({
        role_id: role_id || 6, // Default to 'pelanggan' role
        name,
        email,
        password,
        phone,
        address,
        company_name,
      });

      const payload = {
        userId: user.id,
        email: user.email,
        roleId: user.role_id,
        role: (user as any).role,
      };

      const token = generateToken(payload);

      return sendSuccess(res, 'User registered successfully', {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user as any).role,
        },
        token,
      }, 201);
    } catch (error) {
      return sendError(res, (error as any).message || 'Registration failed', 500, error);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400);
      }

      const user = await AuthService.getUserByEmail(email);
      if (!user) {
        return sendError(res, 'Invalid email or password', 401);
      }

      const isPasswordValid = await AuthService.verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        return sendError(res, 'Invalid email or password', 401);
      }

      if (!user.is_active) {
        return sendError(res, 'User account is inactive', 403);
      }

      const payload = {
        userId: user.id,
        email: user.email,
        roleId: user.role_id,
        role: (user as any).role,
      };

      const token = generateToken(payload);

      return sendSuccess(res, 'Login successful', {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user as any).role,
        },
        token,
      });
    } catch (error) {
      return sendError(res, (error as any).message || 'Login failed', 500, error);
    }
  }

  static async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const user = await AuthService.getUserById(req.user.userId);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, 'User profile retrieved', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: (user as any).role,
        phone: user.phone,
        address: user.address,
        company_name: user.company_name,
        is_active: user.is_active,
      });
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to get user', 500, error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const { name, phone, address, company_name } = req.body;

      const user = await AuthService.updateProfile(req.user.userId, {
        name,
        phone,
        address,
        company_name,
      } as Partial<any>);

      return sendSuccess(res, 'Profile updated successfully', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: (user as any).role,
        phone: user.phone,
        address: user.address,
      });
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to update profile', 500, error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return sendError(res, 'All password fields are required', 400);
      }

      if (newPassword !== confirmPassword) {
        return sendError(res, 'New password and confirm password do not match', 400);
      }

      if (newPassword.length < 6) {
        return sendError(res, 'New password must be at least 6 characters', 400);
      }

      await AuthService.changePassword(req.user.userId, currentPassword, newPassword);

      return sendSuccess(res, 'Password changed successfully');
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to change password', 500, error);
    }
  }
}
