import { returnService } from '../services/returnService';
import { useAsync, useMutation } from './useAsync';

export function useReturns(limit: number = 10, offset: number = 0, customerId?: number, status?: string) {
  return useAsync(
    () => returnService.getReturns(limit, offset, customerId, status),
    [limit, offset, customerId, status]
  );
}

export function useReturn(id: number | string | null) {
  return useAsync(
    () => (id ? returnService.getReturn(id) : Promise.resolve({ success: false } as any)),
    [id]
  );
}

export function useCreateReturn() {
  return useMutation((data) =>
    returnService.createReturn(data).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}

export function useApproveReturn() {
  return useMutation((id: number | string) =>
    returnService.approveReturn(id).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}
