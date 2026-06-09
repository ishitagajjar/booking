import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
const aiController = new AIController();

// All AI routes require authentication
router.use(authenticate);

/**
 * AI Features
 */
router.post('/invoice-description', (req, res, next) =>
  aiController.generateInvoiceDescription(req, res, next),
);

router.post('/client-insights', (req, res, next) =>
  aiController.generateClientInsights(req, res, next),
);

router.post('/follow-up-email', (req, res, next) =>
  aiController.generateFollowUpEmail(req, res, next),
);

router.post('/search', (req, res, next) =>
  aiController.naturalLanguageSearch(req, res, next),
);

router.post('/suggest-pricing', (req, res, next) =>
  aiController.suggestPricing(req, res, next),
);

router.post('/chat', (req, res, next) =>
  aiController.chatAssistant(req, res, next),
);

export default router;
