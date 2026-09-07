import assert from 'node:assert/strict'
import { createServer } from 'node:net'
import { test } from 'node:test'
import {
  assertDevelopmentPortFree,
  checkDevelopmentListeners,
} from './local-server.mjs'

test('startup rejects an IPv4 listener even when IPv6 could be free', async () => {
  const server = createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  try {
    await assert.rejects(
      assertDevelopmentPortFree(port),
      /Development port is occupied at http:\/\/127\.0\.0\.1/,
    )
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
  await assertDevelopmentPortFree(port)
})

test('doctor identifies a different HTTP app on the development port', async () => {
  const { createServer: httpServer } = await import('node:http')
  const server = httpServer((_request, response) => {
    response.writeHead(404)
    response.end('Cannot GET /@vite/client')
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  try {
    await assert.rejects(
      checkDevelopmentListeners(server.address().port),
      /Another or unhealthy server.*HTTP 404/,
    )
  } finally {
    server.closeAllConnections()
    await new Promise((resolve) => server.close(resolve))
  }
})

test('doctor accepts the Vite 8 client without a self URL in its source', async () => {
  const { createServer: httpServer } = await import('node:http')
  const server = httpServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/javascript' })
    response.end(
      'export function createHotContext(){}; const event="vite:beforeUpdate";',
    )
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  try {
    await checkDevelopmentListeners(server.address().port)
  } finally {
    server.closeAllConnections()
    await new Promise((resolve) => server.close(resolve))
  }
})
