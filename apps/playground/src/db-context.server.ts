import { AsyncLocalStorage } from 'node:async_hooks'
import type { PrismaClient } from './generated/prisma/client'

export const databaseContext = new AsyncLocalStorage<PrismaClient>()
