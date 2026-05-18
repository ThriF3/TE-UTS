import { Contract, Order, Transaction, Return, Court, StockItem, User, Payment } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Admin GOR', email: 'admin@gor.id', role: 'admin', phone: '081234567890', createdAt: '2024-01-01' },
  { id: 'u2', name: 'Budi Kasir', email: 'kasir@gor.id', role: 'kasir', phone: '081234567891', createdAt: '2024-01-05' },
  { id: 'u3', name: 'Sari Finance', email: 'finance@gor.id', role: 'finance', phone: '081234567892', createdAt: '2024-01-05' },
  { id: 'u4', name: 'PT Sportstuff', email: 'supplier@sportstuff.id', role: 'supplier', phone: '021-5551234', createdAt: '2024-02-01' },
  { id: 'u5', name: 'Toko Andi Sport', email: 'andi@sport.id', role: 'reseller', phone: '081298765432', createdAt: '2024-02-10' },
  { id: 'u6', name: 'Rudi Santoso', email: 'rudi@gmail.com', role: 'pelanggan', phone: '08129876543', createdAt: '2024-03-01' },
  { id: 'u7', name: 'Dian Pratiwi', email: 'dian@gmail.com', role: 'pelanggan', phone: '08129876544', createdAt: '2024-03-05' },
];

export const mockContracts: any[] = [
  {
    id: 'c1', noPKS: 'PKS/2024/001',
    title: 'Perjanjian Sewa Gerai Olahraga',
    partyFirst: 'GOR Maju Jaya', partySecond: 'Toko Andi Sport', partyThird: 'PT Sportstuff',
    objectContract: 'Sewa Gerai Olahraga No. 3 - Peralatan Badminton & Futsal',
    quantity: 1, unit: 'Unit Gerai', price: 3500000, paymentType: 'TOP', topDays: 30,
    returnPolicy: 'Barang tidak laku dikembalikan maksimal H+7 setelah masa kontrak berakhir, kondisi barang harus dalam keadaan baik dan kemasan tidak rusak.',
    startDate: '2024-01-01', endDate: '2024-12-31',
    status: 'active', createdAt: '2023-12-20', createdBy: 'u1'
  },
  {
    id: 'c2', noPKS: 'PKS/2024/002',
    title: 'Kontrak Suplai Barang Olahraga',
    partyFirst: 'GOR Maju Jaya', partySecond: 'PT Sportstuff',
    objectContract: 'Suplai Peralatan Olahraga - Raket, Shuttlecock, Bola Futsal',
    quantity: 500, unit: 'Pcs/Bulan', price: 25000000, paymentType: 'TOP', topDays: 14,
    returnPolicy: 'Retur barang cacat/rusak dalam 3 hari setelah pengiriman, disertai bukti foto.',
    startDate: '2024-01-01', endDate: '2024-06-30',
    status: 'active', createdAt: '2023-12-15', createdBy: 'u1'
  },
  {
    id: 'c3', noPKS: 'PKS/2024/003',
    title: 'Sewa Lapangan Futsal Bulanan',
    partyFirst: 'GOR Maju Jaya', partySecond: 'Rudi Santoso',
    objectContract: 'Sewa Lapangan Futsal No. 2 setiap Senin-Jumat 18:00-20:00',
    quantity: 2, unit: 'Jam/Hari', price: 150000, paymentType: 'cash',
    returnPolicy: 'Pembatalan booking H-1 mendapat refund 50%, H-2 atau lebih refund 100%.',
    startDate: '2024-03-01', endDate: '2024-05-31',
    status: 'completed', createdAt: '2024-02-25', createdBy: 'u1'
  },
  {
    id: 'c4', noPKS: 'PKS/2024/004',
    title: 'Kontrak Event Turnamen Badminton',
    partyFirst: 'GOR Maju Jaya', partySecond: 'Komunitas Badminton Bandung',
    objectContract: 'Sewa GOR untuk Turnamen Badminton 2 hari',
    quantity: 2, unit: 'Hari', price: 8000000, paymentType: 'cash',
    returnPolicy: 'Tidak ada refund untuk pembatalan < H-7.',
    startDate: '2024-07-15', endDate: '2024-07-16',
    status: 'active', createdAt: '2024-06-01', createdBy: 'u1'
  },
];

export const mockCourts: Court[] = [
  { id: 'ct1', name: 'Lapangan Badminton 1', type: 'badminton', pricePerHour: 50000, isAvailable: true },
  { id: 'ct2', name: 'Lapangan Badminton 2', type: 'badminton', pricePerHour: 50000, isAvailable: false },
  { id: 'ct3', name: 'Lapangan Badminton 3', type: 'badminton', pricePerHour: 50000, isAvailable: true },
  { id: 'ct4', name: 'Lapangan Futsal 1', type: 'futsal', pricePerHour: 150000, isAvailable: true },
  { id: 'ct5', name: 'Lapangan Futsal 2', type: 'futsal', pricePerHour: 150000, isAvailable: true },
  { id: 'ct6', name: 'Lapangan Basket', type: 'basket', pricePerHour: 100000, isAvailable: false },
  { id: 'ct7', name: 'Aula Serbaguna', type: 'serbaguna', pricePerHour: 500000, isAvailable: true },
];

export const mockStock: StockItem[] = [
  { id: 's1', name: 'Raket Badminton Yonex', sku: 'RKT-001', category: 'Peralatan', stock: 45, unit: 'Pcs', buyPrice: 250000, sellPrice: 350000, supplierId: 'u4', supplierName: 'PT Sportstuff' },
  { id: 's2', name: 'Shuttlecock Speed 77', sku: 'SHC-001', category: 'Perlengkapan', stock: 200, unit: 'Dus', buyPrice: 35000, sellPrice: 55000, supplierId: 'u4', supplierName: 'PT Sportstuff' },
  { id: 's3', name: 'Bola Futsal Mikasa', sku: 'BLF-001', category: 'Peralatan', stock: 20, unit: 'Pcs', buyPrice: 180000, sellPrice: 250000, supplierId: 'u4', supplierName: 'PT Sportstuff' },
  { id: 's4', name: 'Sepatu Olahraga Specs', sku: 'SPT-001', category: 'Apparel', stock: 60, unit: 'Pasang', buyPrice: 350000, sellPrice: 500000, supplierId: 'u4', supplierName: 'PT Sportstuff' },
  { id: 's5', name: 'Air Mineral 600ml', sku: 'AMN-001', category: 'Konsumsi', stock: 300, unit: 'Botol', buyPrice: 2500, sellPrice: 5000 },
  { id: 's6', name: 'Grip Tape Badminton', sku: 'GRP-001', category: 'Aksesori', stock: 100, unit: 'Roll', buyPrice: 15000, sellPrice: 25000, supplierId: 'u4', supplierName: 'PT Sportstuff' },
  { id: 's7', name: 'Kaos GOR Edition', sku: 'KOS-001', category: 'Merchandise', stock: 80, unit: 'Pcs', buyPrice: 55000, sellPrice: 85000 },
  { id: 's8', name: 'Tas Olahraga Nike', sku: 'TAS-001', category: 'Apparel', stock: 30, unit: 'Pcs', buyPrice: 200000, sellPrice: 280000, supplierId: 'u4', supplierName: 'PT Sportstuff' },
];

export const mockOrders: any[] = [
  {
    id: 'o1', noOrder: 'ORD/2024/001', type: 'booking_lapangan',
    customerId: 'u6', customerName: 'Rudi Santoso', contractId: 'c3',
    items: [{ id: 'oi1', orderId: 'o1', itemName: 'Lapangan Futsal 2', description: '18:00-20:00', quantity: 2, unit: 'Jam', unitPrice: 150000, discount: 0, subtotal: 300000 }],
    status: 'paid', totalAmount: 300000,
    bookingDate: '2024-07-20', bookingStart: '18:00', bookingEnd: '20:00', courtId: 'ct5', courtName: 'Lapangan Futsal 2',
    createdAt: '2024-07-18', createdBy: 'u6'
  },
  {
    id: 'o2', noOrder: 'ORD/2024/002', type: 'order_barang',
    customerId: 'u5', customerName: 'Toko Andi Sport', contractId: 'c1',
    items: [
      { id: 'oi2', orderId: 'o2', itemName: 'Raket Badminton Yonex', quantity: 10, unit: 'Pcs', unitPrice: 350000, discount: 0.05, subtotal: 3325000 },
      { id: 'oi3', orderId: 'o2', itemName: 'Shuttlecock Speed 77', quantity: 20, unit: 'Dus', unitPrice: 55000, discount: 0, subtotal: 1100000 },
    ],
    status: 'approved', totalAmount: 4425000,
    createdAt: '2024-07-15', createdBy: 'u5'
  },
  {
    id: 'o3', noOrder: 'ORD/2024/003', type: 'booking_lapangan',
    customerId: 'u7', customerName: 'Dian Pratiwi',
    items: [{ id: 'oi4', orderId: 'o3', itemName: 'Lapangan Badminton 1', description: '08:00-10:00', quantity: 2, unit: 'Jam', unitPrice: 50000, discount: 0, subtotal: 100000 }],
    status: 'pending', totalAmount: 100000,
    bookingDate: '2024-07-22', bookingStart: '08:00', bookingEnd: '10:00', courtId: 'ct1', courtName: 'Lapangan Badminton 1',
    createdAt: '2024-07-19', createdBy: 'u7'
  },
];

export const mockTransactions: any[] = [
  {
    id: 't1', noTransaksi: 'TRX/2024/001',
    orderId: 'o1', contractId: 'c3',
    customerId: 'u6', customerName: 'Rudi Santoso',
    items: [{ id: 'ti1', orderId: 't1', itemName: 'Lapangan Futsal 2 (2 Jam)', quantity: 2, unit: 'Jam', unitPrice: 150000, discount: 0, subtotal: 300000 }],
    subtotal: 300000, discount: 0, tax: 0, totalAmount: 300000,
    payment: { id: 'p1', transactionId: 't1', method: 'cash', amount: 300000, cashReceived: 350000, cashChange: 50000, status: 'success', processedAt: '2024-07-20T18:05:00' },
    status: 'completed', kasirId: 'u2', kasirName: 'Budi Kasir', createdAt: '2024-07-20T18:00:00'
  },
  {
    id: 't2', noTransaksi: 'TRX/2024/002',
    customerId: 'u6', customerName: 'Rudi Santoso',
    items: [
      { id: 'ti2', orderId: 't2', itemName: 'Raket Badminton Yonex', quantity: 1, unit: 'Pcs', unitPrice: 350000, discount: 0, subtotal: 350000 },
      { id: 'ti3', orderId: 't2', itemName: 'Shuttlecock Speed 77', quantity: 2, unit: 'Dus', unitPrice: 55000, discount: 0, subtotal: 110000 },
    ],
    subtotal: 460000, discount: 0, tax: 0, totalAmount: 460000,
    payment: { id: 'p2', transactionId: 't2', method: 'digital', amount: 460000, digitalProvider: 'GoPay', referenceNo: 'GP20240720001', status: 'success', processedAt: '2024-07-20T15:30:00' },
    status: 'completed', kasirId: 'u2', kasirName: 'Budi Kasir', createdAt: '2024-07-20T15:25:00'
  },
  {
    id: 't3', noTransaksi: 'TRX/2024/003',
    customerId: 'u7', customerName: 'Dian Pratiwi',
    items: [
      { id: 'ti4', orderId: 't3', itemName: 'Air Mineral 600ml', quantity: 3, unit: 'Botol', unitPrice: 5000, discount: 0, subtotal: 15000 },
      { id: 'ti5', orderId: 't3', itemName: 'Grip Tape Badminton', quantity: 2, unit: 'Roll', unitPrice: 25000, discount: 0, subtotal: 50000 },
    ],
    subtotal: 65000, discount: 0, tax: 0, totalAmount: 65000,
    payment: { id: 'p3', transactionId: 't3', method: 'debit', amount: 65000, cardNumber: '****3456', cardBank: 'BCA', referenceNo: 'BCA20240721001', status: 'success', processedAt: '2024-07-21T10:15:00' },
    status: 'completed', kasirId: 'u2', kasirName: 'Budi Kasir', createdAt: '2024-07-21T10:10:00'
  },
];

export const mockReturns: any[] = [
  {
    id: 'r1', noRetur: 'RTR/2024/001', type: 'retur_barang',
    transactionId: 't2', noTransaksi: 'TRX/2024/002',
    customerId: 'u6', customerName: 'Rudi Santoso',
    items: [{ id: 'ri1', returnId: 'r1', itemName: 'Shuttlecock Speed 77', quantity: 1, unitPrice: 55000, reason: 'Bulu shuttlecock cacat produksi', subtotal: 55000 }],
    totalRefund: 55000, refundType: 'partial', refundMethod: 'cash',
    reason: 'Barang cacat produksi', status: 'completed',
    approvedBy: 'u1', createdAt: '2024-07-22', createdBy: 'u6'
  },
];
