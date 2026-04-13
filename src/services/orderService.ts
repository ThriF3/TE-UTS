import { ApiClient, ApiResponse } from './api';

export interface Order {
  id: number;
  no_order: string;
  order_type: 'booking_lapangan' | 'order_barang' | 'order_suplai' | 'layanan_tambahan';
  contract_id?: number;
  customer_id: number;
  court_id?: number;
  booking_date?: string;
  booking_start?: string;
  booking_end?: string;
  total_amount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderListResponse {
  data: Order[];
  total: number;
  limit: number;
  offset: number;
}

export const orderService = {
  async createOrder(data: Partial<Order>): Promise<ApiResponse<Order>> {
    return ApiClient.post<Order>('/orders', data);
  },

  async getOrder(id: number | string): Promise<ApiResponse<Order>> {
    return ApiClient.get<Order>(`/orders/${id}`);
  },

  async getOrders(
    limit: number = 10,
    offset: number = 0,
    customerId?: number,
    status?: string
  ): Promise<ApiResponse<OrderListResponse>> {
    let endpoint = `/orders?limit=${limit}&offset=${offset}`;
    if (customerId) endpoint += `&customer_id=${customerId}`;
    if (status) endpoint += `&status=${status}`;
    return ApiClient.get<OrderListResponse>(endpoint);
  },

  async approveOrder(id: number | string): Promise<ApiResponse<Order>> {
    return ApiClient.post<Order>(`/orders/${id}/approve`);
  },
};
