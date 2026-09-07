const iterations = 600_000
const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
const unhex = (value: string) =>
  Uint8Array.from(value.match(/../g) ?? [], (b) => parseInt(b, 16))
async function derive(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  return new Uint8Array(
    await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        iterations,
        salt: new Uint8Array(salt),
      },
      key,
      256,
    ),
  )
}
export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return [
    'pbkdf2-sha256',
    iterations,
    hex(salt),
    hex(await derive(password, salt)),
  ].join('$')
}
export async function verifyPassword(password: string, stored: string | null) {
  const parts = stored?.split('$')
  const valid =
    parts?.length === 4 &&
    parts[0] === 'pbkdf2-sha256' &&
    parts[1] === String(iterations) &&
    /^[a-f0-9]{32}$/.test(parts[2]) &&
    /^[a-f0-9]{64}$/.test(parts[3])
  const actual = await derive(
    password,
    valid ? unhex(parts[2]) : new Uint8Array(16),
  )
  const expected = valid ? unhex(parts[3]) : new Uint8Array(32)
  let difference = 0
  for (let i = 0; i < actual.length; i++) difference |= actual[i] ^ expected[i]
  return Boolean(valid && difference === 0)
}
