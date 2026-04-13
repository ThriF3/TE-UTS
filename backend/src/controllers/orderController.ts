import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import { OrderService } from '../services/orderService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class OrderController {
  static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const {
        order_type,
        contract_id,
        customer_id,
        court_id,
        booking_date,
        booking_start,
        booking_end,
        total_amount,
      } = req.body;

      if (!order_type || !customer_id) {
        return sendError(res, 'Missing required fields', 400);
      }

      const order = await OrderService.createOrder({
        order_type,
        contract_id: contract_id ? BigInt(contract_id) : undefined,
        customer_id: BigInt(customer_id),
        court_id,
        booking_date: booking_date ? new Date(booking_date) : undefined,
        booking_start,
        booking_end,
        total_amount: parseFloat(total_amount) || 0,
        created_by: req.user.userId,
      });

      return sendSuccess(res, 'Order created successfully', order, 201);
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to create order', 500, error);
    }
  }

  static async getOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const order = await OrderService.getOrderById(BigInt(id));
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      return sendSuccess(res, 'Order retrieved', order);
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to get order', 500, error);
    }
  }

  static async getAllOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const customerId = req.query.customer_id ? BigInt(req.query.customer_id as string) : undefined;
      const status = req.query.status as string | undefined;

      const orders = await OrderService.getAllOrders(limit, offset, customerId, status);
      const total = await OrderService.countOrders();

      return sendSuccess(res, 'Orders retrieved', {
        data: orders,
        total,
        limit,
        offset,
      });
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to get orders', 500, error);
    }
  }

  static async approveOrder(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const { id } = req.params;

      const order = await OrderService.approveOrder(BigInt(id), req.user.userId);

      return sendSuccess(res, 'Order approved successfully', order);
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to approve order', 500, error);
    }
  }
}
