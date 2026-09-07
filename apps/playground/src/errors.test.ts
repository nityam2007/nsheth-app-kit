import test from 'node:test'
import assert from 'node:assert/strict'
import { fromCrossJSON, toCrossJSON } from 'seroval'
import { makeSerovalPlugin, defaultSerovalPlugins } from '@tanstack/router-core'
import { publicErrorAdapter } from './error-serialization'
import {
  PublicError,
  errorMessage,
  errorStatus,
  classifyFailure,
} from './errors'

test('safe errors survive the server serializer while private database details stay hidden', () => {
  const plugins = [
    makeSerovalPlugin(publicErrorAdapter),
    ...defaultSerovalPlugins,
  ]
  const error = fromCrossJSON(
    toCrossJSON(new PublicError('Choose another slug', 409), { plugins }),
    { plugins },
  )
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

test('the framework default drops custom error status; the app adapter retains it without a stack', () => {
  const value = new PublicError('Unauthorized', 401, 'safe-reference')
  const shallow = fromCrossJSON(
    toCrossJSON(value, { plugins: defaultSerovalPlugins }),
    { plugins: defaultSerovalPlugins },
  )
  assert.equal(errorStatus(shallow), undefined)
  const plugins = [
    makeSerovalPlugin(publicErrorAdapter),
    ...defaultSerovalPlugins,
  ]
  const wire = toCrossJSON(value, { plugins }),
    restored = fromCrossJSON(wire, { plugins })
  assert.equal(errorStatus(restored), 401)
  assert.equal(errorMessage(restored), 'Unauthorized')
  assert.ok(!JSON.stringify(wire).includes('errors.test'))
})
