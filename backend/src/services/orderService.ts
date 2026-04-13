import { pool } from '../config/database.js';
import { Order } from '../types/index.js';
import { generateNoOrder } from '../utils/generator.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class OrderService {
  static async createOrder(data: Partial<Order> & { created_by: bigint }): Promise<Order> {
    const no_order = generateNoOrder();

    try {
      const [result] = await pool.query<any>(
        `INSERT INTO orders 
         (no_order, order_type, contract_id, customer_id, court_id, booking_date, booking_start, booking_end, total_amount, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          no_order,
          data.order_type,
          data.contract_id || null,
          data.customer_id,
          data.court_id || null,
          data.booking_date || null,
          data.booking_start || null,
          data.booking_end || null,
          data.total_amount || 0,
          'pending',
          data.created_by,
        ]
      );

      const order = await this.getOrderById(BigInt(result.insertId));
      if (!order) {
        throw new Error('Failed to create order');
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  static async getOrderById(id: bigint): Promise<Order | null> {
    try {
      const [rows] = await pool.query<any[]>('SELECT * FROM orders WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  static async getOrderByNoOrder(noOrder: string): Promise<Order | null> {
    try {
      const [rows] = await pool.query<any[]>('SELECT * FROM orders WHERE no_order = ?', [
        noOrder,
      ]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  static async getAllOrders(
    limit: number = 10,
    offset: number = 0,
    customerId?: bigint,
    status?: string
  ): Promise<Order[]> {
    try {
      let query = 'SELECT * FROM orders WHERE 1=1';
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

  static async updateOrder(id: bigint, updates: Partial<Order>): Promise<Order> {
    const allowedFields = ['total_amount', 'status', 'notes', 'approved_by'];

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
      await pool.query(`UPDATE orders SET ${updateParts.join(', ')} WHERE id = ?`, values);

      const order = await this.getOrderById(id);
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  static async approveOrder(orderId: bigint, approvedBy: bigint): Promise<Order> {
    try {
      await pool.query('UPDATE orders SET status = ?, approved_by = ? WHERE id = ?', [
        'approved',
        approvedBy,
        orderId,
      ]);

      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  static async countOrders(): Promise<number> {
    try {
      const [rows] = await pool.query<any[]>('SELECT COUNT(*) as count FROM orders');
      return rows[0]?.count || 0;
    } catch (error) {
      throw error;
    }
  }
}
