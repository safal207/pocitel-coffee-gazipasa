import test from 'node:test';
import assert from 'node:assert/strict';
import { items } from '../dist/catalog.js';
import { focacciaTakeawayOffer } from '../dist/focaccia-offer.js';
import { applyCheckoutOffer, selectionSignature, undoCheckoutOffer, checkoutSavings } from '../dist/checkout-offers.js';
import { resolveOrderItem } from '../dist/order-options.js';

const resolve = id => resolveOrderItem(id, items);
const total = selection => [...selection].reduce((sum, [id, quantity]) => sum + resolve(id).price * quantity, 0);

test('empty-cart offer adds the existing 395 ₺ pairing with a durable takeaway preference', () => {
  const selection = new Map();
  const offer = focacciaTakeawayOffer(selection, items, resolve);
  assert.equal(offer.addId, 'to-go-lunch-favourite');
  assert.equal(offer.delta, 395);
  const next = applyCheckoutOffer(selection, offer, resolve);
  const restored = new Map(JSON.parse(JSON.stringify([...next])));
  assert.equal(total(restored), 395);
  assert.equal(resolve([...restored.keys()][0]).sourceId, 'lunch-favourite');
  assert.equal(checkoutSavings(restored, items, resolve), 20);
});

test('combining preserves the syrup and extra portions, saves 20 ₺ and can be undone exactly', () => {
  const selection = new Map([['smoked-turkey', 2], ['iced-americano~standard~vanilla', 1], ['cappuccino', 1]]);
  const offer = focacciaTakeawayOffer(selection, items, resolve);
  assert.equal(offer.kind, 'combine');
  assert.equal(offer.delta, -20);
  const next = applyCheckoutOffer(selection, offer, resolve);
  assert.equal(next.get('smoked-turkey'), 1);
  assert.equal(next.get('cappuccino'), 1);
  assert.equal(next.get('to-go-lunch-favourite~standard~vanilla'), 1);
  assert.equal(next.has('iced-americano~standard~vanilla'), false);
  assert.equal(total(next), total(selection) - 20);
  assert.deepEqual(undoCheckoutOffer(next, { before: [...selection], after: selectionSignature(next) }), selection);
});

test('upgrades charge only the missing component while retaining other servings', () => {
  for (const [id, quantity, delta] of [['smoked-turkey', 3, 155], ['iced-americano', 2, 220]]) {
    const selection = new Map([[id, quantity]]);
    const offer = focacciaTakeawayOffer(selection, items, resolve);
    const next = applyCheckoutOffer(selection, offer, resolve);
    assert.equal(offer.kind, 'upgrade');
    assert.equal(offer.delta, delta);
    assert.equal(next.get(id), quantity - 1);
    assert.equal(total(next), total(selection) + delta);
  }
});

test('already selected pairings and stale offers never add another unwanted pairing', () => {
  for (const id of ['lunch-favourite', 'to-go-lunch-favourite', 'to-go-lunch-favourite~standard~caramel']) {
    assert.equal(focacciaTakeawayOffer(new Map([[id, 1]]), items, resolve), null);
  }
  const selection = new Map([['smoked-turkey', 1]]);
  const offer = focacciaTakeawayOffer(selection, items, resolve);
  selection.set('smoked-turkey', 2);
  assert.equal(applyCheckoutOffer(selection, offer, resolve), null);
  assert.equal(focacciaTakeawayOffer(new Map(), items, resolve, 0), null);
  assert.equal(focacciaTakeawayOffer(new Map([['invalid', 1]]), items, resolve), null);
});
