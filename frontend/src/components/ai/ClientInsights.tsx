import { useState } from 'react';
import { SparklesIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { aiService } from '@/services/aiService';
import { Client, ClientHistory, ClientInsights } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

function buildClientHistory(client: Client): ClientHistory {
  const bookings = client.bookings || [];
  const totalBookings = bookings.length;
  const totalSpent = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
  const avgBookingValue = totalBookings > 0 ? totalSpent / totalBookings : 0;

  let lastBookingDaysAgo = 0;
  if (bookings.length > 0) {
    const sorted = [...bookings].sort(
      (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime(),
    );
    const lastDate = new Date(sorted[0].bookingDate);
    lastBookingDaysAgo = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  let bookingFrequency = 'none';
  if (totalBookings >= 12) bookingFrequency = 'weekly';
  else if (totalBookings >= 4) bookingFrequency = 'monthly';
  else if (totalBookings >= 1) bookingFrequency = 'occasional';

  return {
    name: client.name,
    totalBookings,
    totalSpent,
    avgBookingValue,
    lastBookingDaysAgo,
    bookingFrequency,
  };
}

const riskVariant: Record<ClientInsights['riskLevel'], 'success' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
};

interface ClientInsightsPanelProps {
  client: Client;
}

export default function ClientInsightsPanel({ client }: ClientInsightsPanelProps) {
  const [insights, setInsights] = useState<ClientInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await aiService.generateClientInsights(buildClientHistory(client));
      if (data.IsSuccess && data.Data) {
        setInsights(data.Data);
      }
    } catch {
      setError('Failed to generate insights. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Card title="AI Client Insights">
      {!insights ? (
        <div className="text-center py-4">
          <LightBulbIcon className="h-10 w-10 text-violet-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-4">
            Analyze booking history to get patterns, suggestions, and risk assessment.
          </p>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <Button onClick={handleAnalyze} loading={loading} size="sm">
            <SparklesIcon className="h-4 w-4 mr-1" /> Analyze Client
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant={riskVariant[insights.riskLevel]}>
              {`${insights.riskLevel} risk`}
            </Badge>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="text-xs text-violet-600 hover:text-violet-800 font-medium"
            >
              Refresh
            </button>
          </div>

          <p className="text-sm text-gray-700">{insights.summary}</p>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Lifetime Value</p>
            <p className="text-sm font-semibold text-gray-900">{insights.lifetimeValue}</p>
          </div>

          {insights.patterns.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Patterns</p>
              <ul className="space-y-1">
                {insights.patterns.map((p, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-violet-400 shrink-0">•</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Suggestions</p>
              <ul className="space-y-1">
                {insights.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-indigo-400 shrink-0">→</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
