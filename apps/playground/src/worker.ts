import handler from '@tanstack/react-start/server-entry'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client'
import { databaseContext } from './db-context.server'

interface Bindings {
  DATABASE_URL?: string
  HYPERDRIVE?: { connectionString: string }
  PUBLIC_ORIGIN: string
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  ADMIN_EMAILS?: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
}
export default {
  async fetch(
    request: Request,
    env: Bindings,
    context: { waitUntil: (promise: Promise<unknown>) => void },
  ) {
    for (const key of [
      'PUBLIC_ORIGIN',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET',
      'ADMIN_EMAILS',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
    ] as const) {
      if (env[key]) process.env[key] = env[key]
    }
    const connectionString =
      env.HYPERDRIVE?.connectionString ?? env.DATABASE_URL
    if (!connectionString)
      return new Response('Database binding is not configured', { status: 503 })
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString, max: 2 }),
    })
    let disconnected = false
    const disconnect = () => {
      if (!disconnected) {
        disconnected = true
        context.waitUntil(prisma.$disconnect())
      }
    }
    return databaseContext.run(prisma, async () => {
      try {
        const response = await handler.fetch(request)
        if (!response.body) {
          disconnect()
          return response
        }
        const reader = response.body.getReader()
        return new Response(
          new ReadableStream({
            async pull(controller) {
              try {
                const chunk = await reader.read()
                if (chunk.done) {
                  controller.close()
                  disconnect()
                } else controller.enqueue(chunk.value)
              } catch (error) {
                controller.error(error)
                disconnect()
              }
            },
            async cancel() {
              await reader.cancel()
              disconnect()
            },
          }),
          response,
        )
      } catch (error) {
        disconnect()
        throw error
      }
    })
  },
}
