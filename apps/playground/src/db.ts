import { PrismaClient } from './generated/prisma/client.js'

import { getDatabaseUrl } from './database-url.js'

import { PrismaPg } from '@prisma/adapter-pg'
import { databaseContext } from './db-context.server'

declare global {
  var __prisma: PrismaClient | undefined
}

let prisma = globalThis.__prisma

export function getPrisma() {
  const scoped = databaseContext.getStore()
  if (scoped) return scoped
  prisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
  })

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = prisma
  }

  return prisma
}
