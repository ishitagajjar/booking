import { useEffect, useState, useCallback, FormEvent } from 'react';
import { PlusIcon, MagnifyingGlassIcon, TableCellsIcon, CalendarDaysIcon as CalendarViewIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { bookingService } from '@/services/bookingService';
import { clientService } from '@/services/clientService';
import { serviceService } from '@/services/serviceService';
import { Booking, Client, Service, Pagination, BookingStatus } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import PaginationComponent from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import PageLoader from '@/components/ui/PageLoader';
import AIEmailDrafter from '@/components/ai/AIEmailDrafter';
import { useAuth } from '@/hooks/useAuth';

const statusVariant: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [form, setForm] = useState({ clientId: '', serviceId: '', bookingDate: '', startTime: '', endTime: '', notes: '', totalAmount: '', status: 'PENDING' as BookingStatus });
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadBookings = useCallback(async (page = 1, searchTerm?: string, statusParam?: string) => {
    const query = searchTerm !== undefined ? searchTerm : search;
    const filterStatus = statusParam !== undefined ? statusParam : statusFilter;
    setFetching(true);
    try {
      const { data } = await bookingService.getAll(page, 10, query || undefined, filterStatus || undefined);
      if (data.IsSuccess && data.Data) {
        const result = data.Data as unknown as { bookings: Booking[]; pagination: Pagination };
        setBookings(result.bookings);
        setPagination(result.pagination);
      }
    } catch { /* handled */ }
    finally {
      setFetching(false);
    }
  }, [search, statusFilter]);

  const loadDropdowns = async () => {
    try {
      const [c, s] = await Promise.all([clientService.getAll(1, 100), serviceService.getAll(1, 100)]);
      if (c.data.Data) setClients((c.data.Data as unknown as { clients: Client[] }).clients);
      if (s.data.Data) setServices((s.data.Data as unknown as { services: Service[] }).services);
    } catch { /* handled */ }
  };

  useEffect(() => { loadBookings(1, ''); loadDropdowns(); }, []);

  const openCreate = () => {
    setForm({ clientId: '', serviceId: '', bookingDate: '', startTime: '', endTime: '', notes: '', totalAmount: '', status: 'PENDING' });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bookingService.create({
        clientId: form.clientId,
        serviceId: form.serviceId,
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        notes: form.notes || undefined,
        totalAmount: parseFloat(form.totalAmount),
        status: form.status,
      });
      setModalOpen(false);
      loadBookings(pagination.page);
    } catch { /* handled */ }
    setSubmitting(false);
  };

  const updateStatus = async (id: string, status: BookingStatus) => {
    await bookingService.update(id, { status });
    loadBookings(pagination.page);
  };

  const columns: Column<Booking>[] = [
    { key: 'client', label: 'Client', render: (b) => b.client?.name || '-' },
    { key: 'service', label: 'Service', render: (b) => b.service?.name || '-' },
    { key: 'bookingDate', label: 'Date', render: (b) => new Date(b.bookingDate).toLocaleDateString() },
    { key: 'time', label: 'Time', render: (b) => `${b.startTime} - ${b.endTime}` },
    { key: 'totalAmount', label: 'Amount', render: (b) => `$${Number(b.totalAmount).toFixed(2)}` },
    { key: 'status', label: 'Status', render: (b) => <Badge variant={statusVariant[b.status]}>{b.status}</Badge> },
    {
      key: 'actions',
      label: 'Actions',
      render: (b) => (
        <div className="flex items-center gap-2">
          <select
            value={b.status}
            onChange={(e) => updateStatus(b.id, e.target.value as BookingStatus)}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          {b.status === 'COMPLETED' && b.client && (
            <AIEmailDrafter
              context={{
                type: 'post_booking',
                clientName: b.client.name,
                businessName: user?.businessName || user?.name,
              }}
              label="Follow-up"
              variant="ghost"
            />
          )}
          {(b.status === 'CONFIRMED' || b.status === 'PENDING') && b.client && (
            <AIEmailDrafter
              context={{
                type: 'appointment_reminder',
                clientName: b.client.name,
                appointmentDate: `${new Date(b.bookingDate).toLocaleDateString()} at ${b.startTime}`,
                businessName: user?.businessName || user?.name,
              }}
              label="Remind"
              variant="ghost"
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <Button onClick={openCreate}><PlusIcon className="h-4 w-4 mr-1" /> Add Booking</Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadBookings(1, search)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); loadBookings(1, search, e.target.value); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <Button variant="secondary" onClick={() => loadBookings(1, search)}>Search</Button>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden ml-auto">
          <button onClick={() => setView('table')} className={`p-2 ${view === 'table' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><TableCellsIcon className="h-4 w-4" /></button>
          <button onClick={() => setView('calendar')} className={`p-2 ${view === 'calendar' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><CalendarViewIcon className="h-4 w-4" /></button>
        </div>
      </div>

      {fetching ? (
        <PageLoader />
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings yet" description="Create your first booking" actionLabel="Add Booking" onAction={openCreate} />
      ) : view === 'table' ? (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Table columns={columns} data={bookings} keyExtractor={(b) => b.id} />
          </div>
          <PaginationComponent currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={loadBookings} />
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} className="p-1 rounded hover:bg-gray-100"><ChevronLeftIcon className="h-5 w-5" /></button>
            <h3 className="text-lg font-semibold text-gray-900">{calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} className="p-1 rounded hover:bg-gray-100"><ChevronRightIcon className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-500">{d}</div>
            ))}
            {(() => {
              const year = calendarMonth.getFullYear();
              const month = calendarMonth.getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const cells = [];
              for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} className="bg-white p-2 min-h-[80px]" />);
              for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayBookings = bookings.filter((b) => b.bookingDate.startsWith(dateStr));
                const isToday = new Date().toISOString().startsWith(dateStr);
                cells.push(
                  <div key={day} className={`bg-white p-1.5 min-h-[80px] ${isToday ? 'ring-2 ring-inset ring-indigo-600' : ''}`}>
                    <span className={`text-xs font-medium ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>{day}</span>
                    <div className="mt-1 space-y-0.5">
                      {dayBookings.map((b) => (
                        <div key={b.id} className={`text-[10px] px-1 py-0.5 rounded truncate ${
                          b.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                          b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {b.startTime} {b.client?.name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return cells;
            })()}
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Booking">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select client</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} required className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select service</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name} - ${Number(s.price).toFixed(2)}</option>)}
            </select>
          </div>
          <Input label="Date" type="date" value={form.bookingDate} onChange={(e) => setForm({ ...form, bookingDate: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
            <Input label="End Time" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
          </div>
          <Input label="Total Amount ($)" type="number" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} required min="0" step="0.01" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
