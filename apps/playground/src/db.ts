import { PrismaClient } from './generated/prisma/client.js'

import { getDatabaseUrl } from './database-url.js'

import { PrismaPg } from '@prisma/adapter-pg'
import { databaseContext } from './db-context.server'

declare global {
  var __prisma: PrismaClient | undefined
  var __prismaClientType: typeof PrismaClient | undefined
}

let prisma =
  globalThis.__prismaClientType === PrismaClient
    ? globalThis.__prisma
    : undefined
// Regeneration changes the client constructor. An old HMR singleton cannot use new models.
if (!prisma && globalThis.__prisma)
  void globalThis.__prisma.$disconnect().catch(() => {})

export function getPrisma() {
  const scoped = databaseContext.getStore()
  if (scoped) return scoped
  prisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
  })

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = prisma
    globalThis.__prismaClientType = PrismaClient
  }

  return prisma
}
