import { createStart, createMiddleware } from '@tanstack/react-start'
import { isRedirect, isNotFound } from '@tanstack/react-router'
import {
  setResponseHeader,
  getResponseHeader,
  removeResponseHeader,
  setResponseStatus,
} from '@tanstack/react-start/server'
import { PublicError, classifyFailure, errorStatus } from './errors'

const safeErrors = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    try {
      return await next()
    } catch (error) {
      if (isRedirect(error) || isNotFound(error)) throw error
      const known = errorStatus(error)
      if (known) {
        setResponseStatus(known)
        setResponseHeader('X-App-Status', String(known))
        throw error
      }
      const failure = classifyFailure(error),
        reference = crypto.randomUUID()
      // Codes and references are sufficient for correlation; do not log SQL, inputs, tokens, or contact details.
      console.error(`[server] ${failure.code} reference=${reference}`)
      setResponseStatus(failure.status)
      setResponseHeader('X-App-Status', String(failure.status))
      setResponseHeader('Cache-Control', 'no-store')
      throw new PublicError(failure.message, failure.status, reference)
    }
  },
)
const securityHeaders = createMiddleware().server(async ({ next }) => {
  setResponseHeader('X-Content-Type-Options', 'nosniff')
  setResponseHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  setResponseHeader('X-Frame-Options', 'DENY')
  setResponseHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  )
  const result = await next()
  const status = Number(getResponseHeader('X-App-Status'))
  removeResponseHeader('X-App-Status')
  if (status >= 400 && status <= 599) {
    const headers = new Headers(result.response.headers)
    headers.delete('X-App-Status')
    return new Response(result.response.body, { status, headers })
  }
  return result
})
export const startInstance = createStart(() => ({
  functionMiddleware: [safeErrors],
  requestMiddleware: [securityHeaders],
}))
