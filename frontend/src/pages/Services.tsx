import { useEffect, useState, useCallback, FormEvent } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { serviceService } from '@/services/serviceService';
import { Service, Pagination } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import PaginationComponent from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import PricingSuggestion from '@/components/ai/PricingSuggestion';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: '', description: '', duration: '', price: '', category: '' });
  const [loading, setLoading] = useState(false);

  const loadServices = useCallback(async (page = 1, searchTerm?: string) => {
    const query = searchTerm !== undefined ? searchTerm : search;
    try {
      const { data } = await serviceService.getAll(page, 10, query || undefined);
      if (data.IsSuccess && data.Data) {
        const result = data.Data as unknown as { services: Service[]; pagination: Pagination };
        setServices(result.services);
        setPagination(result.pagination);
      }
    } catch { /* handled */ }
  }, [search]);

  useEffect(() => { loadServices(1, ''); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', duration: '', price: '', category: '' });
    setModalOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description || '',
      duration: String(service.duration),
      price: String(service.price),
      category: service.category || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        duration: parseInt(form.duration),
        price: parseFloat(form.price),
        category: form.category || undefined,
      };
      if (editing) {
        await serviceService.update(editing.id, payload);
      } else {
        await serviceService.create(payload);
      }
      setModalOpen(false);
      loadServices(pagination.page);
    } catch { /* handled */ }
    setLoading(false);
  };

  const toggleActive = async (service: Service) => {
    await serviceService.update(service.id, { isActive: !service.isActive });
    loadServices(pagination.page);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await serviceService.delete(id);
    loadServices(pagination.page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <Button onClick={openCreate}><PlusIcon className="h-4 w-4 mr-1" /> Add Service</Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadServices(1, search)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Button variant="secondary" onClick={() => loadServices(1, search)}>Search</Button>
      </div>

      {services.length === 0 ? (
        <EmptyState title="No services yet" description="Create your first service offering" actionLabel="Add Service" onAction={openCreate} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    {service.category && <p className="text-xs text-gray-500 mt-0.5">{service.category}</p>}
                  </div>
                  <Badge variant={service.isActive ? 'success' : 'default'}>{service.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                {service.description && <p className="text-sm text-gray-600 mb-3">{service.description}</p>}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{service.duration} min</span>
                  <span className="font-semibold text-gray-900">${Number(service.price).toFixed(2)}</span>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => openEdit(service)} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Edit</button>
                  <button onClick={() => toggleActive(service)} className="text-sm text-gray-600 hover:text-gray-800 font-medium">{service.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => handleDelete(service.id)} className="text-sm text-red-600 hover:text-red-800 font-medium ml-auto">Delete</button>
                </div>
              </div>
            ))}
          </div>
          <PaginationComponent currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={loadServices} />
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Service' : 'Add Service'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Service Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration (min)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required min="1" />
            <Input label="Price ($)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" step="0.01" />
          </div>
          <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          {form.name && form.price && (
            <PricingSuggestion
              serviceName={form.name}
              currentPrice={parseFloat(form.price) || 0}
              category={form.category}
              serviceId={editing?.id}
              onApply={(price) => setForm({ ...form, price: String(price) })}
            />
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
