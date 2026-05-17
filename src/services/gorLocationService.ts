import { ApiClient, ApiResponse } from './api';

export interface GorLocation {
  id: number;
  name: string;
  address: string;
  city?: string;
  province?: string;
  phone?: string;
  email?: string;
  manager_id: number;
  is_active: number;
  created_at: string;
  updated_at?: string;
}

export interface GorLocationListResponse {
  data: GorLocation[];
  total: number;
}

export const gorLocationService = {
  async createGorLocation(data: Partial<GorLocation>): Promise<ApiResponse<GorLocation>> {
    return ApiClient.post<GorLocation>('/gor-locations', data);
  },

  async getGorLocation(id: number | string): Promise<ApiResponse<GorLocation>> {
    return ApiClient.get<GorLocation>(`/gor-locations/${id}`);
  },

  async getGorLocations(
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<GorLocation[]>> {
    return ApiClient.get<GorLocation[]>(`/gor-locations?limit=${limit}&offset=${offset}`);
  },

  async updateGorLocation(id: number | string, data: Partial<GorLocation>): Promise<ApiResponse<GorLocation>> {
    return ApiClient.put<GorLocation>(`/gor-locations/${id}`, data);
  },

  async setActive(id: number | string, is_active: boolean): Promise<ApiResponse<GorLocation>> {
    return ApiClient.patch<GorLocation>(`/gor-locations/${id}/active`, { is_active });
  },

  async deleteGorLocation(id: number | string): Promise<ApiResponse<void>> {
    return ApiClient.delete<void>(`/gor-locations/${id}`);
  },
};
