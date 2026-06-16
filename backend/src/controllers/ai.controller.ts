import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../types';
import { generateInvoiceDescription } from '../services/ai-invoice.service';
import { generateClientInsights } from '../services/ai-client.service';
import { generateFollowUpEmail } from '../services/ai-email.service';
import { parseSearchQuery, executeSearch } from '../services/ai-search.service';
import { suggestPricing } from '../services/ai-pricing.service';
import { chat } from '../services/ai-chat.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AIController {
  /**
   * Generate invoice description from booking details
   */
  async generateInvoiceDescription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { bookingDetails } = req.body;

      const description = await generateInvoiceDescription(bookingDetails);

      ApiResponse.success(res, { description }, 'Invoice description generated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate client insights
   */
  async generateClientInsights(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { clientHistory } = req.body;

      const insights = await generateClientInsights(clientHistory);

      ApiResponse.success(res, insights, 'Client insights generated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate follow-up email
   */
  async generateFollowUpEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { context } = req.body;

      const email = await generateFollowUpEmail(context);

      ApiResponse.success(res, email, 'Email drafted');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Natural language search
   */
  async naturalLanguageSearch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { query } = req.body;

      const parsed = await parseSearchQuery(query);
      const results = await executeSearch(parsed, prisma, req.userId!);

      ApiResponse.success(res, { query: parsed, results }, 'Search completed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Smart pricing suggestions
   */
  async suggestPricing(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { data } = req.body;

      const suggestion = await suggestPricing(data);

      ApiResponse.success(res, suggestion, 'Pricing suggestion generated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Chat assistant with tool use
   */
  async chatAssistant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { messages } = req.body;

      const response = await chat(messages, prisma, req.userId!);

      // Extract text content from Groq response
      const content = response.choices[0].message.content;

      // Return in format frontend expects
      ApiResponse.success(res, {
        content: [{ type: 'text', text: content || '' }],
      });
    } catch (error: any) {
      ApiResponse.error(res, error.message || 'Chat failed', 500);
    }
  }
}

