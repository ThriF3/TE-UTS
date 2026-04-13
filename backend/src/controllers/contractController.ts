import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import { ContractService } from '../services/contractService.js';
import { AuthenticatedRequest, authorize } from '../middleware/auth.js';

export class ContractController {
  static async createContract(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const {
        title,
        party_first,
        party_second,
        party_third,
        object_contract,
        quantity,
        unit,
        price,
        payment_type,
        top_days,
        return_policy,
        start_date,
        end_date,
      } = req.body;

      if (!title || !party_first || !party_second || !object_contract || !start_date || !end_date) {
        return sendError(res, 'Missing required fields', 400);
      }

      const contract = await ContractService.createContract({
        title,
        party_first,
        party_second,
        party_third,
        object_contract,
        quantity,
        unit,
        price,
        payment_type,
        top_days,
        return_policy,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        created_by: req.user.userId,
      });

      return sendSuccess(res, 'Contract created successfully', contract, 201);
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to create contract', 500, error);
    }
  }

  static async getContract(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const contract = await ContractService.getContractById(BigInt(id));
      if (!contract) {
        return sendError(res, 'Contract not found', 404);
      }

      return sendSuccess(res, 'Contract retrieved', contract);
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to get contract', 500, error);
    }
  }

  static async getAllContracts(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const status = req.query.status as string | undefined;

      const contracts = await ContractService.getAllContracts(limit, offset, status);
      const total = await ContractService.countContracts();

      return sendSuccess(res, 'Contracts retrieved', {
        data: contracts,
        total,
        limit,
        offset,
      });
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to get contracts', 500, error);
    }
  }

  static async updateContract(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const contract = await ContractService.updateContract(BigInt(id), req.body);

      return sendSuccess(res, 'Contract updated successfully', contract);
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to update contract', 500, error);
    }
  }

  static async approveContract(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const { id } = req.params;

      const contract = await ContractService.approveContract(BigInt(id), req.user.userId);

      return sendSuccess(res, 'Contract approved successfully', contract);
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to approve contract', 500, error);
    }
  }
}
