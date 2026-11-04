export const milkOptions = [
  { id: 'standard', labels: ['Standart tarif', 'Standard recipe', 'По рецепту'] },
  { id: 'oat', labels: ['Yulaf sütü', 'Oat milk', 'Овсяное молоко'] },
  { id: 'almond', labels: ['Badem sütü', 'Almond milk', 'Миндальное молоко'] },
];

export const syrupOptions = [
  { id: 'none', labels: ['Ek şurup yok', 'No extra syrup', 'Без добавочного сиропа'] },
  { id: 'vanilla', labels: ['Vanilya', 'Vanilla', 'Ваниль'] },
  { id: 'caramel', labels: ['Karamel', 'Caramel', 'Карамель'] },
  { id: 'hazelnut', labels: ['Fındık', 'Hazelnut', 'Фундук'] },
  { id: 'coconut', labels: ['Hindistan cevizi', 'Coconut', 'Кокос'] },
];

const milkDrinks = new Set([
  'flat-white', 'cappuccino', 'latte', 'cortado', 'mocha', 'matcha',
  'iced-latte', 'iced-mocha', 'frappe', 'iced-matcha',
]);
const syrupDrinks = new Set([
  'espresso', 'americano', 'flat-white', 'cappuccino', 'latte', 'cortado',
  'mocha', 'iced-americano', 'iced-latte', 'iced-mocha', 'frappe',
]);
const comboDrinks = {
  'sweet-morning': 'cappuccino',
  'fresh-energy': 'iced-matcha',
  'lunch-favourite': 'iced-americano',
};

export function customization(entry) {
  const baseId = entry.sourceId ?? entry.baseId ?? entry.id;
  const drink = comboDrinks[baseId] ?? baseId;
  return { milk: milkDrinks.has(drink), syrup: syrupDrinks.has(drink) };
}

export function configurationId(baseId, milk = 'standard', syrup = 'none') {
  if (milk === 'standard' && syrup === 'none') return baseId;
  return `${baseId}~${milk}~${syrup}`;
}

// Decode only known catalog choices. Old plain item IDs remain valid order lines.
export function resolveOrderItem(id, catalog) {
  if (typeof id !== 'string') return undefined;
  if (catalog.has(id)) return catalog.get(id);
  const parts = id.split('~');
  if (parts.length !== 3) return undefined;
  const [baseId, milk, syrup] = parts;
  const base = catalog.get(baseId);
  if (!base || !milkOptions.some(option => option.id === milk) || !syrupOptions.some(option => option.id === syrup)) return undefined;
  const supported = customization(base);
  if ((!supported.milk && milk !== 'standard') || (!supported.syrup && syrup !== 'none')) return undefined;
  if (configurationId(baseId, milk, syrup) !== id) return undefined;
  const milkPrice = milk === 'standard' ? 0 : catalog.get('plant-milk').price;
  const syrupPrice = syrup === 'none' ? 0 : catalog.get('syrup').price;
  return { ...base, id, baseId, milk, syrup, price: base.price + milkPrice + syrupPrice };
}

export function optionLabels(entry, language) {
  const labels = [];
  if (entry.milk && entry.milk !== 'standard') labels.push(milkOptions.find(option => option.id === entry.milk).labels[language]);
  if (entry.syrup && entry.syrup !== 'none') labels.push(syrupOptions.find(option => option.id === entry.syrup).labels[language]);
  return labels.join(' · ');
}

export function replaceOrderLine(selection, oldId, newId, quantity, limit = 99) {
  const existing = oldId === newId ? 0 : selection.get(newId) ?? 0;
  if (!Number.isInteger(quantity) || quantity < 1 || existing + quantity > limit) return false;
  if (oldId && !selection.has(oldId)) return false;
  if (oldId && oldId !== newId) selection.delete(oldId);
  selection.set(newId, existing + quantity);
  return true;
}
