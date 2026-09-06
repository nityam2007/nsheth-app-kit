import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  developmentTunnelOrigin,
  isAllowedRequestOrigin,
} from './request-origin'

test('accept the explicit HTTPS tunnel over local HTTP only in development', () => {
  for (const url of [
    'http://dev3000.nsheth.in/action',
    'http://localhost:3000/action',
  ]) {
    assert.equal(
      isAllowedRequestOrigin(url, developmentTunnelOrigin, true),
      true,
    )
    assert.equal(
      isAllowedRequestOrigin(url, developmentTunnelOrigin, false),
      false,
    )
  }
  assert.equal(
    isAllowedRequestOrigin(
      'http://localhost:4000',
      developmentTunnelOrigin,
      true,
    ),
    false,
  )
  assert.equal(
    isAllowedRequestOrigin(
      'http://other.example',
      developmentTunnelOrigin,
      true,
    ),
    false,
  )
})

test('preserve same-origin requests and reject missing or unrelated origins', () => {
  const url = 'http://localhost:3000/action'
  assert.equal(isAllowedRequestOrigin(url, 'http://localhost:3000'), true)
  for (const origin of [
    null,
    'null',
    'https://evil.example',
    'https://dev3000.nsheth.in.evil.example',
  ]) {
    assert.equal(isAllowedRequestOrigin(url, origin, true), false)
  }
})
