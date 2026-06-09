import { askAI } from './ai.service';

const SYSTEM_PROMPT = `You are a business analyst. Analyze client booking history and provide structured insights. Return ONLY valid JSON with no additional text.`;

export interface ClientInsights {
  summary: string;
  patterns: string[];
  suggestions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  lifetimeValue: string;
}

const FALLBACK_INSIGHTS: ClientInsights = {
  summary: 'Unable to generate insights at this time',
  patterns: [],
  suggestions: [],
  riskLevel: 'low',
  lifetimeValue: 'Unknown',
};

/**
 * Generate AI-powered client insights from booking history
 */
export async function generateClientInsights(clientHistory: {
  name: string;
  totalBookings: number;
  totalSpent: number;
  avgBookingValue: number;
  lastBookingDaysAgo: number;
  bookingFrequency: string;
}): Promise<ClientInsights> {
  const userMessage = `Analyze this client:
Name: ${clientHistory.name}
Total Bookings: ${clientHistory.totalBookings}
Total Spent: $${clientHistory.totalSpent}
Average Booking Value: $${clientHistory.avgBookingValue}
Last Booking: ${clientHistory.lastBookingDaysAgo} days ago
Booking Frequency: ${clientHistory.bookingFrequency}

Provide insights in JSON format with fields: summary, patterns (array), suggestions (array), riskLevel, lifetimeValue`;

  try {
    const response = await askAI(SYSTEM_PROMPT, userMessage, 500, true);
    const parsed = JSON.parse(response) as ClientInsights;
    return parsed;
  } catch (error) {
    console.error('Error parsing client insights JSON:', error);
    return FALLBACK_INSIGHTS;
  }
}
