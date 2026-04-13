# Backend API Integration Guide

## Overview
The frontend has been integrated with the backend API. All services and hooks have been created to facilitate data communication with the backend server.

## Project Structure

### Services Layer (`src/services/`)
- **api.ts** - Core API client with authentication
- **authService.ts** - Authentication (login, register, profile)
- **contractService.ts** - Contract management
- **orderService.ts** - Order and booking management
- **transactionService.ts** - POS transactions
- **returnService.ts** - Return and refund management
- **stockService.ts** - Stock/Inventory management

### Hooks Layer (`src/hooks/`)
- **useAsync.ts** - Generic async data fetching and mutation hooks
- **useAuth.ts** - Authentication hooks
- **useContracts.ts** - Contract-related hooks
- **useOrders.ts** - Order-related hooks
- **useTransactions.ts** - Transaction-related hooks
- **useReturns.ts** - Return-related hooks
- **useStock.ts** - Stock-related hooks

## Setup Instructions

### 1. Frontend Configuration
Create `.env.local` file in the root directory:
```
VITE_API_URL=http://localhost:5000/api
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure .env with your database
npm run dev
```

### 3. Database Initialization
```bash
# Run the main schema
mysql -u root -p < database.sql

# Run the seed data (optional - for demo data)
mysql -u root -p < seed-data.sql
```

### 4. Frontend Setup
```bash
npm install
npm run dev
```

## API Authentication

### Token Management
Tokens are automatically managed by the ApiClient:
- Stored in localStorage as `auth_token`
- Automatically included in all requests via Authorization header
- Cleared on logout

### Usage Example
```typescript
import { authService } from '@/services/authService';
import { ApiClient } from '@/services/api';

// Login
const response = await authService.login('admin@gor.id', 'admin123');
if (response.success) {
  ApiClient.setToken(response.data.token);
}

// Logout
ApiClient.setToken(null);
```

## How to Update Pages

### Example: Converting ContractsPage to use API

**Before (using mock data):**
```typescript
import { mockContracts } from '../utils/mockData';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  // ...
}
```

**After (using API):**
```typescript
import { useContracts, useCreateContract } from '../hooks/useContracts';

export default function ContractsPage() {
  const { data, loading, error } = useContracts(10, 0);
  const createMutation = useCreateContract();

  const contracts = data?.data || [];
  
  const handleCreate = async (contractData: any) => {
    try {
      await createMutation.mutate(contractData);
      // Refresh the list
      refetch(); // Available from useContracts hook
    } catch (error) {
      console.error('Failed to create contract');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    // Your JSX here using 'contracts' array
  );
}
```

## Available Hooks

### Authentication Hooks (`useAuth.ts`)
```typescript
const { mutate: login, isSubmitting } = useLogin();
const { mutate: register } = useRegister();
const { mutate: changePassword } = useChangePassword();
const { mutate: updateProfile } = useUpdateProfile();
```

### Contract Hooks (`useContracts.ts`)
```typescript
const { data, loading, error } = useContracts(limit, offset, status);
const { data, loading, error } = useContract(contractId);
const { mutate: createContract, isSubmitting } = useCreateContract();
const { mutate: updateContract } = useUpdateContract();
const { mutate: approveContract } = useApproveContract();
```

### Order Hooks (`useOrders.ts`)
```typescript
const { data, loading, error } = useOrders(limit, offset, customerId, status);
const { data, loading, error } = useOrder(orderId);
const { mutate: createOrder } = useCreateOrder();
const { mutate: approveOrder } = useApproveOrder();
```

### Transaction Hooks (`useTransactions.ts`)
```typescript
const { data, loading, error } = useTransactions(limit, offset, customerId);
const { data, loading, error } = useTransaction(transactionId);
const { data, loading, error } = useTransactionStats();
const { mutate: createTransaction } = useCreateTransaction();
```

### Return Hooks (`useReturns.ts`)
```typescript
const { data, loading, error } = useReturns(limit, offset, customerId, status);
const { data, loading, error } = useReturn(returnId);
const { mutate: createReturn } = useCreateReturn();
const { mutate: approveReturn } = useApproveReturn();
```

### Stock Hooks (`useStock.ts`)
```typescript
const { data, loading, error } = useStockItems(limit, offset, category);
const { data, loading, error } = useStockItem(stockId);
const { data, loading, error } = useLowStockItems();
const { mutate: createStockItem } = useCreateStockItem();
const { mutate: updateStockItem } = useUpdateStockItem();
const { mutate: updateStockQuantity } = useUpdateStockQuantity();
```

## Data Response Format

All API responses follow this format:
```typescript
{
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
```

## Error Handling

### In Services
```typescript
const response = await contractService.getContracts();
if (response.success) {
  console.log(response.data);
} else {
  console.error(response.message);
}
```

### In Hooks (Recommended)
```typescript
const { data, loading, error } = useContracts();

if (error) return <div>Error: {error}</div>;
if (loading) return <div>Loading...</div>;

// Use data
```

## Pagination

Most list endpoints support pagination:
```typescript
const { data } = useContracts(limit: 10, offset: 0);

// Returns:
{
  data: [...],
  total: 150,
  limit: 10,
  offset: 0
}
```

## Filtering

Some endpoints support filtering:
```typescript
// Get contracts with 'active' status
const { data } = useContracts(10, 0, 'active');

// Get orders with specific status
const { data } = useOrders(10, 0, customerId, 'pending');
```

## Demo Users

Use these credentials to test with the backend:

| Akun | Email | Password |
|------|-------|----------|
| Admin | admin@gor.id | admin123 |
| Kasir | kasir@gor.id | kasir123 |
| Finance | finance@gor.id | finance123 |
| Supplier | supplier@sportstuff.id | supplier123 |

## Next Steps

1. **Update All Pages** - Convert mock data usage to API hooks
   - DashboardPage.tsx
   - ContractsPage.tsx
   - OrdersPage.tsx
   - POSPage.tsx
   - ReturnsPage.tsx
   - MasterDataPage.tsx

2. **Add File Upload** - For contract PDFs and documents

3. **Add Notifications** - Toast notifications for success/error messages

4. **Add Search & Filtering** - Enhance the list views with more filter options

5. **Add Export** - PDF/Excel export functionality for reports

## Troubleshooting

### Token Issues
If you get "Unauthorized" errors:
1. Check token in localStorage (browser DevTools)
2. Verify backend is running on correct port
3. Check VITE_API_URL is correct

### CORS Issues
If you get CORS errors:
1. Verify CORS_ORIGIN in backend .env matches frontend URL
2. Check backend is running

### Type Errors
If you get TypeScript errors:
1. Update response types if API returns different structure
2. Check imports are correct

## Resources

- Backend routes: `backend/src/routes/`
- Backend services: `backend/src/services/`
- Frontend services: `src/services/`
- Frontend hooks: `src/hooks/`
