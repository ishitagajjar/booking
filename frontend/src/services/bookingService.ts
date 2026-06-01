import httpClient from '@/api/httpClient';
import { ApiResponse, Booking, Pagination } from '@/types';

interface BookingListResponse {
  bookings: Booking[];
  pagination: Pagination;
}

export const bookingService = {
  getAll: (page = 1, limit = 10, search?: string, status?: string) =>
    httpClient.get<ApiResponse<BookingListResponse>>('/bookings', { params: { page, limit, search, status } }),

  getById: (id: string) =>
    httpClient.get<ApiResponse<Booking>>(`/bookings/${id}`),

  create: (data: Partial<Booking>) =>
    httpClient.post<ApiResponse<Booking>>('/bookings', data),

  update: (id: string, data: Partial<Booking>) =>
    httpClient.put<ApiResponse<Booking>>(`/bookings/${id}`, data),

  delete: (id: string) =>
    httpClient.delete<ApiResponse<null>>(`/bookings/${id}`),
};
