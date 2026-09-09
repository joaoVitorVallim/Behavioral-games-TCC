// ponytail self-check — run with: node --experimental-strip-types src/shared/utils/humanizeLabel.selfcheck.ts
import assert from 'node:assert/strict'
import { humanizeLabel } from './humanizeLabel.ts'

assert.equal(humanizeLabel('educationLevel'), 'Education Level')
assert.equal(humanizeLabel('age'), 'Age')
assert.equal(humanizeLabel('configName'), 'Config Name')
assert.equal(humanizeLabel(''), '')

console.log('humanizeLabel: ok')
