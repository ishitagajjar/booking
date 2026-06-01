import httpClient from '@/api/httpClient';
import { ApiResponse, Invoice, Pagination } from '@/types';

interface InvoiceListResponse {
  invoices: Invoice[];
  pagination: Pagination;
}

export const invoiceService = {
  getAll: (page = 1, limit = 10, search?: string, status?: string) =>
    httpClient.get<ApiResponse<InvoiceListResponse>>('/invoices', { params: { page, limit, search, status } }),

  getById: (id: string) =>
    httpClient.get<ApiResponse<Invoice>>(`/invoices/${id}`),

  create: (data: {
    clientId: string;
    bookingId?: string;
    items: { description: string; quantity: number; unitPrice: number }[];
    taxRate?: number;
    dueDate: string;
    notes?: string;
  }) =>
    httpClient.post<ApiResponse<Invoice>>('/invoices', data),

  update: (id: string, data: Partial<Invoice>) =>
    httpClient.put<ApiResponse<Invoice>>(`/invoices/${id}`, data),

  delete: (id: string) =>
    httpClient.delete<ApiResponse<null>>(`/invoices/${id}`),
};
