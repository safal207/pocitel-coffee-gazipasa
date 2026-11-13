import test from 'node:test';
import assert from 'node:assert/strict';
import { items } from '../dist/catalog.js';
import { resolveOrderItem,builtComboId } from '../dist/order-options.js';
import { recommendCheckout,applyCheckoutOffer,undoCheckoutOffer,selectionSignature } from '../dist/checkout-offers.js';
import { checkoutPresentation } from '../dist/cart-merchandising.js';
const resolve=id=>resolveOrderItem(id,items);

test('an existing food and drink are not followed by an unsolicited third drink',()=>{
 for(const entries of [[['breakfast-plate',1],['tea',1]],[['beetroot',1],['latte',1]],[['fresh-energy',1]]]){
  assert.equal(recommendCheckout(new Map(entries),items,resolve),null);
 }
 const custom=builtComboId({foodId:'beetroot',drinkId:'latte',serving:'cafe'});
 assert.equal(recommendCheckout(new Map([[custom,1]]),items,resolve),null);
});
test('the offer shows the missing food, exact extra charge and real menu savings',()=>{
 const selection=new Map([['cappuccino',2]]),before=selectionSignature(selection);
 const offer=recommendCheckout(selection,items,resolve),model=checkoutPresentation(selection,offer,resolve);
 assert.equal(model.display.id,'pancake');assert.equal(model.bundle.id,'sweet-morning');
 assert.equal(model.before,370);assert.equal(model.after,645);assert.equal(model.delta,275);
 assert.equal(model.separate,670);assert.equal(model.saving,25);
 assert.equal(selectionSignature(selection),before,'preview must not change the order');
 const changed=applyCheckoutOffer(selection,offer,resolve);
 assert.equal(changed.get('cappuccino'),1);assert.equal(changed.get('sweet-morning'),1);
 assert.deepEqual([...undoCheckoutOffer(changed,{before:[...selection],after:selectionSignature(changed)})],[...selection]);
});
test('missing drink photo and price preserve the selected serving, modifier costs and other portions',()=>{
 const food=new Map([['smoked-turkey',1]]),offer=recommendCheckout(food,items,resolve);
 const model=checkoutPresentation(food,offer,resolve);
 assert.equal(model.display.id,'iced-americano');assert.equal(model.delta,155);assert.equal(model.saving,20);
 const customized='cappuccino~oat~vanilla';
 const selection=new Map([[customized,2]]),customOffer=recommendCheckout(selection,items,resolve);
 const custom=checkoutPresentation(selection,customOffer,resolve),changed=applyCheckoutOffer(selection,customOffer,resolve);
 assert.equal(custom.display.id,'pancake');assert.equal(custom.saving,25);
 assert.equal(changed.get(customized),1);assert.equal(changed.get('sweet-morning~oat~vanilla'),1);
 assert.equal(custom.delta,items.get('sweet-morning').price-items.get('cappuccino').price);
});
test('combining existing items reduces their actual price; generic additions have no fictitious discount',()=>{
 const selection=new Map([['cilbir',1],['tea',1]]),offer=recommendCheckout(selection,items,resolve);
 const model=checkoutPresentation(selection,offer,resolve);
 assert.equal(offer.kind,'combine');assert.equal(model.delta,-15);assert.equal(model.saving,15);assert.equal(model.after,345);
 const toGo=new Map([['to-go-fries',1]]),add=recommendCheckout(toGo,items,resolve),plain=checkoutPresentation(toGo,add,resolve);
 assert.equal(plain.display.id,'to-go-cappuccino');assert.equal(plain.saving,0);
 assert.equal(plain.delta,items.get('to-go-cappuccino').price);
 const stale=new Map([['cilbir',2],['tea',1]]);assert.equal(checkoutPresentation(stale,offer,resolve),null);
});
