import { ApiClient, ApiResponse } from './api';

export interface CourtUnit {
  id: number;
  gor_location_id: number;
  name: string;
  court_type: 'badminton' | 'futsal' | 'basket' | 'voli' | 'tenis' | 'serbaguna';
  price_per_hour: number;
  capacity?: number;
  description?: string;
  is_available: boolean;
  is_deleted?: boolean;
  created_at: string;
}

export interface CourtListResponse {
  data: {
    data: CourtUnit[];
    total: number;
  };
  total: number;
  limit: number;
  offset: number;
}

export const courtService = {
  async createCourt(data: Partial<CourtUnit>): Promise<ApiResponse<CourtUnit>> {
    return ApiClient.post<CourtUnit>('/courts', data);
  },

  async getCourt(id: number | string): Promise<ApiResponse<CourtUnit>> {
    return ApiClient.get<CourtUnit>(`/courts/${id}`);
  },

  async getCourts(
    limit: number = 50,
    offset: number = 0,
    locationId?: number,
    courtType?: string,
    available?: boolean
  ): Promise<ApiResponse<CourtListResponse>> {
    let endpoint = `/courts?limit=${limit}&offset=${offset}`;
    if (locationId) endpoint += `&locationId=${locationId}`;
    if (courtType) endpoint += `&courtType=${courtType}`;
    if (available !== undefined) endpoint += `&available=${available}`;
    return ApiClient.get<CourtListResponse>(endpoint);
  },

  async updateCourt(id: number | string, data: Partial<CourtUnit>): Promise<ApiResponse<CourtUnit>> {
    return ApiClient.put<CourtUnit>(`/courts/${id}`, data);
  },

  async deleteCourt(id: number | string): Promise<ApiResponse<void>> {
    return ApiClient.delete<void>(`/courts/${id}`);
  },
};
