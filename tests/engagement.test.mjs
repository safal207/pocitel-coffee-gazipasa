import test from 'node:test';
import assert from 'node:assert/strict';
import { restoreEngagement, toggleLike, recordView, serializeEngagement } from '../dist/engagement.js';

test('new visitors start with real zero counts', () => {
  const state = restoreEngagement(null, ['latte', 'pancake']);
  assert.equal(state.likes.size, 0);
  assert.equal(state.views.size, 0);
});

test('likes toggle instead of accumulating artificial counts', () => {
  const state = restoreEngagement(null, ['latte']);
  assert.equal(toggleLike(state, 'latte'), true);
  assert.equal(toggleLike(state, 'latte'), false);
  assert.equal(state.likes.size, 0);
});

test('views track intentional opens; persistence survives reload', () => {
  const state = restoreEngagement(null, ['latte']);
  assert.equal(recordView(state, 'latte'), 1);
  assert.equal(recordView(state, 'latte'), 2);
  toggleLike(state, 'latte');
  const reloaded = restoreEngagement(serializeEngagement(state), ['latte']);
  assert.equal(reloaded.views.get('latte'), 2);
  assert.equal(reloaded.likes.has('latte'), true);
});

test('ignore malformed, stale or malicious browser values', () => {
  const state = restoreEngagement(JSON.stringify({
    likes: ['latte', 'removed-item', 'latte', 42],
    views: { latte: 3, 'removed-item': 999, pancake: -1, other: '123', __proto__: 99 },
  }), ['latte', 'pancake']);
  assert.deepEqual([...state.likes], ['latte']);
  assert.deepEqual([...state.views], [['latte', 3]]);
  assert.equal(restoreEngagement('{broken', ['latte']).likes.size, 0);
});
