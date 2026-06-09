import { askAI } from './ai.service';

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
  const { entity, filters, sort } = parsed;

  // Example implementations - adapt to your exact schema
  switch (entity) {
    case 'bookings':
      return prisma.booking.findMany({
        where: { userId, ...filters },
        orderBy: { [sort]: 'desc' },
        include: { client: true, service: true },
      });

    case 'invoices':
      return prisma.invoice.findMany({
        where: { userId, ...filters },
        orderBy: { [sort]: 'desc' },
        include: { client: true, items: true },
      });

    case 'clients':
      return prisma.client.findMany({
        where: { userId, ...filters },
        orderBy: { [sort]: 'desc' },
      });

    case 'services':
      return prisma.service.findMany({
        where: { userId, ...filters },
        orderBy: { [sort]: 'desc' },
      });

    default:
      return [];
  }
}
