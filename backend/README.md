# GOR Management System - Backend

Backend service untuk GOR Management System menggunakan Express.js + TypeScript + MySQL.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Buat file `.env` di folder `backend`:

```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi database Anda:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gor_management

JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:5173
```

### 3. Setup Database

Jalankan file `database.sql` dari folder root:

```bash
mysql -u root -p < database.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## Available Scripts

- `npm run dev` - Jalankan development server dengan hot reload
- `npm run build` - Build TypeScript ke JavaScript
- `npm start` - Jalankan production build
- `npm run lint` - Linting dengan ESLint
- `npm run format` - Format code dengan Prettier

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (require token)
- `PUT /api/auth/profile` - Update profile (require token)
- `POST /api/auth/change-password` - Change password (require token)

### Health Check

- `GET /api/health` - Health check endpoint
- `GET /api/status` - API status

### Planned Endpoints

- Contracts Management (`/api/contracts`)
- Orders & Booking (`/api/orders`)
- Transactions & POS (`/api/transactions`)
- Returns (`/api/returns`)
- Reports (`/api/reports`)
- Master Data (`/api/master-data`)
- Users Management (`/api/users`)

## Project Structure

```
backend/
├── src/
│   ├── config/          # Konfigurasi (env, database)
│   ├── middleware/      # Express middleware (auth, error handler)
│   ├── routes/          # API routes
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── server.ts        # Entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## Database Schema

Database schema sudah tersedia di file `../database.sql`. Jalankan file tersebut untuk membuat:
- Tabel users dengan role-based access
- Tabel contracts (PKS), orders, transactions, returns
- Tabel stock items dan court units
- Views dan stored procedures untuk business logic

## Authentication

API menggunakan JWT (JSON Web Token) untuk authentication. Token dikirim melalui header:

```
Authorization: Bearer <your_jwt_token>
```

Semua request yang memerlukan authentication harus menyertakan header ini.

## Error Handling

API mengembalikan response yang konsisten:

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

## Development Notes

- Environment variables: Lihat `.env.example` untuk referensi
- Database: Pastikan MySQL service berjalan
- CORS: Konfigurasi CORS_ORIGIN sesuai URL frontend
- JWT Secret: Ganti dengan secret yang kuat di production
