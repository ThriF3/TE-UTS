import { ApiClient, ApiResponse } from './api';

export interface Transaction {
  id: number;
  no_transaksi: string;
  order_id?: number;
  contract_id?: number;
  customer_id: number;
  kasir_id: number;
  subtotal: number;
  discount_amt: number;
  tax_pct: number;
  tax_amt: number;
  total_amount: number;
  status: 'open' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionListResponse {
  data: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface TransactionStats {
  total_transactions: number;
  total_revenue: number;
  average_value: number;
}

export const transactionService = {
  async createTransaction(data: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    return ApiClient.post<Transaction>('/transactions', data);
  },

  async getTransaction(id: number | string): Promise<ApiResponse<Transaction>> {
    return ApiClient.get<Transaction>(`/transactions/${id}`);
  },

  async getTransactions(
    limit: number = 10,
    offset: number = 0,
    customerId?: number
  ): Promise<ApiResponse<TransactionListResponse>> {
    let endpoint = `/transactions?limit=${limit}&offset=${offset}`;
    if (customerId) endpoint += `&customer_id=${customerId}`;
    return ApiClient.get<TransactionListResponse>(endpoint);
  },

  async getStats(): Promise<ApiResponse<TransactionStats>> {
    return ApiClient.get<TransactionStats>('/transactions/stats/dashboard');
  },
};
