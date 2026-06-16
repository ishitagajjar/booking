export interface ApiResponse<T = unknown> {
  IsSuccess: boolean;
  Data: T | null;
  Message: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  businessName?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  bookings?: Booking[];
}

export interface Service {
  id: string;
  userId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  userId: string;
  clientId: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  service?: Service;
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  bookingId?: string;
  invoiceNumber: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  booking?: Booking;
  items: InvoiceItem[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  pagination: Pagination;
  [key: string]: T[] | Pagination;
}

export interface AuthData {
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  businessName?: string;
}

export interface BookingDetails {
  serviceName: string;
  duration: number;
  notes?: string;
  clientName?: string;
}

export interface ClientHistory {
  name: string;
  totalBookings: number;
  totalSpent: number;
  avgBookingValue: number;
  lastBookingDaysAgo: number;
  bookingFrequency: string;
}

export interface ClientInsights {
  summary: string;
  patterns: string[];
  suggestions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  lifetimeValue: string;
}

export type EmailContextType = 'overdue_invoice' | 'post_booking' | 'appointment_reminder';

export interface EmailContext {
  type: EmailContextType;
  clientName: string;
  amount?: number;
  daysOverdue?: number;
  appointmentDate?: string;
  businessName?: string;
}

export interface DraftedEmail {
  subject: string;
  body: string;
}

export interface ParsedSearch {
  entity: 'bookings' | 'invoices' | 'clients' | 'services';
  filters: Record<string, unknown>;
  sort: string;
  explanation: string;
}

export interface PricingData {
  serviceName: string;
  currentPrice: number;
  category: string;
  totalBookings: number;
  avgRating?: number;
  marketAverage?: number;
  recentBookingPrices: number[];
  demandLevel: 'low' | 'medium' | 'high';
}

export interface PricingSuggestion {
  suggestedPrice: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
  priceRange: { min: number; max: number };
  insights: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
