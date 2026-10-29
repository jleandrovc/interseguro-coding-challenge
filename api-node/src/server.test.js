import test from 'node:test';
import assert from 'node:assert/strict';
import { isDiagonal } from './server.js';

test('detects a diagonal square matrix', () => {
  assert.equal(isDiagonal([[1, 0], [0, 2]], 1e-9), true);
});

test('rejects a non-diagonal matrix', () => {
  assert.equal(isDiagonal([[1, 2], [0, 3]], 1e-9), false);
});

test('rejects a non-square matrix', () => {
  assert.equal(isDiagonal([[1, 0, 0], [0, 1, 0]], 1e-9), false);
});
