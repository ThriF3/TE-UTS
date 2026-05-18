import { courtService } from '../services/courtService';
import { useAsync, useMutation } from './useAsync';

export function useCourts(limit: number = 50, offset: number = 0, locationId?: number) {
  return useAsync(
    () => courtService.getCourts(limit, offset, locationId),
    [limit, offset, locationId]
  );
}

export function useCourt(id: number | string | null) {
  return useAsync(
    () => (id ? courtService.getCourt(id) : Promise.resolve({ success: false } as any)),
    [id]
  );
}

export function useCreateCourt() {
  return useMutation((data: any) => courtService.createCourt(data).then(res => {
    if (!res.success) throw new Error(res.message);
    return res.data;
  }));
}

export function useUpdateCourt() {
  return useMutation(({ id, data }: { id: number | string; data: any }) =>
    courtService.updateCourt(id, data).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}

export function useDeleteCourt() {
  return useMutation((id: number | string) =>
    courtService.deleteCourt(id).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}
