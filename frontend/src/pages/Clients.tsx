import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { clientService } from '@/services/clientService';
import { Client, Pagination } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Table, { Column } from '@/components/ui/Table';
import PaginationComponent from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import PageLoader from '@/components/ui/PageLoader';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' });
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const loadClients = useCallback(async (page = 1, searchTerm?: string) => {
    const query = searchTerm !== undefined ? searchTerm : search;
    setFetching(true);
    try {
      const { data } = await clientService.getAll(page, 10, query || undefined);
      if (data.IsSuccess && data.Data) {
        const result = data.Data as unknown as { clients: Client[]; pagination: Pagination };
        setClients(result.clients);
        setPagination(result.pagination);
      }
    } catch { /* handled by interceptor */ }
    finally {
      setFetching(false);
    }
  }, [search]);

  useEffect(() => { loadClients(1, ''); }, []);

  const handleSearch = () => loadClients(1, search);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', address: '', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setForm({ name: client.name, email: client.email || '', phone: client.phone || '', address: client.address || '', notes: client.notes || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await clientService.update(editing.id, form);
      } else {
        await clientService.create(form);
      }
      setModalOpen(false);
      loadClients(pagination.page);
    } catch { /* error shown by interceptor */ }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    await clientService.delete(id);
    loadClients(pagination.page);
  };

  const columns: Column<Client>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'actions',
      label: 'Actions',
      render: (client) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/clients/${client.id}`)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View</button>
          <button onClick={() => openEdit(client)} className="text-gray-600 hover:text-gray-800 text-sm font-medium">Edit</button>
          <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <Button onClick={openCreate}><PlusIcon className="h-4 w-4 mr-1" /> Add Client</Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Button variant="secondary" onClick={handleSearch}>Search</Button>
      </div>

      {fetching ? (
        <PageLoader />
      ) : clients.length === 0 ? (
        <EmptyState title="No clients yet" description="Add your first client to get started" actionLabel="Add Client" onAction={openCreate} />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Table columns={columns} data={clients} keyExtractor={(c) => c.id} />
          </div>
          <PaginationComponent currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={loadClients} />
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Client' : 'Add Client'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
