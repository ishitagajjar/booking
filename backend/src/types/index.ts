import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export interface ApiResponseType<T = unknown> {
  IsSuccess: boolean;
  Data: T | null;
  Message: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
}

export type BookingStatusType = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type InvoiceStatusType = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
