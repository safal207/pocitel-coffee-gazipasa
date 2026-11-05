import test from 'node:test';
import assert from 'node:assert/strict';
import { items, takeawayItems } from '../dist/catalog.js';
import { ingredients, nutritionData, vitaminProfiles, benefitProfiles, comboParts } from '../dist/nutrition-data.js';
import { nutritionFor, recipeEnergy, nutritionMarkup, nutritionCopy } from '../dist/nutrition.js';
import { resolveOrderItem } from '../dist/order-options.js';
import { energyRanges } from '../dist/nutrition-summary.js';

test('all 54 catalog entries have complete localized ingredient and nutrition information', () => {
  assert.equal(items.size, 54);
  for (const entry of items.values()) {
    const n = nutritionFor(entry, items);
    assert.ok(n, entry.id);
    assert.deepEqual(energyRanges[entry.id], n.energy, `${entry.id}: feed calories must match the detailed recipe`);
    assert.ok(n.energy[0] >= 0 && n.energy[1] >= n.energy[0], entry.id);
    for (let lang = 0; lang < 3; lang++) {
      const html = nutritionMarkup(entry, lang, items);
      for (const key of ['ingredients','benefits','vitamins','note','estimate']) assert.ok(html.includes(nutritionCopy[key][lang]), `${entry.id} ${lang} ${key}`);
      assert.doesNotMatch(html, /undefined|NaN|\[object Object\]/);
      for (const part of n.parts ?? [n]) assert.ok((part.ingredients?.[lang] ?? part.entry.descriptions[lang])?.length > 4, entry.id);
    }
  }
  for (const texts of [...Object.values(vitaminProfiles), ...Object.values(benefitProfiles)]) {
    assert.equal(texts.length, 3);
    assert.ok(texts.every(text => typeof text === 'string' && text.length > 10));
  }
});

test('recipe estimates enclose unrounded ingredient totals and reject invalid quantities', () => {
  for (const [id, data] of Object.entries(nutritionData)) {
    const [low, high] = recipeEnergy(data.recipe);
    let rawLow = 0, rawHigh = 0;
    for (const [key, a, b] of data.recipe) {
      assert.ok(ingredients[key], `${id}: ${key}`);
      assert.ok(a >= 0 && b >= a);
      rawLow += a * ingredients[key].kcal[0] / 100;
      rawHigh += b * ingredients[key].kcal[1] / 100;
    }
    assert.ok(low <= rawLow + 1e-8 && high >= rawHigh - 1e-8, id);
  }
  assert.deepEqual(recipeEnergy([['nutella', 20, 20]]), [100, 110]); // 539 kcal/100 g → 107.8 kcal.
  assert.throws(() => recipeEnergy([['missing',10,20]]));
  assert.throws(() => recipeEnergy([['egg',20,10]]));
  assert.throws(() => recipeEnergy([['egg',-1,10]]));
});

test('pairings sum their actual components; packaging alone does not invent a calorie change', () => {
  for (const [id, partIds] of Object.entries(comboParts)) {
    const parts = partIds.map(id => nutritionFor(items.get(id), items));
    assert.deepEqual(nutritionFor(items.get(id), items).energy, [0,1].map(i => parts.reduce((total, part) => total + part.energy[i], 0)));
    assert.equal(partIds.reduce((sum, id) => sum + items.get(id).price, 0), items.get(id).before);
  }
  for (const entry of takeawayItems) {
    assert.deepEqual(nutritionFor(entry, items).energy, nutritionFor(items.get(entry.sourceId), items).energy);
    for (let lang = 0; lang < 3; lang++) assert.ok(nutritionMarkup(entry, lang, items).includes(nutritionCopy.take[lang]));
  }
});

test('customized drinks explicitly show base-recipe estimates, including takeaway and pairings', () => {
  for (const id of ['latte~oat~vanilla','to-go-iced-latte~almond~caramel','sweet-morning~almond~none']) {
    const entry = resolveOrderItem(id, items);
    assert.ok(entry, id);
    for (let lang = 0; lang < 3; lang++) {
      const html = nutritionMarkup(entry, lang, items, { changed: true, open: true });
      assert.ok(html.includes(nutritionCopy.changed[lang]));
      assert.ok(html.includes(nutritionCopy.base[lang]));
      assert.match(html, /class="nutrition-panel" open/);
    }
  }
});

test('plain tea and coffee do not acquire vitamin claims, and plant vitamins stay conditional', () => {
  for (const id of ['tea','relax','maroc','balance','espresso','americano','iced-americano','turkish-coffee']) {
    assert.deepEqual(nutritionData[id].vitamins, ['none']);
    assert.ok(nutritionFor(items.get(id), items).energy[1] <= 10);
  }
  assert.deepEqual(nutritionData['plant-milk'].vitamins, ['plant']);
  assert.match(vitaminProfiles.plant[1], /only if.*fortified/);
  assert.match(nutritionMarkup(items.get('frappe'),1,items), /Exact recipe is unknown/);
});
