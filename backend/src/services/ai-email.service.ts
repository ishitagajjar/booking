import { askAI } from './ai.service';

const SYSTEM_PROMPT = `You are a professional business email writer. Generate ready-to-send emails that are polite, professional, and concise. Return ONLY valid JSON with no additional text.`;

export interface DraftedEmail {
  subject: string;
  body: string;
}

const FALLBACK_EMAIL: DraftedEmail = {
  subject: 'Follow-up',
  body: 'Dear Client,\n\nPlease let us know if you have any questions.\n\nBest regards',
};

/**
 * Generate a professional follow-up email
 */
export async function generateFollowUpEmail(context: {
  type: 'overdue_invoice' | 'post_booking' | 'appointment_reminder';
  clientName: string;
  amount?: number;
  daysOverdue?: number;
  appointmentDate?: string;
  businessName?: string;
}): Promise<DraftedEmail> {
  let prompt = '';

  if (context.type === 'overdue_invoice') {
    prompt = `Draft a polite reminder email for an overdue invoice.
Client: ${context.clientName}
Amount: $${context.amount}
Days Overdue: ${context.daysOverdue}
Business: ${context.businessName || 'Our Business'}`;
  } else if (context.type === 'post_booking') {
    prompt = `Draft a thank-you and follow-up email after a booking.
Client: ${context.clientName}
Business: ${context.businessName || 'Our Business'}`;
  } else if (context.type === 'appointment_reminder') {
    prompt = `Draft a friendly appointment reminder email.
Client: ${context.clientName}
Appointment Date: ${context.appointmentDate}
Business: ${context.businessName || 'Our Business'}`;
  }

  prompt += '\n\nRespond with JSON: { subject, body }. No markdown or extra text.';

  try {
    const response = await askAI(SYSTEM_PROMPT, prompt, 512, true);
    const parsed = JSON.parse(response) as DraftedEmail;
    return parsed;
  } catch (error) {
    console.error('Error parsing email draft JSON:', error);
    return FALLBACK_EMAIL;
  }
}
