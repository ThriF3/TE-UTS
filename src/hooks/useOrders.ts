import { Order, orderService } from '../services/orderService';
import { useAsync, useMutation } from './useAsync';

export function useOrders(limit: number = 10, offset: number = 0, customerId?: number, status?: string) {
  return useAsync(
    () => orderService.getOrders(limit, offset, customerId, status),
    [limit, offset, customerId, status]
  );
}

export function useOrder(id: number | string | null) {
  return useAsync(
    () => (id ? orderService.getOrder(id) : Promise.resolve({ success: false } as any)),
    [id]
  );
}

export function useCreateOrder() {
  return useMutation((data: Order) =>
    orderService.createOrder(data).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}

export function useApproveOrder() {
  return useMutation((id: number | string) =>
    orderService.approveOrder(id).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}
