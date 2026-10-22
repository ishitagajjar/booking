import { askAI } from './ai.service';
import { markOverdueInvoices } from './invoice.service';

const SYSTEM_PROMPT = `You are a query parser. Convert natural language search queries into structured search parameters. Return ONLY valid JSON with no additional text.`;

export interface ParsedSearch {
  entity: 'bookings' | 'invoices' | 'clients' | 'services';
  filters: Record<string, unknown>;
  sort: string;
  explanation: string;
}

const FALLBACK_SEARCH: ParsedSearch = {
  entity: 'bookings',
  filters: {},
  sort: 'createdAt',
  explanation: 'Could not parse search query',
};

/**
 * Parse natural language query into structured search
 */
export async function parseSearchQuery(query: string): Promise<ParsedSearch> {
  const userMessage = `Parse this search query and return structured parameters:
"${query}"

Respond with JSON:
{
  "entity": "bookings|invoices|clients|services",
  "filters": { ... filter object ... },
  "sort": "fieldName",
  "explanation": "what the search does"
}

Common filters:
- For bookings: status (PENDING, CONFIRMED, COMPLETED, CANCELLED), dateFrom, dateTo, clientId
- For invoices: status (DRAFT, SENT, PAID, OVERDUE), minAmount, maxAmount, dueDate
- For clients: searchTerm (name or email)
- For services: category, minPrice, maxPrice, isActive`;

  try {
    const response = await askAI(SYSTEM_PROMPT, userMessage, 300, true);
    const parsed = JSON.parse(response) as ParsedSearch;
    return parsed;
  } catch (error) {
    console.error('Error parsing search query:', error);
    return FALLBACK_SEARCH;
  }
}

const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
const INVOICE_STATUSES = ['DRAFT', 'SENT', 'PAID', 'OVERDUE'];

const SORT_FIELDS: Record<ParsedSearch['entity'], string[]> = {
  bookings: ['createdAt', 'bookingDate', 'totalAmount', 'status'],
  invoices: ['createdAt', 'dueDate', 'total', 'status', 'invoiceNumber'],
  clients: ['createdAt', 'name', 'email'],
  services: ['createdAt', 'name', 'price', 'duration'],
};

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  const num = typeof value === 'string' ? Number(value) : value;
  return typeof num === 'number' && Number.isFinite(num) ? num : undefined;
}

function asDate(value: unknown): Date | undefined {
  const str = asString(value);
  if (!str) return undefined;
  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * Translate LLM-produced filters into a Prisma where clause.
 * Only known keys are read, and each value is type-checked, so the model
 * cannot inject arbitrary Prisma conditions.
 */
function buildFilters(entity: ParsedSearch['entity'], filters: Record<string, unknown>): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  switch (entity) {
    case 'bookings': {
      const status = asString(filters.status)?.toUpperCase();
      if (status && BOOKING_STATUSES.includes(status)) where.status = status;
      const clientId = asString(filters.clientId);
      if (clientId) where.clientId = clientId;
      const dateFrom = asDate(filters.dateFrom);
      const dateTo = asDate(filters.dateTo);
      if (dateFrom || dateTo) where.bookingDate = { ...(dateFrom && { gte: dateFrom }), ...(dateTo && { lte: dateTo }) };
      break;
    }
    case 'invoices': {
      const status = asString(filters.status)?.toUpperCase();
      if (status && INVOICE_STATUSES.includes(status)) where.status = status;
      const minAmount = asNumber(filters.minAmount);
      const maxAmount = asNumber(filters.maxAmount);
      if (minAmount !== undefined || maxAmount !== undefined) {
        where.total = { ...(minAmount !== undefined && { gte: minAmount }), ...(maxAmount !== undefined && { lte: maxAmount }) };
      }
      const dueDate = asDate(filters.dueDate);
      if (dueDate) where.dueDate = { lte: dueDate };
      break;
    }
    case 'clients': {
      const term = asString(filters.searchTerm);
      if (term) {
        where.OR = [
          { name: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
        ];
      }
      break;
    }
    case 'services': {
      const category = asString(filters.category);
      if (category) where.category = { equals: category, mode: 'insensitive' };
      const minPrice = asNumber(filters.minPrice);
      const maxPrice = asNumber(filters.maxPrice);
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = { ...(minPrice !== undefined && { gte: minPrice }), ...(maxPrice !== undefined && { lte: maxPrice }) };
      }
      if (typeof filters.isActive === 'boolean') where.isActive = filters.isActive;
      break;
    }
  }

  return where;
}

/**
 * Execute a parsed search against the database
 * This would be called by the controller/route handler
 * and needs access to Prisma client
 */
export async function executeSearch(
  parsed: ParsedSearch,
  prisma: any, // PrismaClient type, passed from controller
  userId: string,
): Promise<unknown[]> {
  const { entity } = parsed;
  if (!(entity in SORT_FIELDS)) return [];

  const filters = parsed.filters && typeof parsed.filters === 'object' ? parsed.filters : {};
  // userId is set last so no filter value can override the tenant scope
  const where = { ...buildFilters(entity, filters), userId };
  const sort = SORT_FIELDS[entity].includes(parsed.sort) ? parsed.sort : 'createdAt';
  const orderBy = { [sort]: 'desc' };

  switch (entity) {
    case 'bookings':
      return prisma.booking.findMany({ where, orderBy, include: { client: true, service: true } });

    case 'invoices':
      await markOverdueInvoices(userId);
      return prisma.invoice.findMany({ where, orderBy, include: { client: true, items: true } });

    case 'clients':
      return prisma.client.findMany({ where, orderBy });

    case 'services':
      return prisma.service.findMany({ where, orderBy });

    default:
      return [];
  }
}
