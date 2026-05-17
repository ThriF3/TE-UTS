import { gorLocationService } from '../services/gorLocationService';
import { useAsync, useMutation } from './useAsync';

export function useGorLocations(limit: number = 50, offset: number = 0) {
  return useAsync(
    () => gorLocationService.getGorLocations(limit, offset),
    [limit, offset]
  );
}

export function useGorLocation(id: number | string | null) {
  return useAsync(
    () => (id ? gorLocationService.getGorLocation(id) : Promise.resolve({ success: false } as any)),
    [id]
  );
}

export function useCreateGorLocation() {
  return useMutation((data: any) => gorLocationService.createGorLocation(data).then(res => {
    if (!res.success) throw new Error(res.message);
    return res.data;
  }));
}

export function useUpdateGorLocation() {
  return useMutation(({ id, data }: { id: number | string; data: any }) =>
    gorLocationService.updateGorLocation(id, data).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}

export function useSetGorLocationActive() {
  return useMutation(({ id, is_active }: { id: number | string; is_active: boolean }) =>
    gorLocationService.setActive(id, is_active).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}

export function useDeleteGorLocation() {
  return useMutation((id: number | string) =>
    gorLocationService.deleteGorLocation(id).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}
