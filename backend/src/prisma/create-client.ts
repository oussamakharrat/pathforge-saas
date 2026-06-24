import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export function createPrismaClient(connectionString?: string): PrismaClient {
  const adapter = new PrismaPg({
    connectionString:
      connectionString ?? process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}
