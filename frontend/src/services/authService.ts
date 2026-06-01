import httpClient from '@/api/httpClient';
import { ApiResponse, AuthData, LoginCredentials, RegisterData } from '@/types';

export const authService = {
  login: (credentials: LoginCredentials) =>
    httpClient.post<ApiResponse<AuthData>>('/auth/login', credentials),

  register: (data: RegisterData) =>
    httpClient.post<ApiResponse<AuthData>>('/auth/register', data),

  logout: () =>
    httpClient.post<ApiResponse<null>>('/auth/logout'),

  refresh: () =>
    httpClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),
};
