export const developmentTunnelOrigin = 'https://dev3000.nsheth.in'

export function isAllowedRequestOrigin(
  requestUrl: string,
  origin: string | null,
  development = false,
) {
  if (!origin) return false
  const request = new URL(requestUrl)
  if (origin === request.origin) return true
  // Cloudflare terminates TLS before forwarding to the local HTTP server.
  // Trust this explicit development origin, never arbitrary forwarded headers.
  return (
    development &&
    origin === developmentTunnelOrigin &&
    (request.hostname === new URL(developmentTunnelOrigin).hostname ||
      (['localhost', '127.0.0.1', '[::1]'].includes(request.hostname) &&
        request.port === '3000'))
  )
}
