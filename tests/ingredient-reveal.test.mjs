import test from 'node:test';
import assert from 'node:assert/strict';
import { categories } from '../dist/menu.js';
import { items, takeawayItems } from '../dist/catalog.js';
import { comboParts } from '../dist/nutrition-data.js';
import { revealFor } from '../dist/ingredient-reveal.js';

test('every breakfast, snack and focaccia has a localized ingredient reveal', () => {
  for (const category of categories.filter(({ id }) => ['breakfast', 'sweet', 'focaccia'].includes(id))) {
    for (const entry of category.items) {
      const translated = [0, 1, 2].map(language => revealFor(entry, language));
      assert.ok(translated.every(result => result && result.dishId === entry.id && !result.pairing), entry.id);
      assert.ok(translated[0].parts.length > 0 && translated[0].parts.length <= 6, entry.id);
      assert.ok(translated.every(result => result.parts.length === translated[0].parts.length), entry.id);
      assert.ok(translated.every(result => result.parts.every(part => typeof part === 'string' && part.trim())), entry.id);
    }
  }
});

test('pairings reveal their actual food, including takeaway variants', () => {
  for (const [pairId, [foodId]] of Object.entries(comboParts)) {
    const result = revealFor(items.get(pairId), 2);
    assert.equal(result?.dishId, foodId, pairId);
    assert.equal(result?.pairing, true, pairId);
    assert.deepEqual(result.parts, revealFor(items.get(foodId), 2).parts, pairId);
  }
  for (const entry of takeawayItems) {
    const original = revealFor(items.get(entry.sourceId), 1);
    assert.deepEqual(revealFor(entry, 1), original, entry.id);
  }
});

test('non-food items and unsupported languages do not get invented descriptions', () => {
  assert.equal(revealFor(items.get('latte'), 2), null);
  assert.equal(revealFor(items.get('tea'), 0), null);
  assert.equal(revealFor(items.get('smoked-turkey'), 3), null);
  assert.equal(revealFor(null, 0), null);
});
