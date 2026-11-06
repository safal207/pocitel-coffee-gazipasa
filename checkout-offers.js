import { configurationId, isTakeaway } from './order-options.js?v=20261106-builder';

const pairings = [
  { id: 'turkish-classic', food: 'cilbir', drink: 'tea' },
  { id: 'sweet-morning', food: 'pancake', drink: 'cappuccino' },
  { id: 'fresh-energy', food: 'granola', drink: 'iced-matcha' },
  { id: 'lunch-favourite', food: 'smoked-turkey', drink: 'iced-americano' },
];
const foods = new Set(['breakfast-plate', 'omelet-plate', 'menemen', 'cilbir', 'pancake', 'sucuk', 'fries', 'granola', 'beetroot', 'smoked-turkey', 'zucchini']);
const drinks = new Set(['turkish-coffee', 'espresso', 'americano', 'flat-white', 'cappuccino', 'latte', 'cortado', 'mocha', 'matcha', 'hot-chocolate', 'chai', 'salep', 'toffee', 'caramel', 'iced-americano', 'iced-latte', 'iced-mocha', 'frappe', 'iced-matcha', 'tea', 'relax', 'maroc', 'balance']);
const baseId = entry => entry.sourceId ?? entry.baseId ?? entry.id;

export const selectionSignature = selection => JSON.stringify([...selection].sort(([a], [b]) => a.localeCompare(b)));

export function checkoutSavings(selection, catalog, resolve) {
  return [...selection].reduce((sum, [id, quantity]) => {
    const entry = resolve(id);
    const base = catalog.get(entry.baseId ?? entry.id);
    return sum + Math.max(0, base ? (base.before ?? base.price) - base.price : 0) * quantity;
  }, 0);
}

// A checked offer is a single reversible cart transaction, including replacements.
export function applyCheckoutOffer(selection, offer, resolve, limit = 99) {
  if (!offer || selectionSignature(selection) !== offer.signature || !resolve(offer.addId)) return null;
  const addQuantity = offer.addQuantity ?? 1;
  if (!Number.isInteger(addQuantity) || addQuantity < 1 || addQuantity > limit) return null;
  const next = new Map(selection);
  for (const [id, quantity] of offer.remove) {
    if (!Number.isInteger(quantity) || quantity < 1) return null;
    const previous = next.get(id) ?? 0;
    if (previous < quantity) return null;
    if (previous === quantity) next.delete(id);
    else next.set(id, previous - quantity);
  }
  const quantity = (next.get(offer.addId) ?? 0) + addQuantity;
  if (quantity > limit) return null;
  next.set(offer.addId, quantity);
  return next;
}

export function undoCheckoutOffer(selection, transaction) {
  if (!transaction || selectionSignature(selection) !== transaction.after) return null;
  return new Map(transaction.before);
}

export function recommendCheckout(selection, catalog, resolve) {
  if (!selection.size) return null;
  const entries = [...selection.keys()].map(resolve);
  const findSingle = id => entries.find(entry => !entry.sourceId && baseId(entry) === id);
  const hasFood = entries.some(entry => entry.isBuiltCombo || foods.has(baseId(entry)) || pairings.some(pair => pair.id === baseId(entry)));
  const hasDrink = entries.some(entry => entry.isBuiltCombo || drinks.has(baseId(entry)) || pairings.some(pair => pair.id === baseId(entry)));
  const hasCoffee = entries.some(entry => (entry.isBuiltCombo && !['tea', 'relax', 'maroc', 'balance'].includes(entry.comboChoice.drinkId)) || (drinks.has(baseId(entry)) && !['tea', 'relax', 'maroc', 'balance'].includes(baseId(entry))) || pairings.some(pair => pair.id === baseId(entry) && pair.drink !== 'tea'));
  const make = (kind, addId, remove = [], reason = kind) => {
    const added = resolve(addId);
    if (!added) return null;
    const offer = { kind, reason, addId, remove, signature: selectionSignature(selection), delta: added.price - remove.reduce((sum, [id, qty]) => sum + resolve(id).price * qty, 0) };
    return applyCheckoutOffer(selection, offer, resolve) ? offer : null;
  };

  // First, save money on matching items already selected. Keep drink customizations.
  for (const pair of pairings) {
    const food = findSingle(pair.food);
    const drink = findSingle(pair.drink);
    if (food && drink) {
      const offer = make('combine', configurationId(pair.id, drink.milk, drink.syrup), [[food.id, 1], [drink.id, 1]]);
      if (offer) return offer;
    }
  }
  if (!hasDrink || !hasFood) {
    for (const pair of pairings) {
      const single = findSingle(hasDrink ? pair.drink : pair.food);
      if (!single) continue;
      const offer = make('upgrade', configurationId(pair.id, single.milk, single.syrup), [[single.id, 1]], hasDrink ? 'foodWithDrink' : 'drinkWithFood');
      if (offer) return offer;
    }
  }

  const hasTakeaway = entries.some(isTakeaway);
  let next;
  let reason;
  if (hasFood && !hasDrink && !hasTakeaway) {
    next = 'tea'; reason = 'teaWithBreakfast';
  } else if (hasFood && !hasCoffee) {
    next = 'to-go-cappuccino'; reason = 'coffeeForWalk';
  } else if (hasDrink && !hasFood) {
    next = hasTakeaway ? 'to-go-granola' : 'pancake'; reason = hasTakeaway ? 'breakfastToGo' : 'sweetWithCoffee';
  }
  if (!next || entries.some(entry => baseId(entry) === baseId(catalog.get(next)))) return null;
  return make('add', next, [], reason);
}
