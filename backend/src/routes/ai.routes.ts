import { Router } from 'express';
import { z } from 'zod';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { rateLimit } from '../middlewares/rateLimit';

const router = Router();
const aiController = new AIController();

// Bounds keep prompts small so one request cannot use a large share of the Groq quota
const text = (max: number) => z.string().trim().min(1).max(max);
const num = z.coerce.number().finite();

const invoiceDescriptionSchema = z.object({
  bookingDetails: z.object({
    serviceName: text(200),
    duration: num.nonnegative(),
    notes: z.string().max(1000).nullish(),
    clientName: z.string().max(200).nullish(),
  }),
});

const clientInsightsSchema = z.object({
  clientHistory: z.object({
    name: text(200),
    totalBookings: num.nonnegative(),
    totalSpent: num,
    avgBookingValue: num,
    lastBookingDaysAgo: num,
    bookingFrequency: z.string().max(200),
  }),
});

const followUpEmailSchema = z.object({
  context: z.object({
    type: z.enum(['overdue_invoice', 'post_booking', 'appointment_reminder']),
    clientName: text(200),
    amount: num.nullish(),
    daysOverdue: num.nullish(),
    appointmentDate: z.string().max(100).nullish(),
    businessName: z.string().max(200).nullish(),
  }),
});

const searchSchema = z.object({
  query: text(300),
});

const pricingSchema = z.object({
  data: z.object({
    serviceName: text(200),
    currentPrice: num.nonnegative(),
    category: z.string().max(100),
    totalBookings: num.nonnegative(),
    avgRating: num.nullish(),
    marketAverage: num.nullish(),
    recentBookingPrices: z.array(num).max(100),
    demandLevel: z.enum(['low', 'medium', 'high']),
  }),
});

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        // Only user/assistant: a client-sent "system" message could override the assistant's instructions
        role: z.enum(['user', 'assistant']),
        content: z.string().max(4000),
      }),
    )
    .min(1)
    .max(30),
});

// All AI routes require authentication
router.use(authenticate);
router.use(rateLimit({ windowMs: 60 * 1000, max: 20 }));

/**
 * AI Features
 */
router.post('/invoice-description', validate({ body: invoiceDescriptionSchema }), (req, res, next) =>
  aiController.generateInvoiceDescription(req, res, next),
);

router.post('/client-insights', validate({ body: clientInsightsSchema }), (req, res, next) =>
  aiController.generateClientInsights(req, res, next),
);

router.post('/follow-up-email', validate({ body: followUpEmailSchema }), (req, res, next) =>
  aiController.generateFollowUpEmail(req, res, next),
);

router.post('/search', validate({ body: searchSchema }), (req, res, next) =>
  aiController.naturalLanguageSearch(req, res, next),
);

router.post('/suggest-pricing', validate({ body: pricingSchema }), (req, res, next) =>
  aiController.suggestPricing(req, res, next),
);

router.post('/chat', validate({ body: chatSchema }), (req, res, next) =>
  aiController.chatAssistant(req, res, next),
);

export default router;
