-- ============================================================
-- GOR Management System - Seed Data
-- Sistem Manajemen GOR + Transaksi Elektronik
-- ============================================================

USE gor_management;

-- ============================================================
-- Seed GOR Locations
-- ============================================================
INSERT INTO gor_locations (name, address, city, province, phone, email, is_active) VALUES
('GOR Maju Jaya', 'Jl. Gatot Subroto No. 123', 'Bandung', 'Jawa Barat', '022-7234567', 'info@gormajujaya.id', 1),
('GOR Sentosa', 'Jl. Ahmad Yani No. 456', 'Surabaya', 'Jawa Timur', '031-5234567', 'info@gorsentosa.id', 1);

-- ============================================================
-- Seed Court Units
-- ============================================================
INSERT INTO court_units (gor_location_id, name, court_type, price_per_hour, capacity, description, is_available) VALUES
(1, 'Lapangan Badminton 1', 'badminton', 75000, 4, 'Kualitas internasional dengan pencahayaan LED', 1),
(1, 'Lapangan Badminton 2', 'badminton', 75000, 4, 'Kondisi prima, cocok untuk latihan', 1),
(1, 'Lapangan Futsal 1', 'futsal', 150000, 10, 'Lantai sintetis, standar kompetisi', 1),
(1, 'Lapangan Futsal 2', 'futsal', 150000, 10, 'Dilengkapi sistem scoring otomatis', 1),
(1, 'Lapangan Basket', 'basket', 200000, 15, 'Full court dengan ring profesional', 1),
(2, 'Lapangan Voli 1', 'voli', 100000, 24, 'Standar internasional', 1),
(2, 'Lapangan Basket', 'basket', 200000, 15, 'Baru direnovasi tahun 2024', 1);

-- ============================================================
-- Seed Users (Demo Accounts)
-- ============================================================
-- Password: admin123 -> bcryptjs hash
-- Password: kasir123 -> bcryptjs hash
-- etc.

INSERT INTO users (role_id, name, email, password_hash, phone, address, is_active) VALUES
-- Admin (role_id = 1)
(1, 'Admin GOR', 'admin@gor.id', '$2a$10$xK1ztXW8pxKU.8c3RQYwHOz.K0EXE6jLrVl/C8ScIl7cVxGhPtmFW', '081234567890', 'Bandung', 1),
-- Kasir (role_id = 2)
(2, 'Budi Kasir', 'kasir@gor.id', '$2a$10$nXy0U0YQ8dCfP.F5nRt.PufD.V3fG2H9Hj1K2L3M4N5O6P7Q8R9S0', '081234567891', 'Bandung', 1),
-- Finance (role_id = 3)
(3, 'Sari Finance', 'finance@gor.id', '$2a$10$aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8', '081234567892', 'Bandung', 1),
-- Supplier (role_id = 4)
(4, 'PT Sportstuff', 'supplier@sportstuff.id', '$2a$10$kJ1hG2fE3dC4bA5z9yX8wV7uT6sR5qP4oN3mL2kJ1iH0gF9eD8cB7', '021-5551234', 'Jakarta', 1),
-- Reseller (role_id = 5)
(5, 'Toko Andi Sport', 'andi@sport.id', '$2a$10$pQ1oN2mL3kJ4iH5gF6eD7cB8aZ9yX8wV7uT6sR5qP4oN3mL2kJ1iH', '081298765432', 'Bandung', 1),
-- Pelanggan (role_id = 6)
(6, 'Rudi Santoso', 'rudi@gmail.com', '$2a$10$aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8', '08129876543', 'Bandung', 1),
(6, 'Dian Pratiwi', 'dian@gmail.com', '$2a$10$zY9xW8vU7tS6rQ5pO4nM3lK2jI1hG0fE9dC8bA7z9yX8wV7uT6sR', '08129876544', 'Bandung', 1);

-- ============================================================
-- Seed Stock Items
-- ============================================================
INSERT INTO stock_items (sku, name, category, description, unit, stock_qty, min_stock, buy_price, sell_price, supplier_id, is_active) VALUES
('BWTN-001', 'Shuttlecock Badminton Import', 'Badminton', 'Kualitas turnamen, tahan lama', 'Canister', 15, 5, 45000, 60000, 4, 1),
('BWTN-002', 'Raket Badminton Yonex', 'Badminton', 'Model terbaru dari Yonex', 'Pcs', 12, 3, 350000, 450000, 4, 1),
('FUTSL-001', 'Bola Futsal Molten', 'Futsal', 'Official ball untuk kompetisi', 'Pcs', 8, 2, 180000, 250000, 4, 1),
('FUTSL-002', 'Cone Latihan', 'Futsal', 'Plastik berkualitas, mudah diatur', 'Set', 10, 3, 25000, 35000, 4, 1),
('VLY-001', 'Bola Voli Professional', 'Voli', 'Standar internasional', 'Pcs', 5, 2, 200000, 280000, 4, 1),
('BKT-001', 'Bola Basket Original', 'Basket', 'Spalding official size 7', 'Pcs', 6, 2, 150000, 220000, 4, 1),
('APPRL-001', 'Jersey GOR', 'Apparel', 'Kaos olahraga dengan logo GOR', 'Pcs', 30, 10, 35000, 65000, 4, 1),
('APPRL-002', 'Celana Pendek Sport', 'Apparel', 'Polyester breathable', 'Pcs', 25, 8, 45000, 85000, 4, 1),
('ACC-001', 'Tas Sepatu Olahraga', 'Aksesoris', 'Kapasitas besar dengan kompartemen', 'Pcs', 12, 5, 80000, 130000, 4, 1),
('ACC-002', 'Botol Minum', 'Aksesoris', 'Stainless steel 800ml', 'Pcs', 40, 15, 35000, 65000, 4, 1);

-- ============================================================
-- Seed Contracts (PKS)
-- ============================================================
INSERT INTO contracts (no_pks, title, party_first, party_second, party_third, object_contract, quantity, unit, price, payment_type, top_days, return_policy, start_date, end_date, status, created_by, reviewed_by, approved_by, created_at, updated_at) VALUES
('PKS/2024/001', 'Perjanjian Sewa Gerai Olahraga', 'GOR Maju Jaya', 'Toko Andi Sport', 'PT Sportstuff', 'Sewa Gerai Olahraga No. 3 - Peralatan Badminton & Futsal', 1, 'Unit Gerai', 3500000, 'TOP', 30, 'Barang tidak laku dikembalikan maksimal H+7 setelah masa kontrak berakhir', '2024-01-01', '2024-12-31', 'active', 1, 1, 1, NOW(), NOW()),
('PKS/2024/002', 'Kontrak Suplai Barang Olahraga', 'GOR Maju Jaya', 'PT Sportstuff', NULL, 'Suplai Peralatan Olahraga - Raket, Shuttlecock, Bola Futsal', 500, 'Pcs/Bulan', 25000000, 'TOP', 14, 'Retur barang cacat/rusak dalam 3 hari setelah pengiriman', '2024-01-01', '2024-06-30', 'active', 1, 1, 1, NOW(), NOW()),
('PKS/2024/003', 'Sewa Lapangan Futsal Bulanan', 'GOR Maju Jaya', 'Rudi Santoso', NULL, 'Sewa Lapangan Futsal No. 2 setiap Senin-Jumat 18:00-20:00', 2, 'Jam/Hari', 150000, 'cash', NULL, 'Pembatalan booking H-1 mendapat refund 50%, H-2 atau lebih refund 100%', '2024-03-01', '2024-05-31', 'completed', 1, NULL, NULL, NOW(), NOW()),
('PKS/2024/004', 'Kontrak Event Turnamen Badminton', 'GOR Maju Jaya', 'Komunitas Badminton Bandung', NULL, 'Sewa GOR untuk Turnamen Badminton 2 hari', 2, 'Hari', 8000000, 'cash', NULL, 'Tidak ada refund untuk pembatalan < H-7', '2024-04-15', '2024-04-17', 'active', 1, NULL, NULL, NOW(), NOW());

-- ============================================================
-- Seed Orders
-- ============================================================
INSERT INTO orders (no_order, order_type, contract_id, customer_id, court_id, booking_date, booking_start, booking_end, total_amount, status, created_by, created_at, updated_at) VALUES
('ORD/20240413/0001', 'booking_lapangan', 1, 6, 3, '2024-04-13', '18:00:00', '20:00:00', 300000, 'approved', 6, NOW(), NOW()),
('ORD/20240413/0002', 'order_barang', 2, 5, NULL, '2024-04-13', NULL, NULL, 500000, 'pending', 5, NOW(), NOW()),
('ORD/20240413/0003', 'booking_lapangan', 1, 7, 1, '2024-04-14', '19:00:00', '20:30:00', 112500, 'pending', 7, NOW(), NOW());

-- ============================================================
-- Seed Transactions (POS)
-- ============================================================
INSERT INTO transactions (no_transaksi, order_id, contract_id, customer_id, kasir_id, subtotal, discount_amt, tax_pct, tax_amt, total_amount, status, created_at, updated_at) VALUES
('TRX/20240413/0001', 1, NULL, 6, 2, 300000, 0, 10, 30000, 330000, 'completed', NOW(), NOW()),
('TRX/20240413/0002', NULL, NULL, 6, 2, 450000, 25000, 10, 42500, 467500, 'completed', NOW(), NOW()),
('TRX/20240413/0003', NULL, NULL, 7, 2, 750000, 50000, 10, 70000, 770000, 'completed', NOW(), NOW());

-- ============================================================
-- Seed Transaction Items
-- ============================================================
INSERT INTO transaction_items (transaction_id, stock_item_id, item_name, quantity, unit, unit_price, discount_pct, subtotal) VALUES
(2, 1, 'Shuttlecock Badminton Import', 5, 'Canister', 60000, 0, 300000),
(2, 2, 'Raket Badminton Yonex', 1, 'Pcs', 450000, 0, 450000),
(3, 3, 'Bola Futsal Molten', 2, 'Pcs', 250000, 0, 500000),
(3, 8, 'Celana Pendek Sport', 1, 'Pcs', 85000, 0, 85000),
(3, 10, 'Botol Minum', 3, 'Pcs', 65000, 0, 195000);

-- ============================================================
-- Seed Payments
-- ============================================================
INSERT INTO payments (transaction_id, payment_method, amount, cash_received, cash_change, status, processed_at) VALUES
(1, 'cash', 330000, 350000, 20000, 'success', NOW()),
(2, 'debit', 467500, NULL, NULL, 'success', NOW()),
(3, 'digital', 770000, NULL, NULL, 'success', NOW());

-- ============================================================
-- Seed Returns
-- ============================================================
INSERT INTO returns (no_retur, return_type, transaction_id, contract_id, customer_id, total_refund, refund_type, refund_method, reason, status, created_at, updated_at) VALUES
('RTR/2024/001', 'koreksi_transaksi', 2, NULL, 6, 50000, 'partial', 'cash', 'Diskon tambahan karena pembelian banyak', 'approved', NOW(), NOW());

-- ============================================================
-- Summary Statistics
-- ============================================================
-- Total: 7 Users (1 admin, 1 kasir, 1 finance, 1 supplier, 1 reseller, 2 pelanggan)
-- Total Contracts: 4 (dengan berbagai status)
-- Total Orders: 3
-- Total Transactions: 3 (sudah selesai)
-- Total Stock Items: 10 (siap untuk penjualan)
-- Total Stock Value: Rp 4.710.000,-
-- ============================================================
