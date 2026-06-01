import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class ServiceService {
  async getAll(userId: string, page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { userId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.service.count({ where }),
    ]);

    return {
      services,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, userId: string) {
    const service = await prisma.service.findFirst({ where: { id, userId } });
    if (!service) throw new Error('Service not found');
    return service;
  }

  async create(
    userId: string,
    data: { name: string; description?: string; duration: number; price: number; category?: string; isActive?: boolean }
  ) {
    return prisma.service.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: new Prisma.Decimal(data.price),
        category: data.category,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    data: { name?: string; description?: string; duration?: number; price?: number; category?: string; isActive?: boolean }
  ) {
    const service = await prisma.service.findFirst({ where: { id, userId } });
    if (!service) throw new Error('Service not found');

    const updateData: Record<string, unknown> = { ...data };
    if (data.price !== undefined) {
      updateData.price = new Prisma.Decimal(data.price);
    }

    return prisma.service.update({ where: { id }, data: updateData });
  }

  async delete(id: string, userId: string) {
    const service = await prisma.service.findFirst({ where: { id, userId } });
    if (!service) throw new Error('Service not found');
    return prisma.service.delete({ where: { id } });
  }
}
