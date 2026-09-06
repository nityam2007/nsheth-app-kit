import test from 'node:test'
import assert from 'node:assert/strict'
import { fromJSON, toJSON } from 'seroval'
import {
  PublicError,
  errorMessage,
  errorStatus,
  classifyFailure,
} from './errors'

test('safe errors survive the server serializer while private database details stay hidden', () => {
  const error = fromJSON(toJSON(new PublicError('Choose another slug', 409)))
  assert.equal(errorStatus(error), 409)
  assert.equal(errorMessage(error), 'Choose another slug')
  assert.equal(
    errorMessage(new Error('secret SQL and password')),
    'Unable to complete this action. Please try again.',
  )
  assert.equal(
    classifyFailure({ code: 'P2002', message: 'SQL contact data' }).status,
    409,
  )
  assert.equal(classifyFailure({ code: 'ECONNREFUSED' }).status, 503)
  assert.ok(
    !classifyFailure({ message: 'password=secret' }).message.includes('secret'),
  )
})
