import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { clientService } from '@/services/clientService';
import { Client, Booking, BookingStatus } from '@/types';
import ClientInsightsPanel from '@/components/ai/ClientInsights';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const statusVariant: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!id) return;
    clientService.getById(id).then(({ data }) => {
      if (data.IsSuccess && data.Data) setClient(data.Data);
    });
  }, [id]);

  if (!client) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/clients" className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeftIcon className="h-5 w-5 text-gray-500" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
        <Card title="Client Info">
          <dl className="space-y-3">
            {client.email && <div><dt className="text-xs text-gray-500">Email</dt><dd className="text-sm text-gray-900">{client.email}</dd></div>}
            {client.phone && <div><dt className="text-xs text-gray-500">Phone</dt><dd className="text-sm text-gray-900">{client.phone}</dd></div>}
            {client.address && <div><dt className="text-xs text-gray-500">Address</dt><dd className="text-sm text-gray-900">{client.address}</dd></div>}
            {client.notes && <div><dt className="text-xs text-gray-500">Notes</dt><dd className="text-sm text-gray-900">{client.notes}</dd></div>}
            <div><dt className="text-xs text-gray-500">Added</dt><dd className="text-sm text-gray-900">{new Date(client.createdAt).toLocaleDateString()}</dd></div>
          </dl>
        </Card>

        <ClientInsightsPanel client={client} />
        </div>

        <div className="lg:col-span-2">
          <Card title="Booking History">
            {(!client.bookings || client.bookings.length === 0) ? (
              <p className="text-sm text-gray-500 py-4 text-center">No bookings for this client</p>
            ) : (
              <div className="space-y-3">
                {client.bookings.map((booking: Booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{booking.service?.name}</p>
                      <p className="text-xs text-gray-500">{new Date(booking.bookingDate).toLocaleDateString()} &middot; {booking.startTime} - {booking.endTime}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">${Number(booking.totalAmount).toFixed(2)}</span>
                      <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
