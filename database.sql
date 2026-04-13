-- ============================================================
-- GOR Management System - Database Schema (MySQL)
-- Sistem Manajemen GOR + Transaksi Elektronik
-- ============================================================

CREATE DATABASE IF NOT EXISTS gor_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gor_management;

-- ============================================================
-- TABEL: roles
-- Fungsi: Mendefinisikan peran pengguna dalam sistem
-- ============================================================
CREATE TABLE roles (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(50) NOT NULL UNIQUE COMMENT 'admin, kasir, finance, supplier, reseller, pelanggan',
    label      VARCHAR(100) NOT NULL,
    permissions JSON COMMENT 'Array fitur yang bisa diakses',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO roles (name, label, permissions) VALUES
('admin',     'Administrator / Pengelola GOR', '["contracts","orders","pos","returns","reports","masterdata","settings"]'),
('kasir',     'Kasir / Operator POS',          '["orders","pos","returns"]'),
('finance',   'Finance / Auditor',             '["contracts","returns","reports"]'),
('supplier',  'Supplier',                      '["orders"]'),
('reseller',  'Reseller / Tenant / Gerai',     '["orders"]'),
('pelanggan', 'Pelanggan / Penyewa',           '["orders"]');

-- ============================================================
-- TABEL: users
-- Fungsi: Data semua pengguna sistem
-- ============================================================
CREATE TABLE users (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id       INT UNSIGNED NOT NULL,
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    address       TEXT,
    company_name  VARCHAR(150) COMMENT 'Nama perusahaan jika supplier/reseller',
    npwp          VARCHAR(30),
    is_active     TINYINT(1) DEFAULT 1,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: gor_locations
-- Fungsi: Data GOR / lokasi fisik yang dikelola
-- ============================================================
CREATE TABLE gor_locations (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    address     TEXT NOT NULL,
    city        VARCHAR(100),
    province    VARCHAR(100),
    phone       VARCHAR(20),
    email       VARCHAR(150),
    manager_id  BIGINT UNSIGNED COMMENT 'User yang bertanggung jawab',
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: court_units
-- Fungsi: Data unit lapangan/ruangan dalam GOR
-- ============================================================
CREATE TABLE court_units (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    gor_location_id INT UNSIGNED NOT NULL,
    name            VARCHAR(100) NOT NULL,
    court_type      ENUM('badminton','futsal','basket','voli','tenis','serbaguna') NOT NULL,
    price_per_hour  DECIMAL(12,2) NOT NULL,
    capacity        INT UNSIGNED COMMENT 'Kapasitas maksimal orang',
    description     TEXT,
    is_available    TINYINT(1) DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gor_location_id) REFERENCES gor_locations(id)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: contracts (PKS - Perjanjian Kerja Sama)
-- Fungsi: Menyimpan semua kontrak elektronik
-- ============================================================
CREATE TABLE contracts (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    no_pks          VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nomor PKS unik (PKS/YYYY/NNN)',
    title           VARCHAR(255) NOT NULL,
    party_first     VARCHAR(150) NOT NULL COMMENT 'Pihak pertama - Vendor/GOR',
    party_second    VARCHAR(150) NOT NULL COMMENT 'Pihak kedua - Supplier/Reseller/Pelanggan',
    party_third     VARCHAR(150)           COMMENT 'Pihak ketiga jika ada',
    object_contract TEXT NOT NULL          COMMENT 'Deskripsi objek kerja sama',
    quantity        DECIMAL(15,2) NOT NULL DEFAULT 1,
    unit            VARCHAR(50) NOT NULL DEFAULT 'Unit',
    price           DECIMAL(15,2) NOT NULL,
    payment_type    ENUM('cash','TOP') NOT NULL DEFAULT 'cash',
    top_days        INT UNSIGNED COMMENT 'Durasi tempo dalam hari, null jika cash',
    return_policy   TEXT                   COMMENT 'Kebijakan retur dan pengembalian barang',
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    status          ENUM('draft','review','active','expired','completed','renewed','terminated') NOT NULL DEFAULT 'draft',
    file_url        VARCHAR(500)           COMMENT 'URL file PDF PKS yang diupload',
    notes           TEXT,
    created_by      BIGINT UNSIGNED NOT NULL,
    reviewed_by     BIGINT UNSIGNED,
    approved_by     BIGINT UNSIGNED,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by)  REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: contract_parties
-- Fungsi: Relasi kontrak ke user (bisa lebih dari 2 pihak)
-- ============================================================
CREATE TABLE contract_parties (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT UNSIGNED NOT NULL,
    user_id     BIGINT UNSIGNED NOT NULL,
    party_role  ENUM('first','second','third') NOT NULL,
    signed_at   TIMESTAMP NULL,
    is_signed   TINYINT(1) DEFAULT 0,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)     REFERENCES users(id)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: contract_files
-- Fungsi: File-file yang dilampirkan pada kontrak
-- ============================================================
CREATE TABLE contract_files (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT UNSIGNED NOT NULL,
    filename    VARCHAR(255) NOT NULL,
    file_url    VARCHAR(500) NOT NULL,
    file_type   VARCHAR(50)  NOT NULL COMMENT 'pdf, docx, jpg, dll',
    file_size   BIGINT UNSIGNED,
    uploaded_by BIGINT UNSIGNED NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: stock_items
-- Fungsi: Master data barang/produk di GOR
-- ============================================================
CREATE TABLE stock_items (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sku           VARCHAR(50) NOT NULL UNIQUE,
    name          VARCHAR(200) NOT NULL,
    category      VARCHAR(100),
    description   TEXT,
    unit          VARCHAR(30) NOT NULL DEFAULT 'Pcs',
    stock_qty     INT UNSIGNED NOT NULL DEFAULT 0,
    min_stock     INT UNSIGNED NOT NULL DEFAULT 5 COMMENT 'Batas minimum stok sebelum notifikasi',
    buy_price     DECIMAL(15,2) NOT NULL DEFAULT 0,
    sell_price    DECIMAL(15,2) NOT NULL DEFAULT 0,
    supplier_id   BIGINT UNSIGNED,
    is_active     TINYINT(1) DEFAULT 1,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: orders
-- Fungsi: Data order/booking dari pelanggan
-- ============================================================
CREATE TABLE orders (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    no_order      VARCHAR(30) NOT NULL UNIQUE COMMENT 'ORD/YYYYMMDD/NNNN',
    order_type    ENUM('booking_lapangan','order_barang','order_suplai','layanan_tambahan') NOT NULL,
    contract_id   BIGINT UNSIGNED COMMENT 'Referensi ke kontrak PKS jika ada',
    customer_id   BIGINT UNSIGNED NOT NULL,
    court_id      INT UNSIGNED   COMMENT 'Untuk booking lapangan',
    booking_date  DATE           COMMENT 'Tanggal main/pakai',
    booking_start TIME           COMMENT 'Jam mulai',
    booking_end   TIME           COMMENT 'Jam selesai',
    total_amount  DECIMAL(15,2) NOT NULL DEFAULT 0,
    status        ENUM('draft','pending','approved','rejected','paid','cancelled') NOT NULL DEFAULT 'pending',
    notes         TEXT,
    created_by    BIGINT UNSIGNED NOT NULL,
    approved_by   BIGINT UNSIGNED,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id)  REFERENCES contracts(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id)  REFERENCES users(id),
    FOREIGN KEY (court_id)     REFERENCES court_units(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by)   REFERENCES users(id),
    FOREIGN KEY (approved_by)  REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: order_items
-- Fungsi: Detail item dalam setiap order
-- ============================================================
CREATE TABLE order_items (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id     BIGINT UNSIGNED NOT NULL,
    stock_item_id BIGINT UNSIGNED COMMENT 'Referensi ke stock_items jika ada',
    item_name    VARCHAR(200) NOT NULL,
    description  TEXT,
    quantity     DECIMAL(15,2) NOT NULL,
    unit         VARCHAR(30) NOT NULL DEFAULT 'Pcs',
    unit_price   DECIMAL(15,2) NOT NULL,
    discount_pct DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT 'Diskon dalam persen',
    discount_amt DECIMAL(15,2) NOT NULL DEFAULT 0,
    subtotal     DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (order_id)      REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_item_id) REFERENCES stock_items(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: transactions
-- Fungsi: Rekaman transaksi POS yang sudah selesai
-- ============================================================
CREATE TABLE transactions (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    no_transaksi   VARCHAR(30) NOT NULL UNIQUE COMMENT 'TRX/YYYYMMDD/NNNN',
    order_id       BIGINT UNSIGNED COMMENT 'Referensi order jika dari order',
    contract_id    BIGINT UNSIGNED COMMENT 'Referensi kontrak jika terkait PKS',
    customer_id    BIGINT UNSIGNED NOT NULL,
    kasir_id       BIGINT UNSIGNED NOT NULL,
    subtotal       DECIMAL(15,2) NOT NULL,
    discount_amt   DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_pct        DECIMAL(5,2) NOT NULL DEFAULT 0,
    tax_amt        DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount   DECIMAL(15,2) NOT NULL,
    status         ENUM('open','completed','cancelled','refunded') NOT NULL DEFAULT 'completed',
    notes          TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id)    REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (kasir_id)    REFERENCES users(id)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: transaction_items
-- Fungsi: Detail item dalam setiap transaksi POS
-- ============================================================
CREATE TABLE transaction_items (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transaction_id  BIGINT UNSIGNED NOT NULL,
    stock_item_id   BIGINT UNSIGNED,
    item_name       VARCHAR(200) NOT NULL,
    quantity        DECIMAL(15,2) NOT NULL,
    unit            VARCHAR(30) NOT NULL DEFAULT 'Pcs',
    unit_price      DECIMAL(15,2) NOT NULL,
    discount_pct    DECIMAL(5,2) DEFAULT 0,
    subtotal        DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_item_id)  REFERENCES stock_items(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: payments
-- Fungsi: Rekaman pembayaran untuk setiap transaksi
-- ============================================================
CREATE TABLE payments (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transaction_id    BIGINT UNSIGNED NOT NULL,
    payment_method    ENUM('cash','debit','credit','digital') NOT NULL,
    amount            DECIMAL(15,2) NOT NULL,
    cash_received     DECIMAL(15,2) COMMENT 'Uang diterima jika tunai',
    cash_change       DECIMAL(15,2) COMMENT 'Kembalian jika tunai',
    card_number       VARCHAR(20)  COMMENT '4 digit terakhir kartu',
    card_bank         VARCHAR(50)  COMMENT 'Nama bank penerbit kartu',
    digital_provider  VARCHAR(50)  COMMENT 'GoPay, OVO, DANA, ShopeePay, dll',
    reference_no      VARCHAR(100) COMMENT 'Nomor referensi dari bank/provider',
    status            ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'success',
    processed_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes             TEXT,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: returns
-- Fungsi: Data retur barang, pembatalan booking, koreksi
-- ============================================================
CREATE TABLE returns (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    no_retur        VARCHAR(30) NOT NULL UNIQUE COMMENT 'RTR/YYYY/NNN',
    return_type     ENUM('retur_barang','pembatalan_booking','koreksi_transaksi') NOT NULL,
    transaction_id  BIGINT UNSIGNED COMMENT 'Transaksi yang menjadi dasar retur',
    contract_id     BIGINT UNSIGNED COMMENT 'Kontrak terkait jika ada',
    customer_id     BIGINT UNSIGNED NOT NULL,
    total_refund    DECIMAL(15,2) NOT NULL DEFAULT 0,
    refund_type     ENUM('full','partial') NOT NULL DEFAULT 'partial',
    refund_method   ENUM('cash','debit','digital') NOT NULL DEFAULT 'cash',
    reason          TEXT NOT NULL,
    status          ENUM('draft','pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
    approved_by     BIGINT UNSIGNED,
    processed_at    TIMESTAMP NULL,
    created_by      BIGINT UNSIGNED NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    FOREIGN KEY (contract_id)    REFERENCES contracts(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id)    REFERENCES users(id),
    FOREIGN KEY (approved_by)    REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by)     REFERENCES users(id)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: return_items
-- Fungsi: Detail item yang dikembalikan dalam retur
-- ============================================================
CREATE TABLE return_items (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    return_id   BIGINT UNSIGNED NOT NULL,
    item_name   VARCHAR(200) NOT NULL,
    quantity    DECIMAL(15,2) NOT NULL,
    unit_price  DECIMAL(15,2) NOT NULL,
    subtotal    DECIMAL(15,2) NOT NULL,
    reason      TEXT COMMENT 'Alasan spesifik per item',
    FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: stock_movements
-- Fungsi: Histori pergerakan stok (masuk/keluar)
-- ============================================================
CREATE TABLE stock_movements (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    stock_item_id   BIGINT UNSIGNED NOT NULL,
    movement_type   ENUM('in','out','adjustment','return') NOT NULL,
    quantity        DECIMAL(15,2) NOT NULL,
    quantity_before DECIMAL(15,2) NOT NULL,
    quantity_after  DECIMAL(15,2) NOT NULL,
    reference_type  VARCHAR(50) COMMENT 'transaction, order, return, manual',
    reference_id    BIGINT UNSIGNED,
    notes           TEXT,
    created_by      BIGINT UNSIGNED NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_item_id) REFERENCES stock_items(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: top_invoices (Pembayaran Tempo/TOP)
-- Fungsi: Tagihan untuk kontrak dengan jenis pembayaran TOP
-- ============================================================
CREATE TABLE top_invoices (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contract_id   BIGINT UNSIGNED NOT NULL,
    invoice_no    VARCHAR(30) NOT NULL UNIQUE,
    customer_id   BIGINT UNSIGNED NOT NULL,
    amount        DECIMAL(15,2) NOT NULL,
    due_date      DATE NOT NULL,
    paid_at       TIMESTAMP NULL,
    payment_id    BIGINT UNSIGNED,
    status        ENUM('unpaid','partial','paid','overdue') NOT NULL DEFAULT 'unpaid',
    notes         TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (payment_id)  REFERENCES payments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: reports (cached report snapshots)
-- Fungsi: Menyimpan snapshot laporan yang sudah digenerate
-- ============================================================
CREATE TABLE reports (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL COMMENT 'daily, monthly, contract, booking, stock, return',
    title       VARCHAR(200) NOT NULL,
    params      JSON         COMMENT 'Parameter filter laporan (date range, contract_id, dll)',
    data        LONGTEXT     COMMENT 'JSON data laporan tersimpan',
    generated_by BIGINT UNSIGNED NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- ============================================================
-- VIEWS untuk pelaporan
-- ============================================================

-- View: Ringkasan transaksi harian
CREATE OR REPLACE VIEW v_daily_revenue AS
SELECT
    DATE(t.created_at)                          AS trx_date,
    COUNT(t.id)                                 AS total_transactions,
    SUM(t.total_amount)                         AS total_revenue,
    SUM(CASE WHEN p.payment_method = 'cash'    THEN p.amount ELSE 0 END) AS cash_revenue,
    SUM(CASE WHEN p.payment_method = 'debit'   THEN p.amount ELSE 0 END) AS debit_revenue,
    SUM(CASE WHEN p.payment_method = 'credit'  THEN p.amount ELSE 0 END) AS credit_revenue,
    SUM(CASE WHEN p.payment_method = 'digital' THEN p.amount ELSE 0 END) AS digital_revenue
FROM transactions t
LEFT JOIN payments p ON p.transaction_id = t.id AND p.status = 'success'
WHERE t.status = 'completed'
GROUP BY DATE(t.created_at);

-- View: Status kontrak aktif
CREATE OR REPLACE VIEW v_active_contracts AS
SELECT
    c.id, c.no_pks, c.title, c.party_second,
    c.object_contract, c.price, c.payment_type, c.top_days,
    c.start_date, c.end_date,
    DATEDIFF(c.end_date, CURDATE()) AS days_remaining,
    c.status
FROM contracts c
WHERE c.status = 'active'
ORDER BY c.end_date ASC;

-- View: Stok rendah
CREATE OR REPLACE VIEW v_low_stock AS
SELECT id, sku, name, category, stock_qty, min_stock, sell_price
FROM stock_items
WHERE stock_qty <= min_stock AND is_active = 1
ORDER BY stock_qty ASC;

-- ============================================================
-- INDEX untuk performa
-- ============================================================
ALTER TABLE transactions   ADD INDEX idx_created_at (created_at);
ALTER TABLE transactions   ADD INDEX idx_customer   (customer_id);
ALTER TABLE orders         ADD INDEX idx_status     (status);
ALTER TABLE orders         ADD INDEX idx_booking    (booking_date, court_id);
ALTER TABLE contracts      ADD INDEX idx_status     (status);
ALTER TABLE contracts      ADD INDEX idx_dates      (start_date, end_date);
ALTER TABLE payments       ADD INDEX idx_method     (payment_method);
ALTER TABLE stock_items    ADD INDEX idx_category   (category);
ALTER TABLE returns        ADD INDEX idx_status     (status);

-- ============================================================
-- DATA AWAL (Seed)
-- ============================================================
INSERT INTO gor_locations (name, address, city, province, phone, email) VALUES
('GOR Maju Jaya', 'Jl. Olahraga No. 1', 'Bandung', 'Jawa Barat', '022-1234567', 'info@gormajujaya.id');

-- ============================================================
-- STORED PROCEDURE: Buat Nomor Transaksi Otomatis
-- ============================================================
DELIMITER //
CREATE PROCEDURE sp_generate_trx_no(OUT new_no VARCHAR(30))
BEGIN
    DECLARE last_seq INT DEFAULT 0;
    DECLARE today_str VARCHAR(8);
    SET today_str = DATE_FORMAT(NOW(), '%Y%m%d');
    SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(no_transaksi, '/', -1) AS UNSIGNED)), 0)
    INTO last_seq
    FROM transactions
    WHERE no_transaksi LIKE CONCAT('TRX/', today_str, '/%');
    SET new_no = CONCAT('TRX/', today_str, '/', LPAD(last_seq + 1, 4, '0'));
END //
DELIMITER ;
