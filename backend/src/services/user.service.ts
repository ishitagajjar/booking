import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';

const prisma = new PrismaClient();

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, businessName: true, phone: true, avatarUrl: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; businessName?: string; phone?: string; avatarUrl?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, businessName: true, phone: true, avatarUrl: true, createdAt: true, updatedAt: true },
    });
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) throw new Error('Current password is incorrect');

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  }
}
