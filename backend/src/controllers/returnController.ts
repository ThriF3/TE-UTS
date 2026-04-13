import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import { ReturnService } from '../services/returnService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class ReturnController {
  static async createReturn(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const {
        return_type,
        transaction_id,
        contract_id,
        customer_id,
        total_refund,
        refund_type,
        refund_method,
        reason,
      } = req.body;

      if (!return_type || !customer_id || !reason) {
        return sendError(res, 'Missing required fields', 400);
      }

      const returnData = await ReturnService.createReturn({
        return_type,
        transaction_id: transaction_id ? BigInt(transaction_id) : undefined,
        contract_id: contract_id ? BigInt(contract_id) : undefined,
        customer_id: BigInt(customer_id),
        total_refund: parseFloat(total_refund) || 0,
        refund_type,
        refund_method,
        reason,
      });

      return sendSuccess(res, 'Return created successfully', returnData, 201);
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to create return', 500, error);
    }
  }

  static async getReturn(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const returnData = await ReturnService.getReturnById(BigInt(id));
      if (!returnData) {
        return sendError(res, 'Return not found', 404);
      }

      return sendSuccess(res, 'Return retrieved', returnData);
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to get return', 500, error);
    }
  }

  static async getAllReturns(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const customerId = req.query.customer_id ? BigInt(req.query.customer_id as string) : undefined;
      const status = req.query.status as string | undefined;

      const returns = await ReturnService.getAllReturns(limit, offset, customerId, status);
      const total = await ReturnService.countReturns();

      return sendSuccess(res, 'Returns retrieved', {
        data: returns,
        total,
        limit,
        offset,
      });
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to get returns', 500, error);
    }
  }

  static async approveReturn(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const { id } = req.params;

      const returnData = await ReturnService.approveReturn(BigInt(id), req.user.userId);

      return sendSuccess(res, 'Return approved successfully', returnData);
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to approve return', 500, error);
    }
  }
}
