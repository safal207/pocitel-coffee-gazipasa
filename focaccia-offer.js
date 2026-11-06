import { configurationId, builtComboId } from './order-options.js?v=20261106-builder';
import { selectionSignature, applyCheckoutOffer } from './checkout-offers.js?v=20261106-builder';

const baseId = entry => entry.sourceId ?? entry.baseId ?? entry.id;

export function selectedComboOffer(selection, catalog, resolve, choice, { editId = null, limit = 99 } = {}) {
  const addId = builtComboId(choice);
  const added = resolve(addId);
  if (!added) return null;
  let remove;
  let addQuantity = 1;
  if (editId) {
    addQuantity = selection.get(editId);
    if (!resolve(editId) || !Number.isInteger(addQuantity) || addQuantity < 1) return null;
    remove = [[editId, addQuantity]];
  } else {
    const entries = [...selection.keys()].map(resolve);
    if (entries.some(entry => !entry)) return null;
    const food = entries.find(entry => baseId(entry) === choice.foodId);
    const drink = entries.find(entry => baseId(entry) === choice.drinkId && (entry.milk ?? 'standard') === (choice.milk ?? 'standard') && (entry.syrup ?? 'none') === (choice.syrup ?? 'none'));
    remove = [food, drink].filter(Boolean).map(entry => [entry.id, 1]);
  }
  const offer = { kind: editId ? 'edit' : remove.length === 2 ? 'combine' : remove.length ? 'upgrade' : 'add', addId, addQuantity, remove, signature: selectionSignature(selection),
    delta: added.price * addQuantity - remove.reduce((sum, [id, quantity]) => sum + resolve(id).price * quantity, 0) };
  return applyCheckoutOffer(selection, offer, resolve, limit) ? offer : null;
}

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
