import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const candidates = [
  '/var/task/prisma/dev.db',
  '/tmp/app/prisma/dev.db',
  path.resolve(process.cwd(), 'prisma/dev.db'),
  path.resolve(process.cwd(), 'dev.db'),
]
console.log('[PRISMA] cwd:', process.cwd())
for (const c of candidates) {
  console.log(`[PRISMA] ${c} exists:`, fs.existsSync(c))
}

const found = candidates.find(c => fs.existsSync(c))
const datasourceUrl = process.env.DATABASE_URL ?? (found ? `file:${found}` : 'file:/var/task/prisma/dev.db')
console.log('[PRISMA] using:', datasourceUrl)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl,
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
