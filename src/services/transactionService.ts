import { ApiClient, ApiResponse } from './api';
import { PaymentMethod } from '../types';

// ── Response shapes (what the backend returns) ────────────────────────────────

export interface TransactionItem {
  id: number;
  transaction_id: number;
  stock_item_id?: number;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_pct: number;
  subtotal: number;
}

export interface TransactionPayment {
  id: number;
  transaction_id: number;
  payment_method: PaymentMethod;
  amount: number;
  cash_received?: number;
  cash_change?: number;
  card_number?: string;
  card_bank?: string;
  digital_provider?: string;
  reference_no?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  processed_at: string;
  notes?: string;
}

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
  // Enriched on single GET and on create response
  items?: TransactionItem[];
  payment?: TransactionPayment;   // create returns one payment object
  payments?: TransactionPayment[]; // getTransaction returns an array
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

// ── Request shapes (what we send to the backend) ──────────────────────────────

export interface CreateTransactionItemInput {
  item_id: string | number;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  subtotal: number;
  discount_pct?: number;
}

export interface CreateTransactionPaymentInput {
  method: PaymentMethod;
  amount: number;
  status?: 'pending' | 'success' | 'failed' | 'refunded';
  // cash
  cash_received?: number;
  // card
  card_number?: string;
  card_bank?: string;
  // digital
  digital_provider?: string;
  reference_no?: string;
}

export interface CreateTransactionRequest {
  customer_id: number;
  subtotal: number;
  discount_amt: number;
  tax_pct: number;
  tax_amt: number;
  total_amount: number;
  status?: 'open' | 'completed' | 'cancelled' | 'refunded';
  order_id?: number;
  contract_id?: number;
  notes?: string;
  items: CreateTransactionItemInput[];
  payment: CreateTransactionPaymentInput;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const transactionService = {
  async createTransaction(
    data: CreateTransactionRequest
  ): Promise<ApiResponse<Transaction>> {
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