import { configurationId } from './order-options.js';
import { selectionSignature, applyCheckoutOffer } from './checkout-offers.js';

const baseId = entry => entry.sourceId ?? entry.baseId ?? entry.id;

// Reuse one selected matching item rather than charging for it twice.
export function focacciaTakeawayOffer(selection, catalog, resolve, limit = 99) {
  const entries = [...selection.keys()].map(resolve);
  if (entries.some(entry => !entry || baseId(entry) === 'lunch-favourite')) return null;
  const food = entries.find(entry => baseId(entry) === 'smoked-turkey');
  const drink = entries.find(entry => baseId(entry) === 'iced-americano');
  const addId = configurationId('to-go-lunch-favourite', drink?.milk, drink?.syrup);
  const added = resolve(addId);
  const pair = catalog.get('lunch-favourite');
  if (!added || !pair) return null;
  const remove = [food, drink].filter(Boolean).map(entry => [entry.id, 1]);
  const offer = {
    kind: remove.length === 2 ? 'combine' : remove.length ? 'upgrade' : 'add',
    addId, remove, signature: selectionSignature(selection),
    delta: added.price - remove.reduce((sum, [id, quantity]) => sum + resolve(id).price * quantity, 0),
  };
  return applyCheckoutOffer(selection, offer, resolve, limit) ? offer : null;
}
