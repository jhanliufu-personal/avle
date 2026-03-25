import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const datasourceUrl = process.env.DATABASE_URL ?? 'file:/var/task/prisma/dev.db'
console.log('[PRISMA] datasourceUrl:', datasourceUrl, 'cwd:', process.cwd())

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
