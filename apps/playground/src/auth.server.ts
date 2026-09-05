import { createSessionToken, hashSessionToken } from '@nsheth/identity'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { z } from 'zod'
import { getPrisma } from './db'
import { cookieOptions, ensureRoles, issueSession } from './session.server'

function settings() {
  const clientId = process.env.GITHUB_CLIENT_ID,
    clientSecret = process.env.GITHUB_CLIENT_SECRET,
    origin = process.env.PUBLIC_ORIGIN
  if (!clientId || !clientSecret || !origin)
    throw new Error('Sign-in is not configured')
  const url = new URL(origin)
  if (
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    (process.env.NODE_ENV === 'production' && url.protocol !== 'https:')
  )
    throw new Error('PUBLIC_ORIGIN must be the canonical HTTPS origin')
  return { clientId, clientSecret, origin: url.origin }
}
const oauthCookie = () =>
  process.env.NODE_ENV === 'production' ? '__Host-oauth-state' : 'oauth-state'
function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}
export async function beginGithubLogin() {
  const config = settings(),
    state = createSessionToken(),
    verifier = createSessionToken()
  const challenge = base64url(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)),
    ),
  )
  await getPrisma().oauthAttempt.create({
    data: {
      stateHash: await hashSessionToken(state),
      verifier,
      expiresAt: new Date(Date.now() + 600_000),
    },
  })
  setCookie(oauthCookie(), state, cookieOptions(600))
  const url = new URL('https://github.com/login/oauth/authorize')
  url.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: `${config.origin}/auth/callback`,
    scope: 'read:user user:email',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  }).toString()
  return Response.redirect(url)
}
export async function finishGithubLogin(request: Request) {
  const config = settings(),
    params = new URL(request.url).searchParams,
    state = params.get('state'),
    code = params.get('code'),
    cookie = getCookie(oauthCookie())
  setCookie(oauthCookie(), '', cookieOptions(0))
  if (!state || !code || !cookie || state !== cookie)
    return new Response('Invalid or expired sign-in. Start again.', {
      status: 400,
    })
  const stateHash = await hashSessionToken(state),
    db = getPrisma()
  const attempt = await db.oauthAttempt.findUnique({ where: { stateHash } })
  if (!attempt || attempt.expiresAt <= new Date())
    return new Response('Sign-in expired.', { status: 400 })
  const consumed = await db.oauthAttempt.deleteMany({
    where: { stateHash, expiresAt: { gt: new Date() } },
  })
  if (!consumed.count)
    return new Response('Sign-in already used.', { status: 400 })
  const tokenResponse = await fetch(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: `${config.origin}/auth/callback`,
        code_verifier: attempt.verifier,
      }),
      signal: AbortSignal.timeout(15000),
    },
  )
  if (!tokenResponse.ok) throw new Error('Sign-in exchange failed')
  const token = z
    .object({ access_token: z.string().min(1) })
    .parse(await tokenResponse.json())
  const headers = {
    Authorization: `Bearer ${token.access_token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'nsheth-app-kit',
  }
  const [profileResponse, emailResponse] = await Promise.all([
    fetch('https://api.github.com/user', {
      headers,
      signal: AbortSignal.timeout(15000),
    }),
    fetch('https://api.github.com/user/emails', {
      headers,
      signal: AbortSignal.timeout(15000),
    }),
  ])
  if (!profileResponse.ok || !emailResponse.ok)
    throw new Error('Could not verify GitHub identity')
  const profile = z
    .object({
      id: z.number().int(),
      name: z.string().nullable(),
      login: z.string(),
    })
    .parse(await profileResponse.json())
  const emails = z
    .array(
      z.object({
        email: z.email(),
        primary: z.boolean(),
        verified: z.boolean(),
      }),
    )
    .parse(await emailResponse.json())
  const email = emails.find((e) => e.primary && e.verified)?.email.toLowerCase()
  if (!email)
    return new Response('A verified primary GitHub email is required.', {
      status: 403,
    })
  await ensureRoles()
  const existing = await db.user.findFirst({
    where: { OR: [{ githubId: String(profile.id) }, { email }] },
  })
  if (existing?.disabledAt)
    return new Response('Account disabled. Contact the operator.', {
      status: 403,
    })
  if (existing?.githubId && existing.githubId !== String(profile.id))
    return new Response('Account identity mismatch.', { status: 403 })
  const user = existing
    ? await db.user.update({
        where: { id: existing.id },
        data: {
          githubId: String(profile.id),
          email,
          name: profile.name ?? profile.login,
        },
      })
    : await db.user.create({
        data: {
          email,
          name: profile.name ?? profile.login,
          githubId: String(profile.id),
        },
      })
  const initialAdmins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  const role = await db.role.findUniqueOrThrow({
    where: { key: initialAdmins.includes(email) ? 'admin' : 'customer' },
  })
  await db.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  })
  await issueSession(user.id)
  return Response.redirect(`${config.origin}/account`)
}
