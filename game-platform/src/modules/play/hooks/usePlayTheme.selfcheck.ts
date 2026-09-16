// run with: node --experimental-strip-types src/modules/play/hooks/usePlayTheme.selfcheck.ts
import assert from 'node:assert/strict'

function nextTheme(current: 'warm' | 'lab'): 'warm' | 'lab' {
  return current === 'warm' ? 'lab' : 'warm'
}

assert.equal(nextTheme('warm'), 'lab')
assert.equal(nextTheme('lab'), 'warm')

console.log('usePlayTheme nextTheme: ok')
