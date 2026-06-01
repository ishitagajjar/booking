import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class InvoiceService {
  private async generateInvoiceNumber(userId: string): Promise<string> {
    const lastInvoice = await prisma.invoice.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    });

    if (!lastInvoice) return 'INV-0001';

    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1], 10);
    return `INV-${String(lastNumber + 1).padStart(4, '0')}`;
  }

  async getAll(userId: string, page = 1, limit = 10, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { userId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: { client: true, items: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, userId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
      include: { client: true, booking: { include: { service: true } }, items: true },
    });
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  }

  async create(
    userId: string,
    data: {
      clientId: string;
      bookingId?: string;
      items: { description: string; quantity: number; unitPrice: number }[];
      taxRate?: number;
      dueDate: string;
      notes?: string;
    }
  ) {
    const invoiceNumber = await this.generateInvoiceNumber(userId);

    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxRate = data.taxRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    return prisma.invoice.create({
      data: {
        userId,
        clientId: data.clientId,
        bookingId: data.bookingId,
        invoiceNumber,
        subtotal: new Prisma.Decimal(subtotal),
        taxRate: new Prisma.Decimal(taxRate),
        taxAmount: new Prisma.Decimal(taxAmount),
        total: new Prisma.Decimal(total),
        dueDate: new Date(data.dueDate),
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            total: new Prisma.Decimal(item.quantity * item.unitPrice),
          })),
        },
      },
      include: { client: true, items: true },
    });
  }

  async update(
    id: string,
    userId: string,
    data: {
      status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
      taxRate?: number;
      dueDate?: string;
      paidDate?: string;
      notes?: string;
      items?: { description: string; quantity: number; unitPrice: number }[];
    }
  ) {
    const invoice = await prisma.invoice.findFirst({ where: { id, userId } });
    if (!invoice) throw new Error('Invoice not found');

    const updateData: Record<string, unknown> = {};
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.paidDate) updateData.paidDate = new Date(data.paidDate);

    if (data.items) {
      // Recalculate totals
      const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const taxRate = data.taxRate ?? Number(invoice.taxRate);
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      updateData.subtotal = new Prisma.Decimal(subtotal);
      updateData.taxRate = new Prisma.Decimal(taxRate);
      updateData.taxAmount = new Prisma.Decimal(taxAmount);
      updateData.total = new Prisma.Decimal(total);

      // Delete old items and create new ones
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      updateData.items = {
        create: data.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: new Prisma.Decimal(item.unitPrice),
          total: new Prisma.Decimal(item.quantity * item.unitPrice),
        })),
      };
    } else if (data.taxRate !== undefined) {
      const subtotal = Number(invoice.subtotal);
      const taxAmount = subtotal * (data.taxRate / 100);
      updateData.taxRate = new Prisma.Decimal(data.taxRate);
      updateData.taxAmount = new Prisma.Decimal(taxAmount);
      updateData.total = new Prisma.Decimal(subtotal + taxAmount);
    }

    return prisma.invoice.update({
      where: { id },
      data: updateData,
      include: { client: true, items: true },
    });
  }

  async delete(id: string, userId: string) {
    const invoice = await prisma.invoice.findFirst({ where: { id, userId } });
    if (!invoice) throw new Error('Invoice not found');
    return prisma.invoice.delete({ where: { id } });
  }
}
