# 🚀 Quick Start Guide - GOR Management System

## Complete System Setup (5-10 minutes)

### Prerequisites
- Node.js v18+ 
- MySQL 8.0+
- npm v9+

---

## Step 1: Database Setup (2 minutes)

```bash
# 1. Create database and schema
mysql -u root -p < database.sql

# 2. Insert seed data (optional - for demo data)
mysql -u root -p < seed-data.sql

# 3. Verify connection
mysql -u root -p -e "USE gor_management; SELECT COUNT(*) FROM users;"
```

---

## Step 2: Backend Setup (3 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your MySQL credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=gor_management

# Start development server
npm run dev

# Expected output:
# ✅ Database connected successfully
# 🚀 Server running on port 5000
# 📝 Environment: development
# 🔗 API URL: http://localhost:5000/api
```

Backend should be running on: **http://localhost:5000/api**

---

## Step 3: Frontend Setup (3 minutes)

```bash
# Navigate back to project root
cd ..

# Install dependencies
npm install

# Create environment file (already done, but verify)
cat .env.local
# Should contain: VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev

# Expected output:
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

Frontend should be running on: **http://localhost:5173**

---

## Step 4: Test the System

### Open in Browser
1. Go to: **http://localhost:5173**
2. Should see the GOR Management System login page

### Login with Demo Credentials

Choose any of these accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@gor.id | admin123 |
| **Kasir** | kasir@gor.id | kasir123 |
| **Finance** | finance@gor.id | finance123 |
| **Supplier** | supplier@sportstuff.id | supplier123 |

After login, you should see the dashboard.

---

## Troubleshooting

### ❌ "ERR_CONNECTION_REFUSED" on port 5000
```bash
# Backend not running
cd backend
npm run dev
```

### ❌ "Cannot GET /login" or white screen
```bash
# Frontend not running
npm run dev  # (from project root, not backend folder)
```

### ❌ "No matching version found for ..."
```bash
# Dependency issue, clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Error: connect ECONNREFUSED (database)"
```bash
# MySQL not running or wrong credentials
# 1. Check MySQL is running
# 2. Verify .env credentials
# 3. Run: mysql -u root -p -e "SELECT 1;"
```

### ❌ "Login failed" after entering credentials
```bash
# Database not populated with seed data
mysql -u root -p < seed-data.sql
```

---

## Project Structure Overview

```
gor-system/
├── backend/                 # Express API server
│   ├── src/server.ts       # Main entry point
│   ├── package.json        # Dependencies
│   └── .env.example        # Config template
├── src/                     # React frontend
│   ├── services/           # API clients
│   ├── hooks/              # Custom React hooks
│   └── pages/              # Page components
├── database.sql            # Database schema
├── seed-data.sql           # Sample data
└── .env.local              # Frontend config
```

---

## Key Files to Remember

| File | Purpose |
|------|---------|
| `backend/.env` | Backend database credentials |
| `.env.local` | Frontend API URL configuration |
| `database.sql` | Database schema (one-time setup) |
| `seed-data.sql` | Sample data for testing |

---

## What's Included

### ✅ Backend API (Complete)
- User authentication with JWT
- 6 modules: Contracts, Orders, Transactions, Returns, Stock, Health
- Role-based access control
- MySQL database with 15+ tables
- Error handling & logging

### ✅ Frontend Integration (Complete)
- API service layer with TypeScript
- Custom React hooks for data fetching
- Authentication context with token management
- Environment configuration
- Example implementations

### ✅ Database
- Full relational schema
- 7 demo users across roles
- 4 sample contracts
- 3 orders/bookings
- 10 stock items
- 3 completed transactions

---

## Development Features Enabled

- ✅ Hot reload (backend & frontend)
- ✅ TypeScript for type safety
- ✅ SQL query logging
- ✅ CORS enabled for development
- ✅ Session persistence (localStorage)

---

## Next: Update Pages to Use APIs

The frontend is ready for integration. To complete the system:

1. **LoginPage** → Convert to use `useLogin()` hook
2. **DashboardPage** → Use `useTransactionStats()` 
3. **ContractsPage** → Use `useContracts()` hooks
4. See example: `src/pages/ContractsPage.example.tsx`

---

## Common Commands

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend (from project root)
npm run dev

# Terminal 3: Database operations
mysql -u root -p < database.sql
```

---

## Performance Tips

- Database uses connection pooling (10 concurrent)
- API caches enabled via browser
- Frontend uses React.lazy() for code splitting
- Backend compresses responses

---

## Production Deployment

When ready to deploy:

1. **Backend**: Update .env with production database
2. **Frontend**: Update VITE_API_URL to production API
3. **Database**: Run `database.sql` on production
4. **SSL**: Enable HTTPS for API
5. **Environment**: Set NODE_ENV=production

---

## Support Resources

- 📖 **API Guide**: `API-INTEGRATION-GUIDE.md`
- 📄 **Project Status**: `PROJECT-STATUS.md`
- 🔧 **Backend Readme**: `backend/README.md`
- 💾 **Example Code**: `src/pages/ContractsPage.example.tsx`

---

## Quick Commands Summary

```bash
# Setup (first time only)
npm install
cd backend && npm install
mysql -u root -p < database.sql
mysql -u root -p < seed-data.sql

# Development (every session)
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
npm run dev

# Stop all:
# Ctrl+C in each terminal

# Clear everything and restart
rm -rf node_modules backend/node_modules
npm install && cd backend && npm install
npm run dev  # in different terminals
```

---

## You're All Set! 🎉

The GOR Management System is now running with:
- ✅ Express backend API
- ✅ React frontend with hooks
- ✅ MySQL database
- ✅ Demo users and data
- ✅ Authentication system

Start developing by updating the page components to use the new API hooks!

---

**Next Steps**: 
1. Open http://localhost:5173
2. Login with admin@gor.id / admin123
3. Explore the system
4. Update pages to use API hooks (see ContractsPage.example.tsx)
