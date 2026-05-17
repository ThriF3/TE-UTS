import { ApiClient, ApiResponse } from './api';
import { Contract } from '../types';

export interface ContractResponse extends Omit<Contract, 'id'> {
  id: number;
}

export interface ContractListResponse {
  data: ContractResponse[];
  total: number;
  limit: number;
  offset: number;
}

export const contractService = {
  async createContract(data: Partial<Contract>): Promise<ApiResponse<ContractResponse>> {
    return ApiClient.post<ContractResponse>('/contracts', data);
  },

  async getContract(id: number | string): Promise<ApiResponse<ContractResponse>> {
    return ApiClient.get<ContractResponse>(`/contracts/${id}`);
  },

  async getContracts(
    limit: number = 10,
    offset: number = 0,
    status?: string
  ): Promise<ApiResponse<ContractListResponse>> {
    let endpoint = `/contracts?limit=${limit}&offset=${offset}`;
    if (status) endpoint += `&status=${status}`;
    return ApiClient.get<ContractListResponse>(endpoint);
  },

  async updateContract(id: number | string, data: Partial<Contract>): Promise<ApiResponse<ContractResponse>> {
    return ApiClient.put<ContractResponse>(`/contracts/${id}`, data);
  },

  async approveContract(id: number | string): Promise<ApiResponse<ContractResponse>> {
    return ApiClient.post<ContractResponse>(`/contracts/${id}/approve`);
  },
};
