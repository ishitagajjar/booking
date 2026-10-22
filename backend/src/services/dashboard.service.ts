import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CHART_MONTHS = 6;

// Month key in UTC, e.g. "2026-10"
function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export class DashboardService {
  /**
   * Revenue = total of PAID invoices, counted in the month they were paid.
   * Invoices marked paid without a paidDate fall back to their last update time.
   */
  async getStats(userId: string) {
    const now = new Date();
    const chartStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (CHART_MONTHS - 1), 1));

    const [clients, services, bookings, revenueTotal, paidInvoices] = await Promise.all([
      prisma.client.count({ where: { userId } }),
      prisma.service.count({ where: { userId } }),
      prisma.booking.count({ where: { userId } }),
      prisma.invoice.aggregate({ where: { userId, status: 'PAID' }, _sum: { total: true } }),
      prisma.invoice.findMany({
        where: {
          userId,
          status: 'PAID',
          OR: [{ paidDate: { gte: chartStart } }, { paidDate: null, updatedAt: { gte: chartStart } }],
        },
        select: { total: true, paidDate: true, updatedAt: true },
      }),
    ]);

    const byMonth = new Map<string, number>();
    for (let i = 0; i < CHART_MONTHS; i++) {
      const month = new Date(Date.UTC(chartStart.getUTCFullYear(), chartStart.getUTCMonth() + i, 1));
      byMonth.set(monthKey(month), 0);
    }
    for (const invoice of paidInvoices) {
      const key = monthKey(invoice.paidDate ?? invoice.updatedAt);
      if (byMonth.has(key)) byMonth.set(key, byMonth.get(key)! + Number(invoice.total));
    }

    const monthlyRevenue = [...byMonth].map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 }));

    // Percent change of this month vs last month; null when last month had no revenue
    const thisMonth = monthlyRevenue[monthlyRevenue.length - 1].revenue;
    const lastMonth = monthlyRevenue[monthlyRevenue.length - 2].revenue;
    const revenueTrend = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;

    return {
      clients,
      services,
      bookings,
      revenue: Number(revenueTotal._sum.total ?? 0),
      revenueTrend,
      monthlyRevenue,
    };
  }
}
