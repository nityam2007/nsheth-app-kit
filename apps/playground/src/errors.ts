export class PublicError extends Error {
  constructor(message: string, status: number, reference?: string) {
    super(message, { cause: { status, reference } })
    this.name = 'PublicError'
  }
}
export function errorStatus(error: unknown): number | undefined {
  if (
    error instanceof Error &&
    error.name === 'PublicError' &&
    error.cause &&
    typeof error.cause === 'object' &&
    'status' in error.cause &&
    typeof error.cause.status === 'number'
  )
    return error.cause.status
  return undefined
}
export function errorMessage(
  error: unknown,
  fallback = 'Unable to complete this action. Please try again.',
) {
  if (!errorStatus(error) || !(error instanceof Error)) return fallback
  const reference =
    error.cause &&
    typeof error.cause === 'object' &&
    'reference' in error.cause &&
    typeof error.cause.reference === 'string'
      ? error.cause.reference
      : undefined
  return reference ? `${error.message} Reference: ${reference}.` : error.message
}
export function classifyFailure(error: unknown): {
  status: number
  message: string
  code: string
} {
  const record =
    typeof error === 'object' && error !== null
      ? (error as Record<string, unknown>)
      : {}
  const code = typeof record.code === 'string' ? record.code : ''
  if (record.name === 'ZodError' || Array.isArray(record.issues))
    return {
      status: 400,
      message: 'Check the required fields and their formats.',
      code: 'VALIDATION',
    }
  if (code === 'P2002')
    return {
      status: 409,
      message:
        'That unique value is already in use. Choose another slug or SKU.',
      code,
    }
  if (code === 'P2025')
    return {
      status: 404,
      message: 'This record no longer exists. Refresh the page.',
      code,
    }
  if (code === 'P2003')
    return {
      status: 409,
      message:
        'This record has related activity and cannot be deleted. Unpublish it instead.',
      code,
    }
  if (code === 'P2034')
    return {
      status: 409,
      message: 'Another change happened at the same time. Refresh and retry.',
      code,
    }
  if (
    [
      'P1001',
      'P1002',
      'P1008',
      'P1017',
      'P2021',
      'P2022',
      'P2024',
      'ECONNREFUSED',
      'ETIMEDOUT',
    ].includes(code) ||
    String(record.name).startsWith('Prisma') ||
    record.message === 'DATABASE_URL is required'
  )
    return {
      status: 503,
      message: 'The data service is unavailable. Please try again shortly.',
      code: code || 'DATABASE',
    }
  return {
    status: 500,
    message: 'An unexpected error occurred. Please try again.',
    code: 'INTERNAL',
  }
}
