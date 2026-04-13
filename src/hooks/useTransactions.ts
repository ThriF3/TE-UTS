import { transactionService } from '../services/transactionService';
import { useAsync, useMutation } from './useAsync';

export function useTransactions(limit: number = 10, offset: number = 0, customerId?: number) {
  return useAsync(
    () => transactionService.getTransactions(limit, offset, customerId),
    [limit, offset, customerId]
  );
}

export function useTransaction(id: number | string | null) {
  return useAsync(
    () => (id ? transactionService.getTransaction(id) : Promise.resolve({ success: false } as any)),
    [id]
  );
}

export function useTransactionStats() {
  return useAsync(
    () => transactionService.getStats(),
    []
  );
}

export function useCreateTransaction() {
  return useMutation((data) =>
    transactionService.createTransaction(data).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}
