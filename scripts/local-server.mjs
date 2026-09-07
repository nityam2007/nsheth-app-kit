import { createServer } from 'node:net'

const loopbackHosts = ['127.0.0.1', '::1']
const address = (host, port) =>
  `http://${host.includes(':') ? '[' + host + ']' : host}:${port}`

// Vite's localhost bind can succeed on IPv6 while another app owns IPv4.
export async function assertDevelopmentPortFree(port = 3000) {
  for (const host of loopbackHosts) {
    const server = createServer()
    try {
      await new Promise((resolve, reject) => {
        server.once('error', reject)
        server.listen({ host, port, exclusive: true }, resolve)
      })
    } catch (error) {
      if (
        host === '::1' &&
        ['EAFNOSUPPORT', 'EADDRNOTAVAIL'].includes(error.code)
      )
        continue
      if (error.code === 'EADDRINUSE')
        throw new Error(
          `Development port is occupied at ${address(host, port)}. Stop or reconfigure that listener before starting this app; IPv4 and IPv6 must not serve different apps.`,
        )
      throw error
    } finally {
      if (server.listening)
        await new Promise((resolve) => server.close(resolve))
    }
  }
}

export async function checkDevelopmentListeners(port = 3000) {
  let running = 0
  for (const host of loopbackHosts) {
    const origin = address(host, port)
    let response
    try {
      response = await fetch(origin + '/@vite/client', {
        signal: AbortSignal.timeout(3000),
        redirect: 'manual',
      })
    } catch (error) {
      if (
        ['ECONNREFUSED', 'ENETUNREACH', 'EAFNOSUPPORT'].includes(
          error.cause?.code,
        )
      )
        continue
      throw new Error(
        `Could not check ${origin}: ${error.name}. Check the listener before using localhost.`,
      )
    }
    const source = await response.text()
    if (
      response.status !== 200 ||
      !source.includes('createHotContext') ||
      !source.includes('vite:beforeUpdate')
    )
      throw new Error(
        `Another or unhealthy server responds at ${origin} (Vite client HTTP ${response.status}). Check netstat -ano for port ${port}; localhost can reach a different app on IPv4 and IPv6.`,
      )
    running++
    console.log(`Development server: Vite responds at ${origin}.`)
  }
  if (!running)
    console.log('Development server: not running. Start npm run dev.')
}
