import { ApiClient, ApiResponse } from './api';

export interface Return {
  id: number;
  no_retur: string;
  return_type: 'retur_barang' | 'pembatalan_booking' | 'koreksi_transaksi';
  transaction_id?: number;
  contract_id?: number;
  customer_id: number;
  total_refund: number;
  refund_type: 'full' | 'partial';
  refund_method: 'cash' | 'debit' | 'digital';
  reason: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  approved_by?: number;
  created_at: string;
  updated_at: string;
}

export interface ReturnListResponse {
  data: Return[];
  total: number;
  limit: number;
  offset: number;
}

export const returnService = {
  async createReturn(data: Partial<Return>): Promise<ApiResponse<Return>> {
    return ApiClient.post<Return>('/returns', data);
  },

  async getReturn(id: number | string): Promise<ApiResponse<Return>> {
    return ApiClient.get<Return>(`/returns/${id}`);
  },

  async getReturns(
    limit: number = 10,
    offset: number = 0,
    customerId?: number,
    status?: string
  ): Promise<ApiResponse<ReturnListResponse>> {
    let endpoint = `/returns?limit=${limit}&offset=${offset}`;
    if (customerId) endpoint += `&customer_id=${customerId}`;
    if (status) endpoint += `&status=${status}`;
    return ApiClient.get<ReturnListResponse>(endpoint);
  },

  async approveReturn(id: number | string): Promise<ApiResponse<Return>> {
    return ApiClient.post<Return>(`/returns/${id}/approve`);
  },

  async completeReturn(id: number | string): Promise<ApiResponse<Return>> {
    return ApiClient.post<Return>(`/returns/${id}/complete`);
  },

  async rejectReturn(id: number | string): Promise<ApiResponse<Return>> {
    return ApiClient.post<Return>(`/returns/${id}/reject`);
  },
};
