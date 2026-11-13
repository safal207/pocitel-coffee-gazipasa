import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { items } from '../dist/catalog.js';
import { builtComboId, comboFoodIds, comboDrinkIds, resolveOrderItem } from '../dist/order-options.js';
import { selectedComboOffer } from '../dist/focaccia-offer.js';
import { comboJourneyState } from '../dist/combo-journey.js';

const app = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/style.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');

test('all existing real pairings start 2/3 because food and drink are already preselected', () => {
  let checked = 0;
  const resolve = id => resolveOrderItem(id, items);
  for (const foodId of comboFoodIds) for (const drinkId of comboDrinkIds) {
    const choice = {foodId, drinkId, milk:'standard', syrup:'none', serving:'takeaway'};
    const built = builtComboId(choice);
    assert.ok(built);
    const offer = selectedComboOffer(new Map(), items, resolve, choice);
    const state = comboJourneyState(choice, offer);
    assert.deepEqual(state, {count:2,total:3,foodChosen:true,drinkChosen:true,orderPossible:true});
    assert.equal(resolve(built).price, resolve(offer.addId).price);
    checked++;
  }
  assert.equal(checked, comboFoodIds.length * comboDrinkIds.length);
});

test('partial/blocked choices never create fake progress or claim order completion', () => {
  assert.deepEqual(comboJourneyState({}, null), {count:0,total:3,foodChosen:false,drinkChosen:false,orderPossible:false});
  assert.deepEqual(comboJourneyState({foodId:'beetroot'}, null), {count:1,total:3,foodChosen:true,drinkChosen:false,orderPossible:false});
  const state = comboJourneyState({foodId:'beetroot',drinkId:'latte'}, null);
  assert.equal(state.count, 2);
  assert.equal(state.orderPossible, false);
  assert.equal(comboJourneyState({foodId:'beetroot',drinkId:'latte'}, {addId:'x'}).orderPossible, true);
});

test('visible journey names are in Turkish, English and Russian', () => {
  for (const key of ['comboStepFood','comboStepDrink','comboStepOrder','comboJourneyReady','comboJourneyBlocked','comboJourneyProgress']) {
    const found = app.match(new RegExp(`\\b${key}: \\[([^\\]]+)\\]`));
    assert.ok(found, key);
    assert.equal((found[1].match(/'/g) || []).length, 6, key);
  }
  assert.match(app, /comboJourneyMarkup\(focacciaDraft, focacciaOffer\)/);
  assert.match(app, /<progress class="combo-journey-bar" value="\$\{state\.count\}" max="\$\{state\.total\}"/);
  assert.match(app, /comboLastEditedField = field === 'foodId' \|\| field === 'drinkId' \? field : null/);
  assert.match(app, /if \(previousScrollTop != null\) scrollPane\.scrollTop = previousScrollTop/);
});

test('third stage is earned only when real combo is placed in the cart', () => {
  assert.match(html, /id="focaccia-undo" class="focaccia-undo" hidden><span class="combo-done-check" aria-hidden="true">3\/3<\/span>/);
  assert.match(app, /focacciaTransaction = \{ before: \[\.\.\.selection\], after: selectionSignature\(next\) \}/);
  assert.match(app, /focacciaPromo\.close\(\)/);
  assert.match(css, /\.focaccia-undo > \.combo-done-check/);
});

test('low-cost animation, reduced motion and images/price calculation are preserved', () => {
  assert.match(css, /\.combo-journey-steps \.is-just-chosen \.combo-journey-symbol \{ animation:/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.combo-journey-steps \.is-just-chosen \.combo-journey-symbol \{ animation: none !important; \}/);
  assert.match(app, /price\(entry\.price\)/);
  assert.match(app, /const drinkPhoto =/);
  assert.match(app, /selectedComboOffer\(selection, items, orderItem, focacciaDraft/);
  assert.match(html, /style\.css\?v=20261113-miora/);
  assert.match(html, /app\.js\?v=20261113-miora/);
});
