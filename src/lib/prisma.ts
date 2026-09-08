import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { getRequestContext } from '@cloudflare/next-on-pages';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let edgePrisma: PrismaClient | undefined;

function getClient(): PrismaClient {
  try {
    const ctx = getRequestContext();
    if (ctx?.env?.DB) {
      if (!edgePrisma) {
        const adapter = new PrismaD1(ctx.env.DB);
        edgePrisma = new PrismaClient({ adapter });
      }
      return edgePrisma;
    }
  } catch (e) {
    // getRequestContext throws if not in edge request context
  }

  // Fallback to local Node.js Prisma Client
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ log: ['error'] });
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get: (_, prop) => {
    const client = getClient();
    return (client as any)[prop];
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = globalForPrisma.prisma || getClient();
}
