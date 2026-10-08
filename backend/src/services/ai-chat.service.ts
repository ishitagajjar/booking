import Groq from 'groq-sdk';
import { config } from '../config';

const groq = new Groq({
  apiKey: config.groq.apiKey,
});

// Tools in OpenAI-compatible format (NOT Claude format)
const tools: any[] = [
  {
    type: 'function',
    function: {
      name: 'get_dashboard_stats',
      description:
        'Get overview stats: total bookings, revenue, pending invoices, upcoming bookings. Returns aggregated business metrics.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_clients',
      description: 'Search and list clients by name or email. Returns matching client records.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search term: client name or email',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_upcoming_bookings',
      description: 'Get upcoming bookings for next N days. Returns list of confirmed and pending bookings.',
      parameters: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            description: 'Number of days ahead (default 7)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_overdue_invoices',
      description: 'Get all overdue invoices. Returns unpaid invoices past their due date.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
];

/**
 * Execute a tool call and return the result as a string
 * Prisma client must be passed in from the controller
 */
async function executeTool(
  name: string,
  input: Record<string, unknown>,
  prisma: any,
  userId: string,
): Promise<string> {
  try {
    switch (name) {
      case 'get_dashboard_stats': {
        const totalBookings = await prisma.booking.count({ where: { userId } });
        const bookings = await prisma.booking.findMany({
          where: { userId, status: 'COMPLETED' },
          select: { totalAmount: true },
        });
        const revenue = bookings.reduce((sum: number, b: any) => sum + Number(b.totalAmount), 0);
        const pendingInvoices = await prisma.invoice.count({
          where: { userId, status: { in: ['DRAFT', 'SENT'] } },
        });
        const upcomingBookings = await prisma.booking.count({
          where: {
            userId,
            bookingDate: { gte: new Date() },
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
        });

        return JSON.stringify({
          totalBookings,
          revenue: `$${revenue.toFixed(2)}`,
          pendingInvoices,
          upcomingBookings,
        });
      }

      case 'search_clients': {
        const query = String(input.query || '');
        const results = await prisma.client.findMany({
          where: {
            userId,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 10,
        });

        return JSON.stringify(results.length > 0 ? results : { message: 'No clients found' });
      }

      case 'get_upcoming_bookings': {
        const requested = Number(input.days);
        const days = Number.isFinite(requested) && requested > 0 ? Math.min(requested, 90) : 7;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const bookings = await prisma.booking.findMany({
          where: {
            userId,
            bookingDate: { gte: new Date(), lte: futureDate },
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          include: { client: true, service: true },
          orderBy: { bookingDate: 'asc' },
        });

        return JSON.stringify(bookings.length > 0 ? bookings : { message: 'No upcoming bookings' });
      }

      case 'get_overdue_invoices': {
        const invoices = await prisma.invoice.findMany({
          where: {
            userId,
            status: 'OVERDUE',
            dueDate: { lt: new Date() },
          },
          include: { client: true, items: true },
          orderBy: { dueDate: 'asc' },
        });

        return JSON.stringify(invoices.length > 0 ? invoices : { message: 'No overdue invoices' });
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error: any) {
    console.error(`Error executing tool ${name}:`, error);
    return JSON.stringify({ error: `Failed to execute ${name}: ${error.message}` });
  }
}

/**
 * Chat with tool use - main entry point
 * Groq uses OpenAI-compatible format for tool calls
 */
export async function chat(
  messages: Array<{ role: string; content: string }>,
  prisma: any,
  userId: string,
) {
  // Convert to Groq format
  const groqMessages: any[] = [
    {
      role: 'system',
      content: `You are BookFlow AI Assistant. Help users manage their bookings, clients, and invoices. 
Use the provided tools to fetch real data before answering questions. 
Be concise and helpful. Format numbers as currency where appropriate.
Always be professional and friendly.`,
    },
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  // The model may ask for tools several times in a row (e.g. stats, then clients).
  // Keep answering tool calls up to a limit so the reply is not left empty.
  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await groq.chat.completions.create({
      model: config.groq.model,
      max_tokens: 1000,
      tools,
      messages: groqMessages,
    });

    const choice = response.choices[0];
    const toolCalls = choice?.message?.tool_calls;
    if (!toolCalls?.length) return response;

    const toolResults = await Promise.all(
      toolCalls.map(async (toolCall: any) => ({
        role: 'tool' as const,
        tool_call_id: toolCall.id,
        content: await runToolCall(toolCall, prisma, userId),
      })),
    );

    groqMessages.push(choice.message, ...toolResults);
  }

  // Limit reached: ask for a plain answer from the data gathered so far
  return groq.chat.completions.create({
    model: config.groq.model,
    max_tokens: 1000,
    tools,
    tool_choice: 'none',
    messages: groqMessages,
  });
}

const MAX_TOOL_ROUNDS = 3;

async function runToolCall(toolCall: any, prisma: any, userId: string): Promise<string> {
  // Groq sends arguments as a JSON string, and the model can produce invalid JSON
  let args: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(toolCall.function?.arguments || '{}');
    if (parsed && typeof parsed === 'object') args = parsed;
  } catch {
    return JSON.stringify({ error: 'Invalid tool arguments: expected a JSON object' });
  }
  return executeTool(toolCall.function?.name, args, prisma, userId);
}
