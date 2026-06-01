import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class BookingService {
  async getAll(userId: string, page = 1, limit = 10, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { userId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { service: { name: { contains: search, mode: 'insensitive' } } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: { client: true, service: true },
        orderBy: { bookingDate: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, userId: string) {
    const booking = await prisma.booking.findFirst({
      where: { id, userId },
      include: { client: true, service: true },
    });
    if (!booking) throw new Error('Booking not found');
    return booking;
  }

  async create(
    userId: string,
    data: {
      clientId: string;
      serviceId: string;
      bookingDate: string;
      startTime: string;
      endTime: string;
      notes?: string;
      totalAmount: number;
      status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    }
  ) {
    return prisma.booking.create({
      data: {
        userId,
        clientId: data.clientId,
        serviceId: data.serviceId,
        bookingDate: new Date(data.bookingDate),
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
        totalAmount: new Prisma.Decimal(data.totalAmount),
        status: data.status || 'PENDING',
      },
      include: { client: true, service: true },
    });
  }

  async update(
    id: string,
    userId: string,
    data: {
      clientId?: string;
      serviceId?: string;
      bookingDate?: string;
      startTime?: string;
      endTime?: string;
      notes?: string;
      totalAmount?: number;
      status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    }
  ) {
    const booking = await prisma.booking.findFirst({ where: { id, userId } });
    if (!booking) throw new Error('Booking not found');

    const updateData: Record<string, unknown> = { ...data };
    if (data.bookingDate) updateData.bookingDate = new Date(data.bookingDate);
    if (data.totalAmount !== undefined) updateData.totalAmount = new Prisma.Decimal(data.totalAmount);

    return prisma.booking.update({
      where: { id },
      data: updateData,
      include: { client: true, service: true },
    });
  }

  async delete(id: string, userId: string) {
    const booking = await prisma.booking.findFirst({ where: { id, userId } });
    if (!booking) throw new Error('Booking not found');
    return prisma.booking.delete({ where: { id } });
  }
}
