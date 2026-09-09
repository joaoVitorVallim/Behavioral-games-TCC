// ponytail self-check — run with: node --experimental-strip-types src/shared/utils/pickForPlayer.selfcheck.ts
import assert from 'node:assert/strict'
import { pickForPlayer } from './pickForPlayer.ts'

assert.equal(pickForPlayer(true, 'p1', 'p2'), 'p1')
assert.equal(pickForPlayer(false, 'p1', 'p2'), 'p2')
assert.equal(pickForPlayer(true, 10, 20), 10)
assert.equal(pickForPlayer(false, 10, 20), 20)

console.log('pickForPlayer: ok')
