// Descriptions follow the café menu; alternative choices stay alternatives.
const dishParts = {
  'breakfast-plate': [
    ['Yumurta: omlet veya haşlanmış', 'Eggs: omelet or boiled', 'Яйца: омлет или варёные'],
    ['Peynir', 'Cheese', 'Сыр'], ['Zeytin', 'Olives', 'Оливки'],
    ['Salata', 'Salad', 'Салат'], ['Reçel', 'Jam', 'Варенье'], ['Ekmek', 'Bread', 'Хлеб'],
  ],
  'omelet-plate': [
    ['Mantarlı veya kaşarlı omlet', 'Mushroom or kaşar omelet', 'Омлет: грибы или кашар'],
    ['Peynir', 'Cheese', 'Сыр'], ['Zeytin', 'Olives', 'Оливки'],
    ['Salata', 'Salad', 'Салат'], ['Reçel', 'Jam', 'Варенье'], ['Ekmek', 'Bread', 'Хлеб'],
  ],
  menemen: [
    ['Yumurta', 'Eggs', 'Яйца'], ['Soğan', 'Onion', 'Лук'], ['Biber', 'Peppers', 'Перец'],
    ['Domates', 'Tomato', 'Томаты'], ['Ekmek', 'Bread', 'Хлеб'], ['Salata', 'Salad', 'Салат'],
  ],
  cilbir: [
    ['Poşe yumurta', 'Poached eggs', 'Яйца пашот'], ['Yoğurt', 'Yogurt', 'Йогурт'],
    ['Acı biberli zeytinyağı', 'Chili olive oil', 'Оливковое масло с чили'], ['Ekmek', 'Bread', 'Хлеб'],
  ],
  pancake: [
    ['Pancake', 'Pancakes', 'Панкейки'], ['Meyve', 'Fruit', 'Фрукты'], ['Nutella', 'Nutella', 'Nutella'],
  ],
  sucuk: [
    ['Yumurta', 'Eggs', 'Яйца'], ['Sucuk', 'Sucuk', 'Суджук'],
    ['Ekmek', 'Bread', 'Хлеб'], ['Salata', 'Salad', 'Салат'],
  ],
  fries: [['Patates kızartması', 'French fries', 'Картофель фри']],
  granola: [
    ['Yoğurt', 'Yogurt', 'Йогурт'], ['Karışık meyve', 'Mixed fruit', 'Фрукты'],
    ['Granola', 'Granola', 'Гранола'], ['Ceviz', 'Walnut', 'Грецкий орех'],
  ],
  beetroot: [
    ['Focaccia ekmeği', 'Focaccia bread', 'Хлеб фокачча'], ['Beyaz peynir', 'White cheese', 'Белый сыр'],
    ['Pancar', 'Beetroot', 'Свёкла'], ['Roka', 'Arugula', 'Руккола'],
    ['Humus', 'Hummus', 'Хумус'], ['Avokado sosu', 'Avocado sauce', 'Соус из авокадо'],
  ],
  'smoked-turkey': [
    ['Focaccia ekmeği', 'Focaccia bread', 'Хлеб фокачча'], ['Hindi füme', 'Smoked turkey', 'Копчёная индейка'],
    ['Domates', 'Tomato', 'Томаты'], ['Roka', 'Arugula', 'Руккола'],
    ['Avokado sosu', 'Avocado sauce', 'Соус из авокадо'],
  ],
  zucchini: [
    ['Focaccia ekmeği', 'Focaccia bread', 'Хлеб фокачча'], ['Kırmızı pesto', 'Red pesto', 'Красный песто'],
    ['Ricotta peyniri', 'Ricotta cheese', 'Рикотта'], ['Izgara kabak', 'Grilled zucchini', 'Цукини на гриле'],
    ['Roka', 'Arugula', 'Руккола'],
  ],
  'tomato-cucumber': [
    ['Domates', 'Tomato', 'Помидоры'], ['Salatalık', 'Cucumber', 'Огурцы'],
  ],
  olives: [['Zeytin', 'Olives', 'Оливки']],
  cheese: [['Dilim peynir', 'Sliced cheese', 'Ломтики сыра']],
  egg: [['Yumurta', 'Egg', 'Яйцо']],
  nutella: [['Nutella', 'Nutella', 'Nutella']],
  'chocolate-sauce': [['Belçika çikolata sosu', 'Belgian chocolate sauce', 'Соус из бельгийского шоколада']],
};

export const pairingFood = {
  'turkish-classic': 'cilbir',
  'sweet-morning': 'pancake',
  'fresh-energy': 'granola',
  'lunch-favourite': 'smoked-turkey',
};

export function revealFor(entry, language = 0) {
  if (!entry || !Number.isInteger(language) || language < 0 || language > 2) return null;
  const sourceId = entry.sourceId ?? entry.id;
  const dishId = pairingFood[sourceId] ?? sourceId;
  const parts = dishParts[dishId];
  return parts ? { dishId, pairing: Boolean(pairingFood[sourceId]), parts: parts.map(part => part[language]) } : null;
}
