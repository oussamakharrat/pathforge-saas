import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export function createPrismaClient(connectionString?: string) {
  const adapter = new PrismaPg({
    connectionString:
      connectionString ?? process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

/** Inferred client type — includes all generated model delegates. */
export type AppPrismaClient = ReturnType<typeof createPrismaClient>;
