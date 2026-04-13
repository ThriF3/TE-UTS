# GOR Management System
Sistem Manajemen GOR + Transaksi Elektronik

## Stack Teknologi
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Pure CSS dengan CSS Variables (dark theme)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6

## Cara Menjalankan

### Prasyarat
- Node.js v18 atau lebih baru
- npm v9 atau lebih baru

### Langkah Instalasi

```bash
# 1. Masuk ke folder project
cd gor-management-system

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev
```

Buka browser ke: http://localhost:5173

### Build untuk Production

```bash
npm run build
npm run preview
```

## Akun Demo

| Role     | Email                       | Password      |
|----------|-----------------------------|---------------|
| Admin    | admin@gor.id                | admin123      |
| Kasir    | kasir@gor.id                | kasir123      |
| Finance  | finance@gor.id              | finance123    |
| Supplier | supplier@sportstuff.id      | supplier123   |

## Modul Utama

1. **Dashboard** — Ringkasan statistik, grafik pendapatan, status lapangan
2. **Kontrak (PKS)** — Buat, edit, setujui kontrak elektronik antar pihak
3. **Order & Booking** — Booking lapangan, order barang, approval workflow
4. **POS Kasir** — Transaksi harian, 3 metode bayar (tunai/kartu/digital), cetak struk
5. **Retur** — Retur barang, pembatalan booking, koreksi transaksi
6. **Laporan** — Analitik pendapatan, transaksi, stok, booking, retur
7. **Master Data** — Manajemen barang, lapangan, pengguna
8. **Pengaturan** — Konfigurasi sistem, pajak, format struk

## Database (MySQL)

Jalankan file `database.sql` untuk membuat schema:

```bash
mysql -u root -p < database.sql
```

File `database.sql` berisi:
- Semua tabel dengan foreign key yang lengkap
- Views untuk pelaporan
- Index untuk performa
- Stored procedure untuk nomor transaksi otomatis
- Data seed awal

## Struktur Folder

```
src/
├── components/
│   └── layout/      # Layout utama (sidebar, topbar)
├── features/
│   └── auth/        # Context autentikasi
├── pages/           # Semua halaman utama
├── types/           # TypeScript interfaces
└── utils/           # Helper functions + mock data
```
