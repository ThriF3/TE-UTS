import { pool } from '../config/database.js';
import { StockItem } from '../types/index.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class StockService {
  static async createStockItem(data: Partial<StockItem>): Promise<StockItem> {
    try {
      const [result] = await pool.query<any>(
        `INSERT INTO stock_items 
         (sku, name, category, description, unit, stock_qty, min_stock, buy_price, sell_price, supplier_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.sku,
          data.name,
          data.category || null,
          data.description || null,
          data.unit || 'Pcs',
          data.stock_qty || 0,
          data.min_stock || 5,
          data.buy_price || 0,
          data.sell_price || 0,
          data.supplier_id || null,
        ]
      );

      const item = await this.getStockItemById(BigInt(result.insertId));
      if (!item) {
        throw new Error('Failed to create stock item');
      }

      return item;
    } catch (error) {
      throw error;
    }
  }

  static async getStockItemById(id: bigint): Promise<StockItem | null> {
    try {
      const [rows] = await pool.query<any[]>('SELECT * FROM stock_items WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  static async getStockItemBySku(sku: string): Promise<StockItem | null> {
    try {
      const [rows] = await pool.query<any[]>('SELECT * FROM stock_items WHERE sku = ?', [sku]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  static async getAllStockItems(
    limit: number = 10,
    offset: number = 0,
    category?: string
  ): Promise<StockItem[]> {
    try {
      let query = 'SELECT * FROM stock_items WHERE is_active = 1';
      const params: any[] = [];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await pool.query<any[]>(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getLowStockItems(): Promise<StockItem[]> {
    try {
      const [rows] = await pool.query<any[]>(
        'SELECT * FROM stock_items WHERE stock_qty <= min_stock AND is_active = 1 ORDER BY stock_qty ASC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async updateStockQuantity(id: bigint, quantity: number): Promise<StockItem> {
    try {
      await pool.query('UPDATE stock_items SET stock_qty = stock_qty + ? WHERE id = ?', [
        quantity,
        id,
      ]);

      const item = await this.getStockItemById(id);
      if (!item) {
        throw new NotFoundError('Stock item not found');
      }

      return item;
    } catch (error) {
      throw error;
    }
  }

  static async updateStockItem(id: bigint, updates: Partial<StockItem>): Promise<StockItem> {
    const allowedFields = ['name', 'category', 'description', 'unit', 'min_stock', 'buy_price', 'sell_price'];

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
      await pool.query(`UPDATE stock_items SET ${updateParts.join(', ')} WHERE id = ?`, values);

      const item = await this.getStockItemById(id);
      if (!item) {
        throw new NotFoundError('Stock item not found');
      }

      return item;
    } catch (error) {
      throw error;
    }
  }

  static async countStockItems(): Promise<number> {
    try {
      const [rows] = await pool.query<any[]>(
        'SELECT COUNT(*) as count FROM stock_items WHERE is_active = 1'
      );
      return rows[0]?.count || 0;
    } catch (error) {
      throw error;
    }
  }
}
