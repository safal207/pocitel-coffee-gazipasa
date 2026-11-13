import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { categories } from '../dist/menu.js';
import { items, feedOrder, takeawayItems } from '../dist/catalog.js';
import { revealFor } from '../dist/ingredient-reveal.js';
import { cutawayImagesFor } from '../dist/cutaway-media.js';
import { cutawayOverlayMarkup, cutawayPhotoTagsMarkup, previewFor } from '../dist/cutaway-overlay.js';

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
  for (const path of ['breakfast-plate-inside-v1', 'omelet-plate-inside-v1', 'granola-inside-v1', 'to-go-granola-inside-v1', 'pancake-outside-v1', 'pancake-inside-v1']) {
    assert.ok(existsSync(new URL(`../dist/assets/cutaway/${path}.webp`, import.meta.url)), path);
  }
});

test('all 55 items have ingredient text or explicit non-support across TR/EN/RU', () => {
  assert.equal(allEntries.filter(expectedReveal).length, 24, 'Ingredient inventory changed');
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

test('24 food descriptions can feed a localized ingredient summary independently of slider eligibility', () => {
  for (const entry of allEntries.filter(expectedReveal)) {
    for (const [language, title, more] of [[0, 'İçinde', 'daha'], [1, 'Inside', 'more'], [2, 'Внутри', 'ещё']]) {
      const reveal = revealFor(entry, language);
      const model = previewFor(reveal);
      assert.ok(model && model.preview.length >= 1 && model.preview.length <= 3);
      assert.equal(model.preview.length + model.remaining, reveal.parts.length);
      const markup = cutawayOverlayMarkup(reveal, title, more, 'All ingredients');
      assert.match(markup, /data-qa="inside-overlay"/);
      assert.ok(markup.includes(title), `${entry.id}: title ${language}`);
      assert.match(markup, /<button type="button"/);
      assert.match(markup, /aria-controls="cutaway-ingredients" aria-expanded="false"/);
      assert.ok(markup.includes(reveal.parts[0].replaceAll('&', '&amp;')), `${entry.id}: first ingredient`);
      assert.equal((markup.match(/class="cutaway-ingredient-card"/g) || []).length, 1);
      const photoTags = cutawayPhotoTagsMarkup(reveal);
      assert.match(photoTags, /aria-hidden="true"/);
      assert.equal((photoTags.match(/<span>/g) || []).length, reveal.parts.length);
      for (const part of reveal.parts) assert.ok(photoTags.includes(part.replaceAll('&', '&amp;')), `${entry.id}: photo tag ${language}`);
    }
  }
});

test('sliders require reviewed distinct inside media; a recipe or alternate top view is insufficient',()=>{
  const expected=['smoked-turkey','beetroot','zucchini','omelet-plate','pancake','sweet-morning','lunch-favourite','to-go-lunch-favourite'].sort();
  assert.deepEqual(allEntries.filter(entry=>cutawayImagesFor(entry)).map(entry=>entry.id).sort(),expected);
  for(const entry of allEntries){
    const pair=cutawayImagesFor(entry);
    if(pair){assert.notEqual(pair[0],pair[1]);for(const path of pair)assert.ok(existsSync(new URL('../dist/'+path,import.meta.url)))}
  }
  for(const id of ['cilbir','menemen','granola','to-go-granola','breakfast-plate','fresh-energy','fries','egg']){
    assert.ok(revealFor(items.get(id),2),id);assert.equal(cutawayImagesFor(items.get(id)),null,id);
  }
});

test('unexpected or empty ingredients cannot create a fake ingredient overlay', () => {
  assert.equal(previewFor(null), null);
  assert.equal(previewFor({ parts: [] }), null);
  assert.equal(cutawayOverlayMarkup(null, 'Внутри', 'ещё', 'Весь состав'), '');
  assert.equal(cutawayOverlayMarkup({ parts: ['<test>&"'] }, 'Inside', 'more', 'All ingredients').includes('<test>'), false);
  assert.ok(cutawayOverlayMarkup({ parts: ['<test>&"'] }, 'Inside', 'more', 'All ingredients').includes('&lt;test&gt;'));
  assert.equal(cutawayPhotoTagsMarkup(null), '');
  assert.ok(cutawayPhotoTagsMarkup({ parts: ['<test>&"'] }).includes('&lt;test&gt;'));
  assert.ok(!cutawayPhotoTagsMarkup({ parts: ['<test>&"'] }).includes('<test>'));
});

test('cached older app versions keep their noninteractive caption', () => {
  const markup = cutawayOverlayMarkup({ parts: ['Bread', 'Cheese', 'Tomato', 'Rocket'] }, 'Inside', 'more');
  assert.match(markup, /role="note"/);
  assert.doesNotMatch(markup, /<button|undefined/);
  assert.ok(markup.includes('+1 more'));
});
