import assert from 'node:assert/strict'
import test from 'node:test'

import { readMode } from './mode.mjs'

test('readMode returns the pinned project and defaults to no pin', () => {
  assert.deepEqual(readMode({ DASHBOARD_MODE: 'internal', DASHBOARD_PROJECT: 'hosebox' }), { mode: 'internal', project: 'hosebox' })
  assert.deepEqual(readMode({ DASHBOARD_MODE: 'internal' }), { mode: 'internal', project: null })
})

test('an unset DASHBOARD_MODE is a named failure, never an implicit "show everything"', () => {
  assert.throws(() => readMode({}), /DASHBOARD_MODE/)
  assert.throws(() => readMode({ DASHBOARD_MODE: 'client' }), /DASHBOARD_MODE must be "internal"/)
})
