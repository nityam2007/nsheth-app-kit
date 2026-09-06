import { PublicError } from './errors'
import { createServerOnlyFn } from '@tanstack/react-start'
import { getRequest, setResponseStatus } from '@tanstack/react-start/server'

export const rejectRequest: (status: number, message: string) => never =
  createServerOnlyFn((status: number, message: string): never => {
    setResponseStatus(status)
    throw new PublicError(message, status)
  })

export const requireSameOrigin = createServerOnlyFn(() => {
  const request = getRequest()
  const origin = request.headers.get('origin')

  if (!origin || origin !== new URL(request.url).origin) {
    rejectRequest(403, 'Origin check failed')
  }
})
