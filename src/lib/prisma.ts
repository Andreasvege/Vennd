import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { attachDatabasePool } from '@vercel/functions'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Hver serverinstans får sin egen pool, og databasen har et fast tak på
// tilkoblinger. Få tilkoblinger per instans, som lukkes raskt når de står
// ledige, holder oss under taket også når mange instanser kjører samtidig.
const POOL_MAX = 5
const IDLE_MS = 5_000

function createPrismaClient() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL!, max: POOL_MAX, idleTimeoutMillis: IDLE_MS })
  // På Vercel: lukk ledige tilkoblinger før instansen fryses, i stedet for
  // å la dem henge til databasen går tom.
  attachDatabasePool(pool)
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
