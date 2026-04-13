import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import { TransactionService } from '../services/transactionService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class TransactionController {
  static async createTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const {
        order_id,
        contract_id,
        customer_id,
        subtotal,
        discount_amt,
        tax_pct,
        tax_amt,
        total_amount,
      } = req.body;

      if (!customer_id || total_amount === undefined) {
        return sendError(res, 'Missing required fields', 400);
      }

      const transaction = await TransactionService.createTransaction({
        order_id: order_id ? BigInt(order_id) : undefined,
        contract_id: contract_id ? BigInt(contract_id) : undefined,
        customer_id: BigInt(customer_id),
        kasir_id: req.user.userId,
        subtotal: parseFloat(subtotal) || 0,
        discount_amt: parseFloat(discount_amt) || 0,
        tax_pct: parseFloat(tax_pct) || 0,
        tax_amt: parseFloat(tax_amt) || 0,
        total_amount: parseFloat(total_amount),
      });

      return sendSuccess(res, 'Transaction created successfully', transaction, 201);
    } catch (error) {
      return sendError(
        res,
        (error as any).message || 'Failed to create transaction',
        500,
        error
      );
    }
  }

  static async getTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const transaction = await TransactionService.getTransactionById(BigInt(id));
      if (!transaction) {
        return sendError(res, 'Transaction not found', 404);
      }

      return sendSuccess(res, 'Transaction retrieved', transaction);
    } catch (error) {
      return sendError(
        res,
        (error as any).message || 'Failed to get transaction',
        500,
        error
      );
    }
  }

  static async getAllTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const customerId = req.query.customer_id ? BigInt(req.query.customer_id as string) : undefined;

      const transactions = await TransactionService.getAllTransactions(limit, offset, customerId);
      const total = await TransactionService.countTransactions();

      return sendSuccess(res, 'Transactions retrieved', {
        data: transactions,
        total,
        limit,
        offset,
      });
    } catch (error) {
      return sendError(
        res,
        (error as any).message || 'Failed to get transactions',
        500,
        error
      );
    }
  }

  static async getTransactionStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await TransactionService.getTransactionStats();

      return sendSuccess(res, 'Transaction stats retrieved', stats);
    } catch (error) {
      return sendError(
        res,
        (error as any).message || 'Failed to get stats',
        500,
        error
      );
    }
  }
}
