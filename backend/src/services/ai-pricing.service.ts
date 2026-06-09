import { askAI } from './ai.service';

const SYSTEM_PROMPT = `You are a pricing analyst. Analyze service pricing data and suggest optimal prices. Return ONLY valid JSON with no additional text.`;

export interface PricingSuggestion {
  suggestedPrice: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
  priceRange: {
    min: number;
    max: number;
  };
  insights: string[];
}

const FALLBACK_PRICING: PricingSuggestion = {
  suggestedPrice: 0,
  confidence: 'low',
  reasoning: 'Could not analyze pricing data',
  priceRange: { min: 0, max: 0 },
  insights: [],
};

/**
 * Generate smart pricing suggestions based on historical data
 */
export async function suggestPricing(data: {
  serviceName: string;
  currentPrice: number;
  category: string;
  totalBookings: number;
  avgRating?: number;
  marketAverage?: number;
  recentBookingPrices: number[];
  demandLevel: 'low' | 'medium' | 'high';
}): Promise<PricingSuggestion> {
  const userMessage = `Analyze pricing for this service:
Service: ${data.serviceName}
Category: ${data.category}
Current Price: $${data.currentPrice}
Total Bookings: ${data.totalBookings}
Average Rating: ${data.avgRating || 'N/A'}
Market Average: $${data.marketAverage || 'Unknown'}
Recent Booking Prices: ${data.recentBookingPrices.map((p) => `$${p}`).join(', ')}
Demand Level: ${data.demandLevel}

Suggest an optimal price with reasoning. Return JSON:
{
  "suggestedPrice": number,
  "confidence": "low|medium|high",
  "reasoning": "explanation",
  "priceRange": { "min": number, "max": number },
  "insights": ["insight1", "insight2"]
}`;

  try {
    const response = await askAI(SYSTEM_PROMPT, userMessage, 400, true);
    const parsed = JSON.parse(response) as PricingSuggestion;
    return parsed;
  } catch (error) {
    console.error('Error parsing pricing suggestion JSON:', error);
    return FALLBACK_PRICING;
  }
}
