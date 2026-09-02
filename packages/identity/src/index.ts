export interface Principal {
  userId: string
  email: string
  roles: ReadonlyArray<string>
  permissions: ReadonlyArray<string>
}

export function hasRole(principal: Principal, role: string) {
  return principal.roles.includes(role)
}

export function hasPermission(principal: Principal, permission: string) {
  return principal.permissions.includes(permission)
}

export function createSessionToken() {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`
}

export async function hashSessionToken(token: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(token),
  )

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}
