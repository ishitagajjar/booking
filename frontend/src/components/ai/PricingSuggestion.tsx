import { useState } from 'react';
import { SparklesIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { aiService } from '@/services/aiService';
import { bookingService } from '@/services/bookingService';
import { PricingSuggestion as PricingSuggestionType } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface PricingSuggestionProps {
  serviceName: string;
  currentPrice: number;
  category: string;
  serviceId?: string;
  onApply?: (price: number) => void;
}

export default function PricingSuggestion({
  serviceName,
  currentPrice,
  category,
  serviceId,
  onApply,
}: PricingSuggestionProps) {
  const [suggestion, setSuggestion] = useState<PricingSuggestionType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!serviceName || currentPrice <= 0) return;
    setLoading(true);
    try {
      let recentBookingPrices: number[] = [];
      let totalBookings = 0;

      if (serviceId) {
        const { data } = await bookingService.getAll(1, 100);
        if (data.Data) {
          const allBookings = (data.Data as { bookings: { serviceId: string; totalAmount: number }[] }).bookings;
          const serviceBookings = allBookings.filter((b) => b.serviceId === serviceId);
          totalBookings = serviceBookings.length;
          recentBookingPrices = serviceBookings.slice(0, 10).map((b) => Number(b.totalAmount));
        }
      }

      let demandLevel: 'low' | 'medium' | 'high' = 'low';
      if (totalBookings >= 10) demandLevel = 'high';
      else if (totalBookings >= 3) demandLevel = 'medium';

      const { data } = await aiService.suggestPricing({
        serviceName,
        currentPrice,
        category: category || 'General',
        totalBookings,
        recentBookingPrices,
        demandLevel,
      });

      if (data.IsSuccess && data.Data) {
        setSuggestion(data.Data);
      }
    } catch {
      // handled silently
    }
    setLoading(false);
  };

  const confidenceVariant: Record<PricingSuggestionType['confidence'], 'success' | 'warning' | 'default'> = {
    high: 'success',
    medium: 'warning',
    low: 'default',
  };

  return (
    <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-3">
      {!suggestion ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-violet-700">
            <ArrowTrendingUpIcon className="h-4 w-4" />
            <span>Get AI pricing suggestions</span>
          </div>
          <Button variant="secondary" size="sm" onClick={handleAnalyze} loading={loading} disabled={!serviceName || currentPrice <= 0}>
            <SparklesIcon className="h-4 w-4 mr-1" /> Analyze
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">${suggestion.suggestedPrice.toFixed(2)}</span>
              <Badge variant={confidenceVariant[suggestion.confidence]}>{`${suggestion.confidence} confidence`}</Badge>
            </div>
            <button onClick={handleAnalyze} disabled={loading} className="text-xs text-violet-600 hover:text-violet-800">
              Refresh
            </button>
          </div>

          <p className="text-sm text-gray-600">{suggestion.reasoning}</p>

          <p className="text-xs text-gray-500">
            Suggested range: ${suggestion.priceRange.min.toFixed(2)} – ${suggestion.priceRange.max.toFixed(2)}
          </p>

          {suggestion.insights.length > 0 && (
            <ul className="space-y-1">
              {suggestion.insights.map((insight, i) => (
                <li key={i} className="text-xs text-gray-600">• {insight}</li>
              ))}
            </ul>
          )}

          {onApply && (
            <Button size="sm" onClick={() => onApply(suggestion.suggestedPrice)}>
              Apply ${suggestion.suggestedPrice.toFixed(2)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
