import { pool } from '../config/database.js';
import { Contract } from '../types/index.js';
import { generateNoPKS } from '../utils/generator.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class ContractService {
  static async createContract(data: Partial<Contract> & { created_by: bigint }): Promise<Contract> {
    const no_pks = generateNoPKS();

    try {
      const [result] = await pool.query<any>(
        `INSERT INTO contracts 
         (no_pks, title, party_first, party_second, party_third, object_contract, quantity, unit, price, payment_type, top_days, return_policy, start_date, end_date, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          no_pks,
          data.title,
          data.party_first,
          data.party_second,
          data.party_third || null,
          data.object_contract,
          data.quantity || 1,
          data.unit || 'Unit',
          data.price,
          data.payment_type || 'cash',
          data.top_days || null,
          data.return_policy || null,
          data.start_date,
          data.end_date,
          'draft',
          data.created_by,
        ]
      );

      const contract = await this.getContractById(BigInt(result.insertId));
      if (!contract) {
        throw new Error('Failed to create contract');
      }

      return contract;
    } catch (error) {
      throw error;
    }
  }

  static async getContractById(id: bigint): Promise<Contract | null> {
    try {
      const [rows] = await pool.query<any[]>('SELECT * FROM contracts WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  static async getContractByNoPKS(noPKS: string): Promise<Contract | null> {
    try {
      const [rows] = await pool.query<any[]>('SELECT * FROM contracts WHERE no_pks = ?', [noPKS]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  static async getAllContracts(
    limit: number = 10,
    offset: number = 0,
    status?: string
  ): Promise<Contract[]> {
    try {
      let query = 'SELECT * FROM contracts';
      const params: any[] = [];

      if (status) {
        query += ' WHERE status = ?';
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

  static async updateContract(id: bigint, updates: Partial<Contract>): Promise<Contract> {
    const allowedFields = [
      'title',
      'party_first',
      'party_second',
      'party_third',
      'object_contract',
      'quantity',
      'unit',
      'price',
      'payment_type',
      'top_days',
      'return_policy',
      'start_date',
      'end_date',
      'status',
      'file_url',
      'notes',
    ];

    const updateParts: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateParts.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateParts.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    values.push(id);

    try {
      await pool.query(`UPDATE contracts SET ${updateParts.join(', ')} WHERE id = ?`, values);

      const contract = await this.getContractById(id);
      if (!contract) {
        throw new NotFoundError('Contract not found');
      }

      return contract;
    } catch (error) {
      throw error;
    }
  }

  static async approveContract(contractId: bigint, approvedBy: bigint): Promise<Contract> {
    try {
      await pool.query('UPDATE contracts SET status = ?, approved_by = ? WHERE id = ?', [
        'active',
        approvedBy,
        contractId,
      ]);

      const contract = await this.getContractById(contractId);
      if (!contract) {
        throw new NotFoundError('Contract not found');
      }

      return contract;
    } catch (error) {
      throw error;
    }
  }

  static async countContracts(): Promise<number> {
    try {
      const [rows] = await pool.query<any[]>('SELECT COUNT(*) as count FROM contracts');
      return rows[0]?.count || 0;
    } catch (error) {
      throw error;
    }
  }
}
