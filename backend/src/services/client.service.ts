import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ClientService {
  async getAll(userId: string, page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { userId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.client.count({ where }),
    ]);

    return {
      clients,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, userId: string) {
    const client = await prisma.client.findFirst({
      where: { id, userId },
      include: { bookings: { include: { service: true }, orderBy: { bookingDate: 'desc' } } },
    });
    if (!client) throw new Error('Client not found');
    return client;
  }

  async create(userId: string, data: { name: string; email?: string; phone?: string; address?: string; notes?: string }) {
    return prisma.client.create({ data: { ...data, userId } });
  }

  async update(id: string, userId: string, data: { name?: string; email?: string; phone?: string; address?: string; notes?: string }) {
    const client = await prisma.client.findFirst({ where: { id, userId } });
    if (!client) throw new Error('Client not found');
    return prisma.client.update({ where: { id }, data });
  }

  async delete(id: string, userId: string) {
    const client = await prisma.client.findFirst({ where: { id, userId } });
    if (!client) throw new Error('Client not found');
    return prisma.client.delete({ where: { id } });
  }
}
