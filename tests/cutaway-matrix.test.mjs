import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { categories } from '../dist/menu.js';
import { items, feedOrder, takeawayItems } from '../dist/catalog.js';
import { revealFor } from '../dist/ingredient-reveal.js';
import { cutawayOverlayMarkup, previewFor } from '../dist/cutaway-overlay.js';

const foodCategories = new Set(['breakfast', 'sweet', 'focaccia', 'combos']);
const foodExtras = new Set(['tomato-cucumber', 'olives', 'cheese', 'egg', 'nutella', 'chocolate-sauce']);
const mainFood = new Set(categories.flatMap(group => group.items
  .filter(entry => foodCategories.has(group.id) || foodExtras.has(entry.id))
  .map(entry => entry.id)));
const allEntries = [...feedOrder, ...takeawayItems];
const expectedReveal = entry => mainFood.has(entry.sourceId ?? entry.id);

test('inventory is complete and every catalog item has a valid photo', () => {
  assert.equal(feedOrder.length, 46, 'Updating main menu requires refreshing the QA matrix');
  assert.equal(takeawayItems.length, 9, 'Updating takeaway variants requires refreshing the QA matrix');
  assert.equal(allEntries.length, 55);
  assert.equal(new Set(allEntries.map(entry => entry.id)).size, allEntries.length);
  for (const entry of allEntries) {
    assert.equal(items.get(entry.id), entry, `Catalog lookup: ${entry.id}`);
    assert.ok(existsSync(new URL(`../dist/assets/${entry.image}.webp`, import.meta.url)), `Missing image: ${entry.id}`);
  }
  for (const path of ['beetroot-outside', 'focaccia-outside', 'focaccia-inside', 'zucchini-outside']) {
    assert.ok(existsSync(new URL(`../dist/assets/cutaway/${path}.webp`, import.meta.url)), path);
  }
});

test('all 55 items have correct support or explicit non-support across TR/EN/RU', () => {
  assert.equal(allEntries.filter(expectedReveal).length, 24, 'Cutaway inventory changed');
  for (const entry of allEntries) {
    for (const language of [0, 1, 2]) {
      const data = revealFor(entry, language);
      assert.equal(Boolean(data), expectedReveal(entry), `${entry.id}: lang ${language}`);
      if (!data) continue;
      assert.ok(data.parts.length > 0 && data.parts.length <= 6, entry.id);
      assert.ok(data.parts.every(part => typeof part === 'string' && part.trim()), `${entry.id}: translated parts`);
      assert.equal(data.pairing, ['turkish-classic', 'sweet-morning', 'fresh-energy', 'lunch-favourite'].includes(entry.sourceId ?? entry.id));
      if (entry.sourceId) {
        assert.deepEqual(data.parts, revealFor(items.get(entry.sourceId), language).parts, `Takeaway variant ${entry.id}`);
      }
    }
  }
});

test('24 cutaway cards render a localized visible on-photo summary in all languages', () => {
  for (const entry of allEntries.filter(expectedReveal)) {
    for (const [language, title, more] of [[0, 'İçinde', 'daha'], [1, 'Inside', 'more'], [2, 'Внутри', 'ещё']]) {
      const reveal = revealFor(entry, language);
      const model = previewFor(reveal);
      assert.ok(model && model.preview.length >= 1 && model.preview.length <= 3);
      assert.equal(model.preview.length + model.remaining, reveal.parts.length);
      const markup = cutawayOverlayMarkup(reveal, title, more);
      assert.match(markup, /data-qa="inside-overlay"/);
      assert.ok(markup.includes(title), `${entry.id}: title ${language}`);
      assert.ok(markup.includes('role="note"'));
      assert.ok(markup.includes(reveal.parts[0].replaceAll('&', '&amp;')), `${entry.id}: first ingredient`);
      assert.equal((markup.match(/class="cutaway-ingredient-card"/g) || []).length, 1);
    }
  }
});

test('unexpected or empty ingredients cannot create a fake ingredient overlay', () => {
  assert.equal(previewFor(null), null);
  assert.equal(previewFor({ parts: [] }), null);
  assert.equal(cutawayOverlayMarkup(null, 'Внутри', 'ещё'), '');
  assert.equal(cutawayOverlayMarkup({ parts: ['<test>&"'] }, 'Inside', 'more').includes('<test>'), false);
  assert.ok(cutawayOverlayMarkup({ parts: ['<test>&"'] }, 'Inside', 'more').includes('&lt;test&gt;'));
});
