import test from 'node:test';
import assert from 'node:assert/strict';
import { items, feedOrder, takeawayItems } from '../dist/catalog.js';
import { builtComboId, resolveOrderItem } from '../dist/order-options.js';
import { moments, nextComboChoice, restoreFavoriteCombos } from '../dist/discovery.js';

const resolve = id => resolveOrderItem(id, items);
const pair = (extras = {}) => ({ foodId: 'beetroot', drinkId: 'latte', milk: 'oat', syrup: 'vanilla', serving: 'takeaway', ...extras });

test('each moment points to real menu products appropriate for its service view', () => {
  assert.equal(new Set(moments.map(moment => moment.id)).size, moments.length);
  assert.ok(moments.length >= 4);
  for (const moment of moments) {
    const available = new Set((moment.mode === 'takeaway' ? takeawayItems : feedOrder).map(entry => entry.id));
    assert.ok(items.has(moment.image), moment.id);
    assert.ok(moment.ids.length >= 3, moment.id);
    assert.equal(new Set(moment.ids).size, moment.ids.length, moment.id);
    for (const id of moment.ids) assert.ok(available.has(id), `${moment.id}: ${id}`);
    assert.ok(moment.labels.every(Boolean));
  }
});

test('another pairing preserves chosen extras and serving while respecting full price budget', () => {
  const original = pair();
  const next = nextComboChoice(original, resolve, 500);
  assert.ok(next);
  assert.notEqual(builtComboId(next), builtComboId(original));
  assert.deepEqual([next.milk, next.syrup, next.serving], ['oat', 'vanilla', 'takeaway']);
  assert.ok(resolve(builtComboId(next)).price <= 500);
  assert.deepEqual(original, pair());
});

test('impossible or invalid budgets never replace the current choice', () => {
  const original = pair();
  assert.equal(nextComboChoice(original, resolve, 250), null);
  assert.equal(nextComboChoice(original, resolve, -1), null);
  assert.equal(nextComboChoice(original, resolve, 'invalid'), null);
  assert.equal(nextComboChoice(pair({ foodId: 'unknown' }), resolve, 0), null);
  assert.deepEqual(original, pair());
});

test('favourites restore valid full configurations, deduplicate and reject invalid entries', () => {
  const first = builtComboId(pair());
  const second = builtComboId(pair({ foodId: 'zucchini', drinkId: 'tea', milk: 'standard', syrup: 'none', serving: 'cafe' }));
  const raw = JSON.stringify([first, 'tea', 'pair~broken', first, second, null]);
  assert.deepEqual(restoreFavoriteCombos(raw, resolve), [first, second]);
  assert.deepEqual(restoreFavoriteCombos('{broken', resolve), []);
  assert.deepEqual(restoreFavoriteCombos('{}', resolve), []);
  assert.equal(resolve(first).price, 485);
});
