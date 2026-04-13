export type UserRole = 'admin' | 'kasir' | 'finance' | 'supplier' | 'reseller' | 'pelanggan';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  createdAt: string;
}

export type ContractStatus = 'draft' | 'review' | 'active' | 'expired' | 'completed' | 'renewed' | 'terminated';
export type PaymentType = 'cash' | 'TOP';

export interface Contract {
  id: string;
  noPKS: string;
  title: string;
  partyFirst: string;  // Vendor/GOR
  partySecond: string; // Supplier/Reseller/Pelanggan
  partyThird?: string;
  objectContract: string;
  quantity: number;
  unit: string;
  price: number;
  paymentType: PaymentType;
  topDays?: number;
  returnPolicy: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  fileUrl?: string;
  createdAt: string;
  createdBy: string;
}

export type OrderStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
export type OrderType = 'booking_lapangan' | 'order_barang' | 'order_suplai' | 'layanan_tambahan';

export interface OrderItem {
  id: string;
  orderId: string;
  itemName: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export interface Order {
  id: string;
  noOrder: string;
  type: OrderType;
  customerId: string;
  customerName: string;
  contractId?: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  bookingDate?: string;
  bookingStart?: string;
  bookingEnd?: string;
  courtId?: string;
  courtName?: string;
  createdAt: string;
  createdBy: string;
}

export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'digital';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type TransactionStatus = 'open' | 'completed' | 'cancelled' | 'refunded';

export interface Payment {
  id: string;
  transactionId: string;
  method: PaymentMethod;
  amount: number;
  cashReceived?: number;
  cashChange?: number;
  cardNumber?: string;
  cardBank?: string;
  digitalProvider?: string;
  referenceNo?: string;
  status: PaymentStatus;
  processedAt: string;
}

export interface Transaction {
  id: string;
  noTransaksi: string;
  orderId?: string;
  contractId?: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  payment?: Payment;
  status: TransactionStatus;
  kasirId: string;
  kasirName: string;
  createdAt: string;
}

export type ReturnStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
export type ReturnType = 'retur_barang' | 'pembatalan_booking' | 'koreksi_transaksi';

export interface ReturnItem {
  id: string;
  returnId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  reason: string;
  subtotal: number;
}

export interface Return {
  id: string;
  noRetur: string;
  type: ReturnType;
  transactionId: string;
  noTransaksi: string;
  customerId: string;
  customerName: string;
  contractId?: string;
  items: ReturnItem[];
  totalRefund: number;
  refundType: 'full' | 'partial';
  refundMethod: PaymentMethod;
  reason: string;
  status: ReturnStatus;
  approvedBy?: string;
  createdAt: string;
  createdBy: string;
}

export interface Court {
  id: string;
  name: string;
  type: 'badminton' | 'futsal' | 'basket' | 'voli' | 'tenis' | 'serbaguna';
  pricePerHour: number;
  isAvailable: boolean;
  description?: string;
}

export interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  supplierId?: string;
  supplierName?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeContracts: number;
  todayTransactions: number;
  pendingReturns: number;
  availableCourts: number;
}
