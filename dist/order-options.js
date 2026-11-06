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

export const comboFoodIds = ['smoked-turkey', 'beetroot', 'zucchini'];
export const comboDrinkIds = ['iced-americano', 'cappuccino', 'latte', 'iced-latte', 'americano', 'flat-white', 'turkish-coffee', 'espresso', 'cortado', 'mocha', 'matcha', 'hot-chocolate', 'chai', 'salep', 'toffee', 'caramel', 'iced-mocha', 'frappe', 'iced-matcha', 'tea', 'relax', 'maroc', 'balance'];
export const isTakeaway = entry => Boolean(entry?.sourceId) || entry?.serving === 'takeaway';

export function builtComboId({ foodId, drinkId, milk = 'standard', syrup = 'none', serving = 'takeaway' } = {}) {
  if (!comboFoodIds.includes(foodId) || !comboDrinkIds.includes(drinkId) || !['cafe', 'takeaway'].includes(serving) || !milkOptions.some(o => o.id === milk) || !syrupOptions.some(o => o.id === syrup)) return undefined;
  if (foodId === 'smoked-turkey' && drinkId === 'iced-americano') return configurationId(serving === 'takeaway' ? 'to-go-lunch-favourite' : 'lunch-favourite', milk, syrup);
  return `pair~${foodId}~${drinkId}~${milk}~${syrup}~${serving}`;
}

export function comboChoice(entry) {
  if (!entry) return null;
  if (entry.isBuiltCombo) return { ...entry.comboChoice };
  if ((entry.sourceId ?? entry.baseId ?? entry.id) !== 'lunch-favourite') return null;
  return { foodId: 'smoked-turkey', drinkId: 'iced-americano', milk: entry.milk ?? 'standard', syrup: entry.syrup ?? 'none', serving: isTakeaway(entry) ? 'takeaway' : 'cafe' };
}

export function customization(entry) {
  const baseId = entry.sourceId ?? entry.baseId ?? entry.id;
  const drink = entry.isBuiltCombo ? entry.comboChoice.drinkId : comboDrinks[baseId] ?? baseId;
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
  if (parts[0] === 'pair') {
    if (parts.length !== 6) return undefined;
    const [, foodId, drinkId, milk, syrup, serving] = parts;
    const choice = { foodId, drinkId, milk, syrup, serving };
    if (builtComboId(choice) !== id) return undefined;
    const food = catalog.get(foodId);
    const drink = catalog.get(drinkId);
    const chosenDrink = resolveOrderItem(configurationId(drinkId, milk, syrup), catalog);
    if (!food || !drink || !chosenDrink) return undefined;
    return { id, isBuiltCombo: true, comboChoice: choice, componentIds: [foodId, drinkId], milk, syrup, serving,
      names: ['Kendi eşleşmem', 'My pairing', 'Моё комбо'],
      descriptions: food.names.map((label, language) => `${label} + ${drink.names[language]}`), image: food.image, price: food.price + chosenDrink.price };
  }
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
