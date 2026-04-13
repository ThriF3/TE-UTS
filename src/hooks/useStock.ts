import { stockService } from '../services/stockService';
import { useAsync, useMutation } from './useAsync';

export function useStockItems(limit: number = 10, offset: number = 0, category?: string) {
  return useAsync(
    () => stockService.getStockItems(limit, offset, category),
    [limit, offset, category]
  );
}

export function useStockItem(id: number | string | null) {
  return useAsync(
    () => (id ? stockService.getStockItem(id) : Promise.resolve({ success: false } as any)),
    [id]
  );
}

export function useLowStockItems() {
  return useAsync(
    () => stockService.getLowStockItems(),
    []
  );
}

export function useCreateStockItem() {
  return useMutation((data) =>
    stockService.createStockItem(data).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}

export function useUpdateStockItem() {
  return useMutation(({ id, data }: { id: number | string; data: any }) =>
    stockService.updateStockItem(id, data).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}

export function useUpdateStockQuantity() {
  return useMutation(({ id, quantity }: { id: number | string; quantity: number }) =>
    stockService.updateStockQuantity(id, quantity).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}
