import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    // 'query' logget hver eneste spørring til dev-loggen. Sett PRISMA_LOG_QUERIES=1
    // når du faktisk skal telle rundturer.
    log:
      process.env.NODE_ENV === 'development' && process.env.PRISMA_LOG_QUERIES
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
