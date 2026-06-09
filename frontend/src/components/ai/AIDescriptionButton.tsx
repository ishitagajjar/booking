import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { aiService } from '@/services/aiService';
import { BookingDetails } from '@/types';

interface AIDescriptionButtonProps {
  bookingDetails: BookingDetails;
  onGenerated: (description: string) => void;
  disabled?: boolean;
}

export default function AIDescriptionButton({ bookingDetails, onGenerated, disabled }: AIDescriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!bookingDetails.serviceName.trim()) return;
    setLoading(true);
    try {
      const { data } = await aiService.generateInvoiceDescription(bookingDetails);
      if (data.IsSuccess && data.Data?.description) {
        onGenerated(data.Data.description);
      }
    } catch {
      // handled silently
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={disabled || loading || !bookingDetails.serviceName.trim()}
      title="Generate with AI"
      className="p-2 rounded-lg text-violet-600 hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <SparklesIcon className="h-4 w-4" />
      )}
    </button>
  );
}
