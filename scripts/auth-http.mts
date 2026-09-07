import assert from 'node:assert/strict'
import { toJSON, fromCrossJSON } from 'seroval'
import pg from 'pg'
import { configuration } from './local-database.mjs'
// Development-only tests create and remove one unique customer. Never send real email.
const env = await configuration(),
  database = new URL(env.DATABASE_URL ?? ''),
  origin = process.env.TEST_URL ?? 'http://localhost:3000'
if (
  process.env.NODE_ENV === 'production' ||
  !['localhost', '127.0.0.1', '[::1]'].includes(database.hostname) ||
  !['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname)
)
  throw new Error(
    'Auth regression requires a local development app and database.',
  )
const db = new pg.Client({ connectionString: env.DATABASE_URL })
await db.connect()
let cookie = ''
const ids = new Map<string, string>()
async function call(
  file: string,
  name: string,
  data?: unknown,
  method = 'POST',
) {
  if (!ids.has(name)) {
    const r = await fetch(origin + '/src/' + file + '.functions.ts')
    assert.equal(r.status, 200, 'Requires Vite development mode')
    for (const block of (await r.text()).split('export const ')) {
      const name = block.match(/^(\w+) =/)?.[1],
        id = block.match(/createClientRpc\("([^"]+)"\)/)?.[1]
      if (name && id) ids.set(name, id)
    }
  }
  const id = ids.get(name)
  assert.ok(id, name)
  const url = new URL('/_serverFn/' + id, origin),
    payload = JSON.stringify(toJSON({ data }))
  if (method === 'GET') url.searchParams.set('payload', payload)
  return fetch(url, {
    method,
    headers: {
      origin,
      cookie,
      'x-tsr-serverFn': 'true',
      'content-type': 'application/json',
    },
    ...(method === 'POST' ? { body: payload } : {}),
  })
}
async function developmentToken(response: Response) {
  assert.equal(response.status, 200)
  const decoded = fromCrossJSON(await response.json(), {}) as {
    result: { developmentLink: string }
  }
  assert.ok(
    decoded.result.developmentLink,
    'Development email preview expected',
  )
  return new URL(decoded.result.developmentLink, origin).searchParams.get(
    'token',
  )!
}
const email = 'auth-test-' + crypto.randomUUID() + '@example.test',
  password = 'A deliberate test password 123',
  changed = 'A different test password 456'
try {
  const token = await developmentToken(
    await call('auth', 'registerAccount', { name: 'Test Customer', email }),
  )
  const pending = await db.query(
    'SELECT "passwordHash", "emailVerifiedAt" FROM "User" WHERE email=$1',
    [email],
  )
  assert.equal(pending.rows[0].passwordHash, null)
  assert.equal(pending.rows[0].emailVerifiedAt, null)
  assert.equal(
    (await call('auth', 'loginWithPassword', { email, password })).status,
    401,
  )
  assert.equal(
    (
      await call('auth', 'completeAccountChallenge', {
        token,
        kind: 'RESET',
        password,
      })
    ).status,
    400,
    'Verification token cannot reset',
  )
  assert.equal(
    (
      await call('auth', 'completeAccountChallenge', {
        token,
        kind: 'VERIFY',
        password,
      })
    ).status,
    200,
  )
  assert.equal(
    (
      await call('auth', 'completeAccountChallenge', {
        token,
        kind: 'VERIFY',
        password,
      })
    ).status,
    400,
    'Single use',
  )
  const login = await call('auth', 'loginWithPassword', { email, password })
  assert.equal(login.status, 200)
  cookie = login.headers
    .getSetCookie()
    .map((s) => s.split(';')[0])
    .join('; ')
  assert.ok(cookie)
  assert.equal(
    (await call('admin', 'getAdminContext', undefined, 'GET')).status,
    403,
    'Registration cannot grant admin',
  )
  for (const path of ['/account', '/account/profile', '/account/security']) {
    const r = await fetch(origin + path, { headers: { cookie } })
    assert.equal(r.status, 200)
    assert.ok(!(await r.text()).includes('Something needs attention'))
  }
  assert.equal(
    (
      await call('account', 'updateAccountProfile', {
        name: 'Updated Customer',
      })
    ).status,
    200,
  )
  const reset = await developmentToken(
    await call('auth', 'requestAccountEmail', { email, kind: 'RESET' }),
  )
  await db.query(
    `UPDATE "AuthChallenge" SET "expiresAt"=NOW()-INTERVAL '1 minute' WHERE "userId"=(SELECT id FROM "User" WHERE email=$1)`,
    [email],
  )
  assert.equal(
    (
      await call('auth', 'completeAccountChallenge', {
        token: reset,
        kind: 'RESET',
        password: changed,
      })
    ).status,
    400,
    'Expired link',
  )
  const fresh = await developmentToken(
    await call('auth', 'requestAccountEmail', { email, kind: 'RESET' }),
  )
  assert.equal(
    (
      await call('auth', 'completeAccountChallenge', {
        token: fresh,
        kind: 'RESET',
        password: changed,
      })
    ).status,
    200,
  )
  assert.equal(
    (await call('account', 'getAccount', undefined, 'GET')).status,
    401,
    'Reset revokes old session',
  )
  cookie = ''
  assert.equal(
    (await call('auth', 'loginWithPassword', { email, password })).status,
    401,
    'Old password no longer works',
  )
  assert.equal(
    (await call('auth', 'loginWithPassword', { email, password: changed }))
      .status,
    200,
  )
  const roles = await db.query(
    'SELECT r.key FROM "Role" r JOIN "UserRole" ur ON ur."roleId"=r.id JOIN "User" u ON u.id=ur."userId" WHERE u.email=$1',
    [email],
  )
  assert.deepEqual(
    roles.rows.map((r) => r.key),
    ['customer'],
  )
  console.log(
    'Email registration, verification, role isolation, profile, expiry, password reset and session revocation passed.',
  )
} finally {
  await db.query('DELETE FROM "User" WHERE email=$1', [email])
  await db.end()
}
