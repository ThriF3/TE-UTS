import { ApiClient, ApiResponse } from './api';

export interface StockItem {
  id: number;
  sku: string;
  name: string;
  category?: string;
  description?: string;
  unit: string;
  stock_qty: number;
  min_stock: number;
  buy_price: number;
  sell_price: number;
  supplier_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockListResponse {
  data: StockItem[];
  total: number;
  limit: number;
  offset: number;
}

export const stockService = {
  async createStockItem(data: Partial<StockItem>): Promise<ApiResponse<StockItem>> {
    return ApiClient.post<StockItem>('/stock', data);
  },

  async getStockItem(id: number | string): Promise<ApiResponse<StockItem>> {
    return ApiClient.get<StockItem>(`/stock/${id}`);
  },

  async getStockItems(
    limit: number = 10,
    offset: number = 0,
    category?: string
  ): Promise<ApiResponse<StockListResponse>> {
    let endpoint = `/stock?limit=${limit}&offset=${offset}`;
    if (category) endpoint += `&category=${category}`;
    return ApiClient.get<StockListResponse>(endpoint);
  },

  async getLowStockItems(): Promise<ApiResponse<StockItem[]>> {
    return ApiClient.get<StockItem[]>('/stock/alert/low-stock');
  },

  async updateStockItem(id: number | string, data: Partial<StockItem>): Promise<ApiResponse<StockItem>> {
    return ApiClient.put<StockItem>(`/stock/${id}`, data);
  },

  async updateStockQuantity(id: number | string, quantity: number): Promise<ApiResponse<StockItem>> {
    return ApiClient.patch<StockItem>(`/stock/${id}/quantity`, { quantity });
  },
};
