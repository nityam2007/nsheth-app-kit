import { createSerializationAdapter } from '@tanstack/react-router'
import { PublicError, errorStatus } from './errors'

export const publicErrorAdapter = createSerializationAdapter({
  key: 'app-public-error',
  test: (value: unknown): value is PublicError => Boolean(errorStatus(value)),
  toSerializable: (error: PublicError) => ({
    message: error.message,
    status: errorStatus(error)!,
    reference:
      typeof error.cause === 'object' &&
      error.cause !== null &&
      'reference' in error.cause &&
      typeof error.cause.reference === 'string'
        ? error.cause.reference
        : undefined,
  }),
  fromSerializable: (value: {
    message: string
    status: number
    reference?: string
  }) => new PublicError(value.message, value.status, value.reference),
})
