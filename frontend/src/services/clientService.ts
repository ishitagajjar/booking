import httpClient from '@/api/httpClient';
import { ApiResponse, Client, Pagination } from '@/types';

interface ClientListResponse {
  clients: Client[];
  pagination: Pagination;
}

export const clientService = {
  getAll: (page = 1, limit = 10, search?: string) =>
    httpClient.get<ApiResponse<ClientListResponse>>('/clients', { params: { page, limit, search } }),

  getById: (id: string) =>
    httpClient.get<ApiResponse<Client>>(`/clients/${id}`),

  create: (data: Partial<Client>) =>
    httpClient.post<ApiResponse<Client>>('/clients', data),

  update: (id: string, data: Partial<Client>) =>
    httpClient.put<ApiResponse<Client>>(`/clients/${id}`, data),

  delete: (id: string) =>
    httpClient.delete<ApiResponse<null>>(`/clients/${id}`),
};
