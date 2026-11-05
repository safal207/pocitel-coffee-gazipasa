import { categories } from './menu.js?v=20261104-drinks';

// Shared by the live menu and the static link-preview publisher.
export const items = new Map(categories.flatMap(category => category.items.map(entry => [entry.id, entry])));
export const categoryByItem = new Map(categories.flatMap(category => category.items.map(entry => [entry.id, category])));
export const categoryById = new Map(categories.map(category => [category.id, category]));
export const combos = categoryById.get('combos').items;
export const feedOrder = [...combos, ...categories.filter(category => category.id !== 'combos').flatMap(category => category.items)];
export const takeawaySuggestions = {
  cappuccino: 'granola',
  'iced-latte': 'granola',
  'hot-chocolate': 'granola',
  'iced-matcha': 'granola',
  chai: 'granola',
  matcha: 'granola',
  granola: 'cappuccino',
  fries: 'iced-latte',
};
export const takeawayItems = Object.keys(takeawaySuggestions).map(sourceId => {
  const id = `to-go-${sourceId}`;
  const entry = { ...items.get(sourceId), id, sourceId, image: `takeaway/${sourceId}` };
  items.set(id, entry);
  categoryByItem.set(id, categoryByItem.get(sourceId));
  return entry;
});

// A serving preference for the existing pairing, with its existing menu price.
// Its photo illustrates the two menu items; packaging is confirmed at the café.
const lunchPair = items.get('lunch-favourite');
const takeawayLunch = { ...lunchPair, id: 'to-go-lunch-favourite', sourceId: lunchPair.id };
takeawayItems.push(takeawayLunch);
items.set(takeawayLunch.id, takeawayLunch);
categoryByItem.set(takeawayLunch.id, categoryByItem.get(lunchPair.id));
