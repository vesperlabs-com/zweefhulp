import { PrismaClient } from "@/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

// Singleton pattern to prevent multiple Prisma Client instances in serverless
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = 
  globalForPrisma.prisma || 
  new PrismaClient({
    adapter: new PrismaNeon({ 
      connectionString: process.env.DATABASE_URL 
    })
  })

// Store in global to reuse across hot reloads in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
