import { useEffect, useState } from 'react';
import { UsersIcon, WrenchScrewdriverIcon, CalendarDaysIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatsCard from '@/components/StatsCard';
import AISearchBar from '@/components/ai/AISearchBar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PageLoader from '@/components/ui/PageLoader';
import { bookingService } from '@/services/bookingService';
import { dashboardService, DashboardStats } from '@/services/dashboardService';
import { Booking, BookingStatus } from '@/types';

const statusBadgeVariant: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

// "2026-10" -> "Oct"
function monthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleString(undefined, { month: 'short', timeZone: 'UTC' });
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setFetching(true);
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          dashboardService.getStats(),
          bookingService.getAll(1, 5),
        ]);

        if (statsRes.data.Data) setStats(statsRes.data.Data);

        if (bookingsRes.data.Data) {
          setRecentBookings((bookingsRes.data.Data as { bookings: Booking[]; pagination: unknown }).bookings);
        }
      } catch {
        // Dashboard loads gracefully on error
      } finally {
        setFetching(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <AISearchBar />

      {fetching ? (
        <PageLoader />
      ) : (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<UsersIcon className="h-6 w-6" />} label="Total Clients" value={stats?.clients ?? 0} />
        <StatsCard icon={<WrenchScrewdriverIcon className="h-6 w-6" />} label="Services" value={stats?.services ?? 0} />
        <StatsCard icon={<CalendarDaysIcon className="h-6 w-6" />} label="Bookings" value={stats?.bookings ?? 0} />
        <StatsCard
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          label="Revenue (paid)"
          value={currency.format(stats?.revenue ?? 0)}
          trend={stats?.revenueTrend ?? undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue Overview">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(stats?.monthlyRevenue ?? []).map((m) => ({ ...m, label: monthLabel(m.month) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [currency.format(Number(value)), 'Revenue']} />
              <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Recent Bookings">
          {recentBookings.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.client?.name}</p>
                    <p className="text-xs text-gray-500">{booking.service?.name} &middot; {new Date(booking.bookingDate).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={statusBadgeVariant[booking.status]}>{booking.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
        </>
      )}
    </div>
  );
}
