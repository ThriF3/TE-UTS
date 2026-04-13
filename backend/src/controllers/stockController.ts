import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import { StockService } from '../services/stockService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class StockController {
  static async createStockItem(req: AuthenticatedRequest, res: Response) {
    try {
      const { sku, name, category, description, unit, stock_qty, min_stock, buy_price, sell_price, supplier_id } = req.body;

      if (!sku || !name) {
        return sendError(res, 'SKU and name are required', 400);
      }

      const item = await StockService.createStockItem({
        sku,
        name,
        category,
        description,
        unit,
        stock_qty,
        min_stock,
        buy_price: parseFloat(buy_price) || 0,
        sell_price: parseFloat(sell_price) || 0,
        supplier_id: supplier_id ? BigInt(supplier_id) : undefined,
      });

      return sendSuccess(res, 'Stock item created successfully', item, 201);
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to create stock item', 500, error);
    }
  }

  static async getStockItem(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const item = await StockService.getStockItemById(BigInt(id));
      if (!item) {
        return sendError(res, 'Stock item not found', 404);
      }

      return sendSuccess(res, 'Stock item retrieved', item);
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to get stock item', 500, error);
    }
  }

  static async getAllStockItems(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const category = req.query.category as string | undefined;

      const items = await StockService.getAllStockItems(limit, offset, category);
      const total = await StockService.countStockItems();

      return sendSuccess(res, 'Stock items retrieved', {
        data: items,
        total,
        limit,
        offset,
      });
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to get stock items', 500, error);
    }
  }

  static async getLowStockItems(req: AuthenticatedRequest, res: Response) {
    try {
      const items = await StockService.getLowStockItems();

      return sendSuccess(res, 'Low stock items retrieved', items);
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to get low stock items', 500, error);
    }
  }

  static async updateStockItem(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const item = await StockService.updateStockItem(BigInt(id), req.body);

      return sendSuccess(res, 'Stock item updated successfully', item);
    } catch (error) {
      return sendError(res, (error as any).message || 'Failed to update stock item', 500, error);
    }
  }

  static async updateStockQuantity(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined) {
        return sendError(res, 'Quantity is required', 400);
      }

      const item = await StockService.updateStockQuantity(BigInt(id), parseInt(quantity));

      return sendSuccess(res, 'Stock quantity updated successfully', item);
    } catch (error) {
      return sendError(
        res,
        (error as any).message || 'Failed to update stock quantity',
        500,
        error
      );
    }
  }
}
