import { contractService } from '../services/contractService';
import { Contract } from '../types';
import { useAsync, useMutation } from './useAsync';

export function useContracts(limit: number = 10, offset: number = 0, status?: string) {
  return useAsync(
    () => contractService.getContracts(limit, offset, status),
    [limit, offset, status]
  );
}

export function useContract(id: number | string | null) {
  return useAsync(
    () => (id ? contractService.getContract(id) : Promise.resolve({ success: false } as any)),
    [id]
  );
}

export function useCreateContract() {
  return useMutation((data: Partial<Contract>) => contractService.createContract(data).then(res => {
    if (!res.success) throw new Error(res.message);
    return res.data;
  }));
}

export function useUpdateContract() {
  return useMutation(({ id, data }: { id: number | string; data: any }) =>
    contractService.updateContract(id, data).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}

export function useApproveContract() {
  return useMutation((id: number | string) =>
    contractService.approveContract(id).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}
