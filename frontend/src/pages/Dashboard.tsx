import { useEffect, useState } from 'react';
import { UsersIcon, WrenchScrewdriverIcon, CalendarDaysIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatsCard from '@/components/StatsCard';
import AISearchBar from '@/components/ai/AISearchBar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { clientService } from '@/services/clientService';
import { bookingService } from '@/services/bookingService';
import { invoiceService } from '@/services/invoiceService';
import { serviceService } from '@/services/serviceService';
import { Booking, BookingStatus } from '@/types';

const statusBadgeVariant: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const mockChartData = [
  { month: 'Jan', revenue: 2400 },
  { month: 'Feb', revenue: 1398 },
  { month: 'Mar', revenue: 3800 },
  { month: 'Apr', revenue: 3908 },
  { month: 'May', revenue: 4800 },
  { month: 'Jun', revenue: 3490 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, services: 0, bookings: 0, revenue: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsRes, servicesRes, bookingsRes, invoicesRes] = await Promise.all([
          clientService.getAll(1, 1),
          serviceService.getAll(1, 1),
          bookingService.getAll(1, 5),
          invoiceService.getAll(1, 1),
        ]);

        setStats({
          clients: clientsRes.data.Data?.pagination.total ?? 0,
          services: servicesRes.data.Data?.pagination.total ?? 0,
          bookings: bookingsRes.data.Data?.pagination.total ?? 0,
          revenue: invoicesRes.data.Data?.pagination.total ?? 0,
        });

        if (bookingsRes.data.Data) {
          setRecentBookings((bookingsRes.data.Data as { bookings: Booking[]; pagination: unknown }).bookings);
        }
      } catch {
        // Dashboard loads gracefully on error
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <AISearchBar />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<UsersIcon className="h-6 w-6" />} label="Total Clients" value={stats.clients} trend={12} />
        <StatsCard icon={<WrenchScrewdriverIcon className="h-6 w-6" />} label="Services" value={stats.services} trend={5} />
        <StatsCard icon={<CalendarDaysIcon className="h-6 w-6" />} label="Bookings" value={stats.bookings} trend={8} />
        <StatsCard icon={<CurrencyDollarIcon className="h-6 w-6" />} label="Invoices" value={stats.revenue} trend={-3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue Overview">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
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
    </div>
  );
}
