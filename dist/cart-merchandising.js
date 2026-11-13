import { checkoutPairings,applyCheckoutOffer } from './checkout-offers.js?v=20261113-cart-merch';
import { configurationId } from './order-options.js?v=20261106-builder';

const money=n=>Math.round((n+Number.EPSILON)*100)/100;
const total=(selection,resolve)=>money([...selection].reduce((sum,[id,q])=>sum+resolve(id).price*q,0));
const base=entry=>entry.sourceId??entry.baseId??entry.id;

// Show what is actually added, while the transaction may replace a selected
// portion with the existing priced pairing. No margins or invented savings.
export function checkoutPresentation(selection,offer,resolve){
  const next=applyCheckoutOffer(selection,offer,resolve);
  if(!next)return null;
  const bundle=resolve(offer.addId);
  let display=bundle;
  if(offer.kind==='upgrade'){
    const pair=checkoutPairings.find(pair=>pair.id===base(bundle));
    const selected=resolve(offer.remove[0]?.[0]);
    if(pair&&selected){
      display=base(selected)===pair.food
        ?resolve(configurationId(pair.drink,bundle.milk,bundle.syrup))
        :resolve(pair.food);
    }
  }
  if(!display)return null;
  const before=total(selection,resolve),after=total(next,resolve);
  const separate=offer.kind==='upgrade'?money(before+display.price)
    :offer.kind==='combine'?before:after;
  return {display,bundle,before,after,separate,delta:money(after-before),saving:money(Math.max(0,separate-after))};
}
