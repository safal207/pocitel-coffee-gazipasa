import test from 'node:test';
import assert from 'node:assert/strict';
import { items } from '../dist/catalog.js';
import { builtComboId, comboChoice, comboFoodIds, comboDrinkIds, isTakeaway, resolveOrderItem } from '../dist/order-options.js';
import { selectedComboOffer } from '../dist/focaccia-offer.js';
import { applyCheckoutOffer, checkoutSavings, selectionSignature, undoCheckoutOffer } from '../dist/checkout-offers.js';
import { nutritionFor } from '../dist/nutrition.js';
const resolve = id => resolveOrderItem(id, items);
const choice = (foodId='beetroot',drinkId='cappuccino',extras={}) => ({foodId,drinkId,milk:'standard',syrup:'none',serving:'takeaway',...extras});
test('all 69 pairings use selected menu components, with only the existing lunch discount',()=>{
 let count=0;
 for(const foodId of comboFoodIds) for(const drinkId of comboDrinkIds){
  const c=choice(foodId,drinkId),entry=resolve(builtComboId(c));
  const saving=foodId==='smoked-turkey'&&drinkId==='iced-americano'?20:0;
  assert.equal(entry.price,items.get(foodId).price+items.get(drinkId).price-saving);
  assert.deepEqual(comboChoice(entry),c);
  assert.equal(checkoutSavings(new Map([[entry.id,1]]),items,resolve),saving);
  assert.deepEqual(nutritionFor(entry,items).parts.map(p=>p.id),[foodId,drinkId]);
  assert.equal(isTakeaway(entry),true);count++;
 }
 assert.equal(count,69);
});
test('custom pair choices and extras survive JSON persistence for both serving formats',()=>{
 for(const serving of ['cafe','takeaway']){
  const c=choice('beetroot','latte',{milk:'oat',syrup:'vanilla',serving});
  const id=builtComboId(c), selection=new Map(JSON.parse(JSON.stringify([[id,2]])));
  const entry=resolve([...selection.keys()][0]);
  assert.equal(entry.price,485);assert.deepEqual(comboChoice(entry),c);assert.equal(isTakeaway(entry),serving==='takeaway');
 }
});
test('editing preserves all portions, merges matching rows and supports exact undo',()=>{
 const old=builtComboId(choice()),nextId=builtComboId(choice('zucchini','iced-matcha'));
 const selection=new Map([[old,2],[nextId,4],['tea',1]]);
 const offer=selectedComboOffer(selection,items,resolve,choice('zucchini','iced-matcha'),{editId:old});
 assert.equal(offer.addQuantity,2);assert.equal(offer.delta,140);
 const next=applyCheckoutOffer(selection,offer,resolve);
 assert.equal(next.get(nextId),6);assert.equal(next.get('tea'),1);assert.equal(next.has(old),false);
 assert.deepEqual(undoCheckoutOffer(next,{before:[...selection],after:selectionSignature(next)}),selection);
 assert.equal(selectedComboOffer(new Map([[old,2],[nextId,98]]),items,resolve,choice('zucchini','iced-matcha'),{editId:old}),null);
});
test('grouping reuses matching portions and retains differently customized drinks',()=>{
 const c=choice('beetroot','latte',{milk:'oat',syrup:'vanilla'});
 const selection=new Map([['beetroot',2],['latte~oat~vanilla',1],['latte',1]]);
 const offer=selectedComboOffer(selection,items,resolve,c);assert.equal(offer.kind,'combine');assert.equal(offer.delta,0);
 const next=applyCheckoutOffer(selection,offer,resolve);assert.equal(next.get('beetroot'),1);assert.equal(next.get('latte'),1);assert.equal(next.has('latte~oat~vanilla'),false);
 const mismatch=selectedComboOffer(new Map([['beetroot',1],['latte~oat~vanilla',1]]),items,resolve,choice('beetroot','latte'));
 assert.equal(mismatch.delta,185);assert.deepEqual(mismatch.remove,[['beetroot',1]]);
});
test('invalid pair encodings, unsupported extras, stale offers and invalid quantities are rejected',()=>{
 for(const id of ['pair~beetroot~tea~oat~none~cafe','pair~beetroot~tea~standard~vanilla~cafe','pair~unknown~latte~standard~none~takeaway','pair~beetroot~latte~standard~none~unknown','pair~smoked-turkey~iced-americano~standard~none~takeaway','pair~beetroot~latte']) assert.equal(resolve(id),undefined);
 const selection=new Map(),offer=selectedComboOffer(selection,items,resolve,choice());
 for(const quantity of [0,-1,1.5,100]) assert.equal(applyCheckoutOffer(selection,{...offer,addQuantity:quantity},resolve),null);
 assert.equal(applyCheckoutOffer(selection,{...offer,remove:[['tea',-1]]},resolve),null);
 selection.set('tea',1);assert.equal(applyCheckoutOffer(selection,offer,resolve),null);
});
