export interface User {
  id: bigint;
  role_id: number;
  name: string;
  email: string;
  password_hash: string;
  phone?: string;
  address?: string;
  company_name?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuthPayload {
  userId: bigint;
  email: string;
  roleId: number;
  role: string;
}

export interface Contract {
  id: bigint;
  no_pks: string;
  title: string;
  party_first: string;
  party_second: string;
  party_third?: string;
  object_contract: string;
  quantity: number;
  unit: string;
  price: number;
  payment_type: 'cash' | 'TOP';
  top_days?: number;
  return_policy?: string;
  start_date: Date;
  end_date: Date;
  status: 'draft' | 'review' | 'active' | 'expired' | 'completed' | 'renewed' | 'terminated';
  file_url?: string;
  notes?: string;
  created_by: bigint;
  reviewed_by?: bigint;
  approved_by?: bigint;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: bigint;
  no_order: string;
  order_type: 'booking_lapangan' | 'order_barang' | 'order_suplai' | 'layanan_tambahan';
  contract_id?: bigint;
  customer_id: bigint;
  court_id?: number;
  booking_date?: Date;
  booking_start?: string;
  booking_end?: string;
  total_amount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  notes?: string;
  created_by: bigint;
  approved_by?: bigint;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: bigint;
  no_transaksi: string;
  order_id?: bigint;
  contract_id?: bigint;
  customer_id: bigint;
  kasir_id: bigint;
  subtotal: number;
  discount_amt: number;
  tax_pct: number;
  tax_amt: number;
  total_amount: number;
  status: 'open' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Return {
  id: bigint;
  no_retur: string;
  return_type: 'retur_barang' | 'pembatalan_booking' | 'koreksi_transaksi';
  transaction_id?: bigint;
  contract_id?: bigint;
  customer_id: bigint;
  total_refund: number;
  refund_type: 'full' | 'partial';
  refund_method: 'cash' | 'debit' | 'digital';
  reason: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  approved_by?: bigint;
  created_by: bigint;
  created_at: Date;
  updated_at: Date;
}

export interface StockItem {
  id: bigint;
  sku: string;
  name: string;
  category?: string;
  description?: string;
  unit: string;
  stock_qty: number;
  min_stock: number;
  buy_price: number;
  sell_price: number;
  supplier_id?: bigint;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// backend/src/types/index.ts
export interface CourtUnit {
  id: number;
  gor_location_id: number;
  name: string;
  court_type:
  | 'badminton'
  | 'futsal'
  | 'basket'
  | 'voli'
  | 'tenis'
  | 'serbaguna';
  price_per_hour: number;
  capacity?: number;
  description?: string;
  is_available: boolean;
  created_at: Date;
}

export interface GorLocation {
  id: number;
  name: string;
  address: string;
  city?: string;
  province?: string;
  phone?: string;
  email?: string;
  manager_id: bigint;
  is_active: number
  created_at: Date;
  updated_at?: Date;
}

export interface TransactionItem {
  id: bigint;
  transaction_id: bigint;
  stock_item_id?: bigint;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_pct: number;
  subtotal: number;
}

export interface CreateTransactionItemInput {
  transaction_id: bigint;
  stock_item_id?: bigint;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_pct?: number;
  subtotal: number;
}

export interface Payment {
  id: bigint;
  transaction_id: bigint;
  payment_method: 'cash' | 'debit' | 'credit' | 'digital';
  amount: number;
  cash_received?: number;
  cash_change?: number;
  card_number?: string;
  card_bank?: string;
  digital_provider?: string;
  reference_no?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  processed_at: Date;
  notes?: string;
}

export interface CreatePaymentInput {
  transaction_id: bigint;
  payment_method: 'cash' | 'debit' | 'credit' | 'digital';
  amount: number;
  cash_received?: number;
  cash_change?: number;
  card_number?: string;
  card_bank?: string;
  digital_provider?: string;
  reference_no?: string;
  status?: 'pending' | 'success' | 'failed' | 'refunded';
  notes?: string;
}