import httpClient from '@/api/httpClient';
import {
  ApiResponse,
  BookingDetails,
  ChatMessage,
  ClientHistory,
  ClientInsights,
  DraftedEmail,
  EmailContext,
  ParsedSearch,
  PricingData,
  PricingSuggestion,
} from '@/types';

export const aiService = {
  generateInvoiceDescription: (bookingDetails: BookingDetails) =>
    httpClient.post<ApiResponse<{ description: string }>>('/ai/invoice-description', { bookingDetails }),

  generateClientInsights: (clientHistory: ClientHistory) =>
    httpClient.post<ApiResponse<ClientInsights>>('/ai/client-insights', { clientHistory }),

  generateFollowUpEmail: (context: EmailContext) =>
    httpClient.post<ApiResponse<DraftedEmail>>('/ai/follow-up-email', { context }),

  naturalLanguageSearch: (query: string) =>
    httpClient.post<ApiResponse<{ query: ParsedSearch; results: unknown[] }>>('/ai/search', { query }),

  suggestPricing: (data: PricingData) =>
    httpClient.post<ApiResponse<PricingSuggestion>>('/ai/suggest-pricing', { data }),

  chat: (messages: ChatMessage[]) =>
    httpClient.post<ApiResponse<{ content: { type: string; text: string }[] }>>('/ai/chat', { messages }),
};
