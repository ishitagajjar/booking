import { askAI } from './ai.service';

const SYSTEM_PROMPT = `You are a professional invoice writer. Generate concise, professional invoice line item descriptions based on booking and service details. Keep descriptions to 1-2 sentences max. Focus on what was delivered and value provided.`;

/**
 * Generate a professional invoice description from booking details
 */
export async function generateInvoiceDescription(bookingDetails: {
  serviceName: string;
  duration: number;
  notes?: string;
  clientName?: string;
}): Promise<string> {
  const userMessage = `Generate an invoice line item for:
Service: ${bookingDetails.serviceName}
Duration: ${bookingDetails.duration} minutes
Client: ${bookingDetails.clientName || 'N/A'}
Notes: ${bookingDetails.notes || 'None'}`;

  const description = await askAI(SYSTEM_PROMPT, userMessage, 256, false);
  return description.trim();
}
