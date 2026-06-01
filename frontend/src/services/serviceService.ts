import httpClient from '@/api/httpClient';
import { ApiResponse, Service, Pagination } from '@/types';

interface ServiceListResponse {
  services: Service[];
  pagination: Pagination;
}

export const serviceService = {
  getAll: (page = 1, limit = 10, search?: string) =>
    httpClient.get<ApiResponse<ServiceListResponse>>('/services', { params: { page, limit, search } }),

  getById: (id: string) =>
    httpClient.get<ApiResponse<Service>>(`/services/${id}`),

  create: (data: Partial<Service>) =>
    httpClient.post<ApiResponse<Service>>('/services', data),

  update: (id: string, data: Partial<Service>) =>
    httpClient.put<ApiResponse<Service>>(`/services/${id}`, data),

  delete: (id: string) =>
    httpClient.delete<ApiResponse<null>>(`/services/${id}`),
};
