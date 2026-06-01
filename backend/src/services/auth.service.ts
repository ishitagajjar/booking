import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { config } from '../config';

const prisma = new PrismaClient();

export class AuthService {
  async register(data: { email: string; password: string; name: string; businessName?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        businessName: data.businessName,
      },
      select: { id: true, email: true, name: true, businessName: true },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + config.refreshTokenExpiryMs),
      },
    });

    return { user, accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + config.refreshTokenExpiryMs),
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  async refresh(oldRefreshToken: string) {
    const stored = await prisma.refreshToken.findFirst({
      where: { token: oldRefreshToken },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await prisma.refreshToken.delete({ where: { id: stored.id } });
      }
      throw new Error('Invalid or expired refresh token');
    }

    // Rotate token
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const accessToken = generateAccessToken(stored.userId);
    const refreshToken = generateRefreshToken(stored.userId);

    await prisma.refreshToken.create({
      data: {
        userId: stored.userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + config.refreshTokenExpiryMs),
      },
    });

    return { accessToken, refreshToken };
  }
}
