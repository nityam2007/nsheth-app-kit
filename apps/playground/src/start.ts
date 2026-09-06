import {
  createStart,
  createMiddleware,
  createCsrfMiddleware,
} from '@tanstack/react-start'
import { isRedirect, isNotFound } from '@tanstack/react-router'
import {
  getRequest,
  setResponseHeader,
  getResponseHeader,
  removeResponseHeader,
  setResponseStatus,
} from '@tanstack/react-start/server'
import { PublicError, classifyFailure, errorStatus } from './errors'
import { isAllowedRequestOrigin } from './request-origin'

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
  const request = getRequest(),
    pathname = new URL(request.url).pathname
  if (
    pathname.startsWith('/admin') ||
    pathname === '/account' ||
    pathname.startsWith('/_serverFn/') ||
    pathname.startsWith('/auth/')
  )
    setResponseHeader('Cache-Control', 'private, no-store')
  // Bound actual streamed bytes as well as Content-Length before JSON/webhook parsing.
  if (request.method === 'POST' && request.body) {
    const limit = 1024 * 1024
    if (Number(request.headers.get('content-length')) > limit)
      return new Response('Request is too large', { status: 413 })
    const reader = request.clone().body!.getReader()
    let size = 0
    for (;;) {
      const chunk = await reader.read()
      if (chunk.done) break
      size += chunk.value.byteLength
      if (size > limit) {
        void reader.cancel()
        void request.body.cancel()
        return new Response('Request is too large', { status: 413 })
      }
    }
  }

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
  const headers = new Headers(result.response.headers)
  headers.delete('X-App-Status')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (
    pathname.startsWith('/admin') ||
    pathname === '/account' ||
    pathname.startsWith('/_serverFn/') ||
    pathname.startsWith('/auth/')
  )
    headers.set('Cache-Control', 'private, no-store')
  return new Response(result.response.body, {
    status: status >= 400 && status <= 599 ? status : result.response.status,
    headers,
  })
})
export const startInstance = createStart(() => ({
  functionMiddleware: [safeErrors],
  requestMiddleware: [
    securityHeaders,
    createCsrfMiddleware({
      filter: (context) => context.handlerType === 'serverFn',
      origin: (origin, context) =>
        isAllowedRequestOrigin(
          context.request.url,
          origin,
          process.env.NODE_ENV !== 'production',
        ),
    }),
  ],
}))
