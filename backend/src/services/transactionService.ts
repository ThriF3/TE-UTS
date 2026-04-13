import { pool } from '../config/database.js';
import { Transaction } from '../types/index.js';
import { generateNoTransaksi } from '../utils/generator.js';
import { NotFoundError } from '../utils/errors.js';

export class TransactionService {
  static async createTransaction(
    data: Partial<Transaction> & { kasir_id: bigint; customer_id: bigint }
  ): Promise<Transaction> {
    const no_transaksi = generateNoTransaksi();

    try {
      const [result] = await pool.query<any>(
        `INSERT INTO transactions 
         (no_transaksi, order_id, contract_id, customer_id, kasir_id, subtotal, discount_amt, tax_pct, tax_amt, total_amount, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          no_transaksi,
          data.order_id || null,
          data.contract_id || null,
          data.customer_id,
          data.kasir_id,
          data.subtotal || 0,
          data.discount_amt || 0,
          data.tax_pct || 0,
          data.tax_amt || 0,
          data.total_amount || 0,
          'completed',
        ]
      );

      const transaction = await this.getTransactionById(BigInt(result.insertId));
      if (!transaction) {
        throw new Error('Failed to create transaction');
      }

      return transaction;
    } catch (error) {
      throw error;
    }
  }

  static async getTransactionById(id: bigint): Promise<Transaction | null> {
    try {
      const [rows] = await pool.query<any[]>('SELECT * FROM transactions WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  static async getTransactionByNo(noTransaksi: string): Promise<Transaction | null> {
    try {
      const [rows] = await pool.query<any[]>(
        'SELECT * FROM transactions WHERE no_transaksi = ?',
        [noTransaksi]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  static async getAllTransactions(
    limit: number = 10,
    offset: number = 0,
    customerId?: bigint
  ): Promise<Transaction[]> {
    try {
      let query = 'SELECT * FROM transactions WHERE 1=1';
      const params: any[] = [];

      if (customerId) {
        query += ' AND customer_id = ?';
        params.push(customerId);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await pool.query<any[]>(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getTotalRevenue(startDate: Date, endDate: Date): Promise<number> {
    try {
      const [rows] = await pool.query<any[]>(
        'SELECT SUM(total_amount) as total FROM transactions WHERE created_at BETWEEN ? AND ?',
        [startDate, endDate]
      );
      return rows[0]?.total || 0;
    } catch (error) {
      throw error;
    }
  }

  static async getTransactionStats(): Promise<any> {
    try {
      const [rows] = await pool.query<any[]>(
        `SELECT 
          COUNT(*) as total_transactions,
          SUM(total_amount) as total_revenue,
          AVG(total_amount) as average_value
         FROM transactions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
      );
      return rows[0] || {};
    } catch (error) {
      throw error;
    }
  }

  static async countTransactions(): Promise<number> {
    try {
      const [rows] = await pool.query<any[]>('SELECT COUNT(*) as count FROM transactions');
      return rows[0]?.count || 0;
    } catch (error) {
      throw error;
    }
  }
}
