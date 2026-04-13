import { ApiClient, ApiResponse } from './api';
import { User } from '../types';

export interface LoginResponse {
  user: Omit<User, 'createdAt'> & { role: string };
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export const authService = {
  async register(data: RegisterData): Promise<ApiResponse<LoginResponse>> {
    return ApiClient.post<LoginResponse>('/auth/register', data);
  },

  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return ApiClient.post<LoginResponse>('/auth/login', { email, password });
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return ApiClient.get<User>('/auth/me');
  },

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return ApiClient.put<User>('/auth/profile', data);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return ApiClient.post('/auth/change-password', { currentPassword, newPassword, confirmPassword: newPassword });
  },

  async logout(): Promise<void> {
    ApiClient.setToken(null);
  },
};
