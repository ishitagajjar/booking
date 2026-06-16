import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { invoiceService } from '@/services/invoiceService';
import { clientService } from '@/services/clientService';
import { Invoice, Client, Pagination, InvoiceStatus } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import PaginationComponent from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import AIDescriptionButton from '@/components/ai/AIDescriptionButton';

const statusVariant: Record<InvoiceStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  DRAFT: 'default' as 'info',
  SENT: 'info',
  PAID: 'success',
  OVERDUE: 'danger',
};

interface InvoiceItemForm {
  description: string;
  quantity: string;
  unitPrice: string;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ clientId: '', taxRate: '0', dueDate: '', notes: '' });
  const [items, setItems] = useState<InvoiceItemForm[]>([{ description: '', quantity: '1', unitPrice: '' }]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadInvoices = useCallback(async (page = 1, searchTerm?: string, statusParam?: string) => {
    const query = searchTerm !== undefined ? searchTerm : search;
    const filterStatus = statusParam !== undefined ? statusParam : statusFilter;
    try {
      const { data } = await invoiceService.getAll(page, 10, query || undefined, filterStatus || undefined);
      if (data.IsSuccess && data.Data) {
        const result = data.Data as unknown as { invoices: Invoice[]; pagination: Pagination };
        setInvoices(result.invoices);
        setPagination(result.pagination);
      }
    } catch { /* handled */ }
  }, [search, statusFilter]);

  useEffect(() => {
    loadInvoices(1, '');
    clientService.getAll(1, 100).then(({ data }) => {
      if (data.Data) setClients((data.Data as unknown as { clients: Client[] }).clients);
    });
  }, []);

  const addItem = () => setItems([...items, { description: '', quantity: '1', unitPrice: '' }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof InvoiceItemForm, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await invoiceService.create({
        clientId: form.clientId,
        items: items.map((item) => ({
          description: item.description,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
        })),
        taxRate: parseFloat(form.taxRate),
        dueDate: form.dueDate,
        notes: form.notes || undefined,
      });
      setModalOpen(false);
      loadInvoices(pagination.page);
    } catch { /* handled */ }
    setLoading(false);
  };

  const columns: Column<Invoice>[] = [
    { key: 'invoiceNumber', label: 'Invoice #', sortable: true },
    { key: 'client', label: 'Client', render: (inv) => inv.client?.name || '-' },
    { key: 'total', label: 'Total', render: (inv) => `$${Number(inv.total).toFixed(2)}` },
    { key: 'dueDate', label: 'Due Date', render: (inv) => new Date(inv.dueDate).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (inv) => <Badge variant={statusVariant[inv.status]}>{inv.status}</Badge> },
    {
      key: 'actions', label: 'Actions',
      render: (inv) => (
        <button onClick={() => navigate(`/invoices/${inv.id}`)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View</button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <Button onClick={() => { setForm({ clientId: '', taxRate: '0', dueDate: '', notes: '' }); setItems([{ description: '', quantity: '1', unitPrice: '' }]); setModalOpen(true); }}>
          <PlusIcon className="h-4 w-4 mr-1" /> Create Invoice
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadInvoices(1, search)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); loadInvoices(1, search, e.target.value); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
        <Button variant="secondary" onClick={() => loadInvoices(1, search)}>Search</Button>
      </div>

      {invoices.length === 0 ? (
        <EmptyState title="No invoices yet" description="Create your first invoice" actionLabel="Create Invoice" onAction={() => setModalOpen(true)} />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Table columns={columns} data={invoices} keyExtractor={(inv) => inv.id} />
          </div>
          <PaginationComponent currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={loadInvoices} />
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Invoice" maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select client</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Items</label>
              <button type="button" onClick={addItem} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">+ Add Item</button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <input placeholder="Description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <AIDescriptionButton
                    bookingDetails={{
                      serviceName: item.description || 'Professional Service',
                      duration: 60,
                      clientName: clients.find((c) => c.id === form.clientId)?.name,
                      notes: form.notes || undefined,
                    }}
                    onGenerated={(desc) => updateItem(i, 'description', desc)}
                  />
                  <div className="w-20">
                    <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} required min="1" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="w-28">
                    <input type="number" placeholder="Price" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', e.target.value)} required min="0" step="0.01" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="p-2 text-red-500 hover:text-red-700">&#x2715;</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Tax Rate (%)" type="number" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} min="0" step="0.01" />
            <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Invoice</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
