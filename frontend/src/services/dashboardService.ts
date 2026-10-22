import httpClient from '@/api/httpClient';
import { ApiResponse } from '@/types';

export interface DashboardStats {
  clients: number;
  services: number;
  bookings: number;
  revenue: number;
  revenueTrend: number | null;
  monthlyRevenue: { month: string; revenue: number }[];
}

export const dashboardService = {
  getStats: () => httpClient.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
};
