// Database service layer for Prisma
// This file provides a clean interface for database operations

import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

// Database service class for common operations
export class DatabaseService {
  static async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }

  // User operations
  static async createUser(data: {
    email: string;
    name: string;
    password: string;
    walletAddress?: string;
  }) {
    return await prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        createdAt: true,
      },
    });
  }

  static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  static async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async updateUser(id: string, data: {
    name?: string;
    walletAddress?: string;
  }) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        updatedAt: true,
      },
    });
  }

  static async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  static async getUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    const { page = 1, limit = 10, search } = options;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          walletAddress: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

// Export the prisma instance as default
export default prisma;
