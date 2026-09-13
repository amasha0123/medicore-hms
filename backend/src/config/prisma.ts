import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

export async function connectDB(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl.includes('[') || dbUrl.includes(']')) {
    logger.error('DATABASE_URL in .env contains unreplaced placeholders (e.g. [YOUR-PASSWORD] or [REGION]).');
    logger.error('Please get your exact URI from: Supabase Dashboard -> Project Settings -> Database -> Connection String (URI).');
    process.exit(1);
  }

  try {
    await prisma.$connect();
    logger.info('Connected to Supabase (PostgreSQL) Database via Prisma ORM');
  } catch (error) {
    logger.error({ err: error }, 'Failed to connect to Supabase (PostgreSQL) database. Please check your credentials in .env');
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
}
