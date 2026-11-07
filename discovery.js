import { builtComboId, comboChoice, comboDrinkIds, comboFoodIds } from './order-options.js?v=20261106-builder';

// Curated situations use existing menu products and their existing prices.
export const moments = [
  { id: 'morning', labels: ['Güne yavaş başla', 'A slow morning', 'Утро без спешки'], captions: ['Kahvaltı & kahve', 'Breakfast & coffee', 'Завтрак и кофе'], image: 'cilbir', mode: 'cafe', ids: ['turkish-classic', 'breakfast-plate', 'cilbir', 'granola', 'turkish-coffee', 'tea'] },
  { id: 'bite', labels: ['Lezzetli bir mola', 'A tasty break', 'Вкусный перекус'], captions: ['Focaccia & kahve', 'Focaccia & coffee', 'Фокачча и кофе'], image: 'smoked-turkey', mode: 'cafe', ids: ['lunch-favourite', 'smoked-turkey', 'beetroot', 'zucchini', 'iced-americano', 'cappuccino'] },
  { id: 'walk', labels: ['Yanına al', 'Take it on a walk', 'С собой на прогулку'], captions: ['Paket servis fikirleri', 'Ideas to take away', 'Идеи с собой'], image: 'to-go-iced-latte', mode: 'takeaway', ids: ['to-go-lunch-favourite', 'to-go-cappuccino', 'to-go-iced-latte', 'to-go-iced-matcha', 'to-go-granola', 'to-go-fries'] },
  { id: 'sweet', labels: ['Tatlı bir an', 'A sweet moment', 'Хочется сладкого'], captions: ['Tatlı & içecek', 'Something sweet & a drink', 'Сладкое и напиток'], image: 'pancake', mode: 'cafe', ids: ['sweet-morning', 'pancake', 'granola', 'hot-chocolate', 'latte', 'mocha'] },
];

// Reject removed or malformed products instead of restoring unusable cart lines.
export function restoreFavoriteCombos(raw, resolve) {
  try {
    const ids = JSON.parse(raw);
    if (!Array.isArray(ids)) return [];
    return [...new Set(ids.filter(id => typeof id === 'string' && comboChoice(resolve(id))))];
  } catch { return []; }
}

// Keep all selected drink options and service format. A budget limits only new suggestions.
export function nextComboChoice(choice, resolve, budget = 0) {
  const max = Number(budget);
  if (!Number.isFinite(max) || max < 0) return null;
  const pairs = comboFoodIds.flatMap(foodId => comboDrinkIds.map(drinkId => ({ foodId, drinkId })));
  const current = pairs.findIndex(pair => pair.foodId === choice.foodId && pair.drinkId === choice.drinkId);
  if (current < 0) return null;
  for (let offset = 1; offset < pairs.length; offset++) {
    const next = { ...choice, ...pairs[(current + offset) % pairs.length] };
    const entry = resolve(builtComboId(next));
    if (entry && (!max || entry.price <= max)) return next;
  }
  return null;
}
