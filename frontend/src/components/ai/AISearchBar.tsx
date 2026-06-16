import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { aiService } from '@/services/aiService';
import { Booking, Client, Invoice, ParsedSearch, Service } from '@/types';
import Badge from '@/components/ui/Badge';

function ResultItem({ item, entity, onNavigate }: { item: unknown; entity: ParsedSearch['entity']; onNavigate: (path: string) => void }) {
  if (entity === 'bookings') {
    const b = item as Booking;
    return (
      <button
        onClick={() => onNavigate('/bookings')}
        className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{b.client?.name || 'Unknown client'}</p>
            <p className="text-xs text-gray-500">{b.service?.name} · {new Date(b.bookingDate).toLocaleDateString()}</p>
          </div>
          <Badge variant={b.status === 'COMPLETED' ? 'success' : b.status === 'CANCELLED' ? 'danger' : 'info'}>
            {b.status}
          </Badge>
        </div>
      </button>
    );
  }

  if (entity === 'invoices') {
    const inv = item as Invoice;
    return (
      <button
        onClick={() => onNavigate(`/invoices/${inv.id}`)}
        className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{inv.invoiceNumber}</p>
            <p className="text-xs text-gray-500">{inv.client?.name} · ${Number(inv.total).toFixed(2)}</p>
          </div>
          <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'OVERDUE' ? 'danger' : 'info'}>
            {inv.status}
          </Badge>
        </div>
      </button>
    );
  }

  if (entity === 'clients') {
    const c = item as Client;
    return (
      <button
        onClick={() => onNavigate(`/clients/${c.id}`)}
        className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <p className="text-sm font-medium text-gray-900">{c.name}</p>
        {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
      </button>
    );
  }

  const s = item as Service;
  return (
    <button
      onClick={() => onNavigate('/services')}
      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">{s.name}</p>
          <p className="text-xs text-gray-500">{s.duration} min · {s.category || 'Uncategorized'}</p>
        </div>
        <span className="text-sm font-medium text-gray-900">${Number(s.price).toFixed(2)}</span>
      </div>
    </button>
  );
}

export default function AISearchBar() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedSearch | null>(null);
  const [results, setResults] = useState<unknown[]>([]);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await aiService.naturalLanguageSearch(query.trim());
      if (data.IsSuccess && data.Data) {
        setParsed(data.Data.query);
        setResults(data.Data.results);
      }
    } catch {
      setParsed(null);
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100 p-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <SparklesIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "show overdue invoices" or "upcoming bookings this week"'
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-violet-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="inline-flex items-center px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <><MagnifyingGlassIcon className="h-4 w-4 mr-1" /> Search</>
          )}
        </button>
      </form>

      {searched && !loading && (
        <div className="mt-3">
          {parsed && (
            <p className="text-xs text-violet-600 mb-2">{parsed.explanation}</p>
          )}
          {results.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">No results found.</p>
          ) : (
            <div className="bg-white rounded-lg border border-violet-100 divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {results.map((item, i) => (
                <ResultItem
                  key={i}
                  item={item}
                  entity={parsed?.entity || 'bookings'}
                  onNavigate={navigate}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
