import { pool } from '../config/database.js';
import { Return } from '../types/index.js';
import { generateNoRetur } from '../utils/generator.js';
import { NotFoundError } from '../utils/errors.js';

export class ReturnService {
  static async createReturn(
    data: Partial<Return> & { customer_id: bigint }
  ): Promise<Return> {
    const no_retur = generateNoRetur();

    try {
      const [result] = await pool.query<any>(
        `INSERT INTO returns 
         (no_retur, return_type, transaction_id, contract_id, customer_id, total_refund, refund_type, refund_method, reason, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          no_retur,
          data.return_type,
          data.transaction_id || null,
          data.contract_id || null,
          data.customer_id,
          data.total_refund || 0,
          data.refund_type || 'partial',
          data.refund_method || 'cash',
          data.reason,
          'pending',
          data.created_by,
        ]
      );

      const returnData = await this.getReturnById(BigInt(result.insertId));
      if (!returnData) {
        throw new Error('Failed to create return');
      }

      return returnData;
    } catch (error) {
      throw error;
    }
  }

  static async getReturnById(id: bigint): Promise<Return | null> {
    try {
      const [rows] = await pool.query<any[]>('SELECT * FROM returns WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  static async getReturnByNoRetur(noRetur: string): Promise<Return | null> {
    try {
      const [rows] = await pool.query<any[]>('SELECT * FROM returns WHERE no_retur = ?', [
        noRetur,
      ]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  static async getAllReturns(
    limit: number = 10,
    offset: number = 0,
    customerId?: bigint,
    status?: string
  ): Promise<Return[]> {
    try {
      let query = 'SELECT * FROM returns WHERE 1=1';
      const params: any[] = [];

      if (customerId) {
        query += ' AND customer_id = ?';
        params.push(customerId);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await pool.query<any[]>(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async approveReturn(returnId: bigint, approvedBy: bigint): Promise<Return> {
    try {
      await pool.query('UPDATE returns SET status = ?, approved_by = ? WHERE id = ?', [
        'approved',
        approvedBy,
        returnId,
      ]);

      const returnData = await this.getReturnById(returnId);
      if (!returnData) {
        throw new NotFoundError('Return not found');
      }

      return returnData;
    } catch (error) {
      throw error;
    }
  }

  static async countReturns(): Promise<number> {
    try {
      const [rows] = await pool.query<any[]>('SELECT COUNT(*) as count FROM returns');
      return rows[0]?.count || 0;
    } catch (error) {
      throw error;
    }
  }

  static async completeReturn(returnId: bigint, completedBy: bigint): Promise<Return> {
    try {
      await pool.query('UPDATE returns SET status = ? WHERE id = ?', [
        'completed',
        returnId,
      ]);

      const returnData = await this.getReturnById(returnId);
      if (!returnData) {
        throw new NotFoundError('Return not found');
      }

      return returnData;
    } catch (error) {
      throw error;
    }
  }

  static async rejectReturn(returnId: bigint, rejectedBy: bigint): Promise<Return> {
    try {
      await pool.query('UPDATE returns SET status = ? WHERE id = ?', [
        'rejected',
        returnId,
      ]);

      const returnData = await this.getReturnById(returnId);
      if (!returnData) {
        throw new NotFoundError('Return not found');
      }

      return returnData;
    } catch (error) {
      throw error;
    }
  }
}
