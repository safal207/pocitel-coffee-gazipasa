// Editorial estimates, NOT café recipe specifications or laboratory results.
// Amounts are explicit assumed edible portions. Reference brands are examples,
// not a claim about suppliers used by Poçitel. See docs/nutrition-2026-11-04.md.
const L = (tr, en, ru) => [tr, en, ru];
const ref = (labels, kcal, unit = 'g') => ({ labels, kcal: Array.isArray(kcal) ? kcal : [kcal, kcal], unit });
export const ingredients = {
  egg: ref(L('Yumurta', 'Egg', 'Яйцо'), [148, 156]),
  bread: ref(L('Ekmek', 'Bread', 'Хлеб'), [266, 286]),
  cheese: ref(L('Peynir', 'Cheese', 'Сыр'), [264, 404]),
  yogurt: ref(L('Sade yoğurt', 'Plain yogurt', 'Натуральный йогурт'), [63, 72]),
  milk: ref(L('İnek sütü', 'Dairy milk', 'Коровье молоко'), [43, 62], 'ml'),
  oil: ref(L('Pişirme yağı', 'Cooking oil', 'Масло для приготовления'), 864),
  olives: ref(L('Zeytin', 'Olives', 'Оливки'), [81, 144]),
  salad: ref(L('Salata sebzeleri', 'Salad vegetables', 'Салатные овощи'), [11, 25]),
  jam: ref(L('Reçel', 'Jam', 'Варенье'), 280),
  filling: ref(L('Mantar veya kaşar', 'Mushroom or cheese filling', 'Грибы или сыр в омлете'), [22, 404]),
  onion: ref(L('Soğan', 'Onion', 'Лук'), 42),
  pepper: ref(L('Biber', 'Pepper', 'Перец'), [20, 27]),
  tomato: ref(L('Domates', 'Tomato', 'Томаты'), 18),
  pancake: ref(L('Sade pancake', 'Plain pancakes', 'Панкейки без топпинга'), [226, 230]),
  fruit: ref(L('Karışık meyve', 'Mixed fruit', 'Фрукты'), [32, 89]),
  nutella: ref(L('Nutella', 'Nutella', 'Nutella'), 539),
  sucuk: ref(L('Sucuk', 'Sucuk', 'Суджук'), [377, 430]),
  fries: ref(L('Kızarmış patates', 'Fried potatoes', 'Картофель фри'), 311),
  granola: ref(L('Granola', 'Granola', 'Гранола'), [383, 415]),
  walnut: ref(L('Ceviz', 'Walnut', 'Грецкий орех'), 664),
  beet: ref(L('Pancar', 'Beetroot', 'Свёкла'), 44),
  greens: ref(L('Roka / yeşillik', 'Arugula / greens', 'Руккола / зелень'), [15, 22]),
  hummus: ref(L('Humus', 'Hummus', 'Хумус'), 165),
  avocado: ref(L('Avokado sosu', 'Avocado sauce', 'Соус из авокадо'), [159, 250]),
  turkey: ref(L('Hindi füme', 'Smoked turkey', 'Копчёная индейка'), [120, 190]),
  pesto: ref(L('Kırmızı pesto', 'Red pesto', 'Красный песто'), [250, 500]),
  ricotta: ref(L('Ricotta', 'Ricotta', 'Рикотта'), [138, 180]),
  zucchini: ref(L('Kabak', 'Zucchini', 'Цукини'), 16),
  coffee: ref(L('Hazırlanmış kahve', 'Prepared coffee', 'Готовый кофе'), [1, 2], 'ml'),
  espresso: ref(L('Espresso / yoğun kahve', 'Espresso / concentrated coffee', 'Эспрессо / концентрированный кофе'), [3, 10], 'ml'),
  tea: ref(L('Demlenmiş çay', 'Brewed tea', 'Заваренный чай'), [0, 2], 'ml'),
  chocolate: ref(L('Çikolata sosu', 'Chocolate sauce', 'Шоколадный соус'), [288, 400]),
  hotChocolate: ref(L('Sütlü sıcak çikolata', 'Milk hot chocolate', 'Горячий шоколад на молоке'), [81, 102], 'ml'),
  cream: ref(L('Krema / üst süsleme', 'Cream / topping', 'Сливки / топпинг'), [200, 350]),
  sugar: ref(L('Şeker', 'Sugar', 'Сахар'), 400),
  syrup: ref(L('Şekerli şurup', 'Sweetened syrup', 'Сахарный сироп'), [300, 370], 'ml'),
  matcha: ref(L('Matcha tozu', 'Matcha powder', 'Порошок матча'), [200, 350]),
  salepMix: ref(L('Salep / şekerli karışım', 'Salep / sweetened mix', 'Салеп / сладкая смесь'), [350, 400]),
  plantMilk: ref(L('Badem veya yulaf içeceği', 'Almond or oat drink', 'Миндальный или овсяный напиток'), [13, 61], 'ml'),
  iceCream: ref(L('Dondurma / frappé bazı', 'Ice cream / frappé base', 'Мороженое / основа фраппе'), [150, 250]),
};

// These profiles describe ingredients, not measured amounts in the served dish.
export const vitaminProfiles = {
  eggs: L('B2, B12 — yumurtadan.', 'B2, B12 — from eggs.', 'B2, B12 — из яиц.'),
  dairy: L('B2, B12 — süt ürünlerinden.', 'B2, B12 — from dairy ingredients.', 'B2, B12 — из молочных продуктов.'),
  pepper: L('C — biberden; pişirme miktarı azaltabilir.', 'C — from peppers; cooking can reduce the amount.', 'C — из перца; приготовление может уменьшить содержание.'),
  fruit: L('C ve B6 — meyve seçimine göre (ör. çilek ve muz).', 'C and B6 — depending on the fruit (e.g. strawberries and banana).', 'C и B6 — в зависимости от фруктов, например клубники и банана.'),
  greens: L('B9 (folat) — yeşillikten.', 'B9 (folate) — from leafy greens.', 'B9 (фолат) — из зелени.'),
  oil: L('E — bitkisel yağlardan; miktar kullanılan yağa bağlı.', 'E — from plant oils; amount depends on the oil.', 'E — из растительных масел; количество зависит от масла.'),
  olives: L('E — zeytinden; miktar çeşide bağlı.', 'E — from olives; amount varies by variety.', 'E — из оливок; количество зависит от сорта.'),
  nuts: L('B1 ve E — kuruyemişlere göre değişir.', 'B1 and E — vary with the nuts used.', 'B1 и E — содержание зависит от орехов.'),
  turkey: L('B6, B12 — hindiden.', 'B6, B12 — from turkey.', 'B6, B12 — из индейки.'),
  meat: L('B12 — et ve yumurtadan.', 'B12 — from meat and eggs.', 'B12 — из мяса и яиц.'),
  potato: L('C — patateste bulunur; kızartma ve saklama miktarı değiştirir.', 'C occurs in potatoes; frying and storage change the amount.', 'В картофеле есть C; жарка и хранение меняют его количество.'),
  vegetable: L('C — domatesten; porsiyon ve tazeliğe bağlı.', 'C — from tomatoes; depends on portion and freshness.', 'C — из томатов; количество зависит от порции и свежести.'),
  plant: L('B2, B12 ve D yalnızca içecek bunlarla zenginleştirilmişse; etiketi kontrol edin.', 'B2, B12 and D only if the drink is fortified with them; check its label.', 'B2, B12 и D — только если напиток ими обогащён; нужно проверить упаковку.'),
  none: L('Bu porsiyonda anlamlı bir vitamin katkısı varsayılmıyor.', 'No meaningful vitamin contribution is assumed for this serving.', 'Для этой порции не предполагается значимый вклад в поступление витаминов.'),
};

export const benefitProfiles = {
  breakfast: L('Yumurta ve peynir protein, ekmek karbonhidrat sağlar.', 'Eggs and cheese provide protein; bread provides carbohydrates.', 'Яйца и сыр дают белок, хлеб — углеводы.'),
  eggs: L('Yumurta protein, sebzeler bir miktar lif sağlar.', 'Eggs provide protein; vegetables add some fibre.', 'Яйца дают белок, овощи — немного клетчатки.'),
  cilbir: L('Yumurta ve yoğurt protein; yoğurt ayrıca kalsiyum sağlar.', 'Eggs and yogurt provide protein; yogurt also provides calcium.', 'Яйца и йогурт дают белок; йогурт также содержит кальций.'),
  sweet: L('Karbonhidrat ve yağdan enerji sağlar; tatlı sos ilave şeker içerir.', 'Provides energy from carbohydrates and fats; the sweet topping contains added sugar.', 'Даёт энергию из углеводов и жиров; сладкий соус содержит добавленный сахар.'),
  sucuk: L('Yumurta ve sucuk protein sağlar; sucuk tuz ve doymuş yağ da içerir.', 'Eggs and sucuk provide protein; sucuk also adds salt and saturated fat.', 'Яйца и суджук дают белок; суджук также добавляет соль и насыщенные жиры.'),
  fries: L('Patates karbonhidrat sağlar; kızartma yağı enerji miktarını artırır.', 'Potatoes provide carbohydrates; frying oil increases the energy content.', 'Картофель даёт углеводы; масло при жарке повышает калорийность.'),
  granola: L('Yoğurt protein ve kalsiyum; meyve, granola ve ceviz lif sağlar.', 'Yogurt provides protein and calcium; fruit, granola and walnuts add fibre.', 'Йогурт даёт белок и кальций, фрукты, гранола и орехи — клетчатку.'),
  veggieSandwich: L('Peynir protein; sebzeler ve humus varsa lif sağlar. Ekmek enerji kaynağıdır.', 'Cheese provides protein; vegetables and hummus, where present, add fibre. Bread provides energy.', 'Сыр даёт белок, овощи и хумус, если он есть в составе, — клетчатку. Хлеб даёт энергию.'),
  turkey: L('Hindi protein, ekmek karbonhidrat sağlar; füme et tuz içerir.', 'Turkey provides protein and bread carbohydrates; smoked meat contains salt.', 'Индейка даёт белок, хлеб — углеводы; копчёное мясо содержит соль.'),
  coffee: L('Şekersiz ve sütsüz hali çok az enerji içerir. Kafein içerir.', 'Very little energy without sugar or milk. Contains caffeine.', 'Без сахара и молока содержит мало калорий. Есть кофеин.'),
  milk: L('İnek sütü protein ve kalsiyum sağlar. Kahve veya matcha kafein içerir.', 'Dairy milk provides protein and calcium. Coffee or matcha contains caffeine.', 'Коровье молоко даёт белок и кальций. Кофе или матча содержат кофеин.'),
  sweetMilk: L('Süt protein ve kalsiyum sağlar; sos veya şurup ilave şeker ekler.', 'Milk provides protein and calcium; sauce or syrup adds sugar.', 'Молоко даёт белок и кальций; соус или сироп добавляет сахар.'),
  tea: L('Şekersiz hali çok az enerji içerir. Siyah ve yeşil çay kafein içerir.', 'Very little energy without sugar. Black and green tea contain caffeine.', 'Без сахара содержит мало калорий. Чёрный и зелёный чай содержат кофеин.'),
  rooibos: L('Sade rooibos-lavanta demlemesi doğal olarak kafeinsizdir; şeker eklenmezse enerji düşüktür.', 'A plain rooibos-lavender infusion is naturally caffeine-free and low in energy without sugar.', 'Настой ройбуша с лавандой естественно не содержит кофеина и без сахара малокалориен.'),
  sugar: L('Tat ve enerji ekler; önemli bir protein veya vitamin kaynağı sayılmaz.', 'Adds flavour and energy; not considered a substantial protein or vitamin source.', 'Добавляет вкус и энергию; не считается существенным источником белка или витаминов.'),
  plant: L('Süt yerine bir seçenek. Protein, şeker ve kalsiyum miktarı markaya göre değişir.', 'An alternative to dairy milk. Protein, sugar and calcium vary by brand.', 'Альтернатива коровьему молоку. Белок, сахар и кальций зависят от марки.'),
  veg: L('Su ve bir miktar lif sağlar; sos hariç enerji miktarı düşüktür.', 'Provides water and some fibre; low in energy before dressing.', 'Содержит воду и немного клетчатки; без заправки калорийность невысокая.'),
  olives: L('Doymamış yağ içerir; salamura zeytin tuz da içerir.', 'Contains unsaturated fats; brined olives also contain salt.', 'Содержат ненасыщенные жиры; оливки в рассоле также содержат соль.'),
  cheese: L('Protein ve kalsiyum sağlar; tuz ve yağ miktarı peynir türüne bağlıdır.', 'Provides protein and calcium; salt and fat depend on the cheese.', 'Даёт белок и кальций; количество соли и жира зависит от вида сыра.'),
  egg: L('Yumurta protein sağlar; pişirme yağı enerji miktarını artırır.', 'Eggs provide protein; cooking fat increases the energy content.', 'Яйцо даёт белок; масло при приготовлении увеличивает калорийность.'),
};

const food = (recipe, portion, vitamins, benefit, ingredientsText = null, basis = 'menu') => ({ recipe, portion, vitamins, benefit, ingredients: ingredientsText, basis });
const cup = (ml) => L(`Örnek porsiyon: ${ml} ml`, `Assumed serving: ${ml} ml`, `Примерная порция: ${ml} мл`);
const plate = L('1 tabak; aşağıdaki örnek miktarlar', '1 plate; assumed amounts below', '1 тарелка; примерные количества ниже');
const sandwich = L('1 sandviç; 120–150 g ekmek', '1 sandwich; 120–150 g bread', '1 сэндвич; 120–150 г хлеба');
const milkCoffee = L('Espresso, inek sütü, süt köpüğü. Ek şeker hariç.', 'Espresso, dairy milk, milk foam. No extra sugar included.', 'Эспрессо, коровье молоко, молочная пена. Без добавочного сахара.');
const blackCoffee = L('Kahve ve su. Şeker ve süt hariç.', 'Coffee and water. Sugar and milk excluded.', 'Кофе и вода. Без сахара и молока.');
const matchaMilk = L('Tahmini tarif: matcha tozu, su, inek sütü. Kullanılan sütü ve tatlandırmayı ekibe sorun.', 'Assumed recipe: matcha powder, water and dairy milk. Ask the team which milk and sweetener are used.', 'Предполагаемый рецепт: порошок матча, вода, коровье молоко. Вид молока и подсластитель уточните у команды.');
const chocMilk = L('Tahmini tarif: espresso, inek sütü, çikolata sosu; üst süsleme değişebilir.', 'Assumed recipe: espresso, dairy milk and chocolate sauce; topping may vary.', 'Предполагаемый рецепт: эспрессо, коровье молоко, шоколадный соус; топпинг может отличаться.');
const blackTea = L('Çay ve su; şeker hariç.', 'Tea and water; no sugar included.', 'Чай и вода; без сахара.');
const nutellaText = L('Şeker, palm yağı, fındık, yağsız süt tozu, kakao, soya lesitini, vanilin (üretici etiketi).', 'Sugar, palm oil, hazelnuts, skimmed milk powder, cocoa, soya lecithin, vanillin (manufacturer label).', 'Сахар, пальмовое масло, фундук, сухое обезжиренное молоко, какао, соевый лецитин, ванилин — по этикетке производителя.');

export const nutritionData = {
  'breakfast-plate': food([['egg',100,110],['cheese',30,40],['bread',60,90],['olives',20,30],['salad',80,120],['jam',15,25],['oil',0,10]], plate, ['eggs','dairy'], 'breakfast'),
  'omelet-plate': food([['egg',100,110],['filling',30,40],['cheese',25,35],['bread',60,80],['olives',20,30],['salad',80,120],['jam',15,20],['oil',5,10]], plate, ['eggs','dairy'], 'breakfast'),
  menemen: food([['egg',100,110],['onion',40,60],['pepper',50,70],['tomato',100,150],['oil',10,20],['bread',60,80],['salad',50,80]], plate, ['eggs','pepper'], 'eggs'),
  cilbir: food([['egg',100,110],['yogurt',120,180],['oil',10,20],['bread',60,80]], plate, ['eggs','dairy','oil'], 'cilbir'),
  pancake: food([['pancake',150,200],['fruit',80,120],['nutella',25,45]], L('5 pancake + meyve + Nutella','5 pancakes + fruit + Nutella','5 панкейков + фрукты + Nutella'), ['fruit'], 'sweet'),
  sucuk: food([['egg',100,110],['sucuk',40,60],['bread',60,80],['salad',80,120],['oil',0,10]], plate, ['eggs','meat'], 'sucuk'),
  fries: food([['fries',120,180]], L('120–180 g; sos hariç','120–180 g; dipping sauce excluded','120–180 г; без соуса'), ['potato','oil'], 'fries', L('Patates, kızartma yağı, tuz. Yağ ve baharatı ekibe sorun.','Potatoes, frying oil and salt. Ask the team about the oil and seasoning.','Картофель, масло для жарки, соль. Вид масла и приправы уточните у команды.'), 'typical'),
  granola: food([['yogurt',170,220],['fruit',100,150],['granola',40,60],['walnut',10,15]], L('1 bowl; yaklaşık 320–445 g','1 bowl; approximately 320–445 g','1 боул; примерно 320–445 г'), ['dairy','fruit','nuts'], 'granola'),
  beetroot: food([['bread',120,150],['oil',5,10],['cheese',30,40],['beet',40,70],['greens',10,20],['hummus',20,30],['avocado',20,30]], sandwich, ['dairy','greens'], 'veggieSandwich'),
  'smoked-turkey': food([['bread',120,150],['oil',5,10],['turkey',50,70],['tomato',40,60],['greens',10,20],['avocado',20,30]], sandwich, ['turkey','greens'], 'turkey'),
  zucchini: food([['bread',120,150],['oil',5,10],['pesto',20,30],['ricotta',30,50],['zucchini',50,80],['greens',10,20]], sandwich, ['dairy','greens'], 'veggieSandwich'),
  'turkish-coffee': food([['espresso',60,70]], cup('60–70'), ['none'], 'coffee', blackCoffee, 'typical'),
  espresso: food([['espresso',30,30]], cup(30), ['none'], 'coffee', blackCoffee, 'typical'),
  americano: food([['coffee',180,250]], cup('180–250'), ['none'], 'coffee', blackCoffee, 'typical'),
  'flat-white': food([['espresso',30,60],['milk',130,180]], cup('180–240'), ['dairy'], 'milk', milkCoffee, 'typical'),
  cappuccino: food([['espresso',30,30],['milk',100,140]], cup(180), ['dairy'], 'milk', milkCoffee, 'typical'),
  latte: food([['espresso',30,60],['milk',180,220]], cup(250), ['dairy'], 'milk', milkCoffee, 'typical'),
  cortado: food([['espresso',30,60],['milk',60,90]], cup(120), ['dairy'], 'milk', milkCoffee, 'typical'),
  mocha: food([['espresso',30,60],['milk',160,200],['chocolate',20,35],['cream',0,15]], cup(250), ['dairy'], 'sweetMilk', chocMilk, 'typical'),
  matcha: food([['matcha',2,3],['milk',180,220],['sugar',0,15]], cup(250), ['dairy'], 'milk', matchaMilk, 'typical'),
  'hot-chocolate': food([['hotChocolate',220,250],['cream',0,20]], cup(250), ['dairy'], 'sweetMilk', L('Tahmini tarif: süt, kakao veya çikolata karışımı, şeker; krema olabilir.','Assumed recipe: milk, cocoa or chocolate mix, sugar; may include cream.','Предполагаемый рецепт: молоко, какао или шоколадная смесь, сахар; возможны сливки.'), 'typical'),
  chai: food([['milk',160,220],['tea',30,50],['sugar',10,25]], cup(250), ['dairy'], 'sweetMilk', L('Tahmini tarif: süt, siyah çay, baharat ve şeker veya chai konsantresi.','Assumed recipe: milk, black tea, spices and sugar or chai concentrate.','Предполагаемый рецепт: молоко, чёрный чай, специи и сахар либо концентрат chai.'), 'typical'),
  salep: food([['milk',180,220],['salepMix',15,30]], cup(250), ['dairy'], 'sweetMilk', L('Tahmini tarif: süt, salep veya nişastalı salep karışımı, şeker, tarçın.','Assumed recipe: milk, salep or starch-based salep mix, sugar, cinnamon.','Предполагаемый рецепт: молоко, салеп или смесь с крахмалом, сахар, корица.'), 'typical'),
  toffee: food([['espresso',30,60],['milk',160,200],['syrup',15,25],['cream',0,20]], cup(250), ['dairy'], 'sweetMilk', L('Tahmini tarif: espresso, süt, toffee-fındık aromalı şurup; üst süsleme değişir. Gerçek fındık içeriğini ekibe sorun.','Assumed recipe: espresso, milk, toffee-nut flavoured syrup; topping varies. Ask whether it contains actual nuts.','Предполагаемый рецепт: эспрессо, молоко, сироп со вкусом ореховой ириски; топпинг может отличаться. Наличие орехов уточните.'), 'typical'),
  caramel: food([['espresso',30,60],['milk',160,200],['syrup',15,30],['cream',0,15]], cup(250), ['dairy'], 'sweetMilk', L('Tahmini tarif: espresso, süt, karamel şurubu veya sosu; tarifi ekibe sorun.','Assumed recipe: espresso, milk, caramel syrup or sauce; confirm the recipe with the team.','Предполагаемый рецепт: эспрессо, молоко, карамельный сироп или соус; рецепт уточните у команды.'), 'typical'),
  'iced-americano': food([['coffee',180,220]], L('Örnek porsiyon: buz dahil 300 ml', 'Assumed serving: 300 ml including ice', 'Примерная порция: 300 мл со льдом'), ['none'], 'coffee', L('Çift espresso, su ve buz; şeker hariç.','Double espresso, water and ice; sugar excluded.','Двойной эспрессо, вода и лёд; без сахара.'), 'typical'),
  'iced-latte': food([['espresso',60,60],['milk',140,200]], cup(300), ['dairy'], 'milk', L('Çift espresso, süt ve buz; ek şeker hariç.','Double espresso, milk and ice; no extra sugar included.','Двойной эспрессо, молоко и лёд; без добавочного сахара.'), 'typical'),
  'iced-mocha': food([['espresso',60,60],['milk',140,180],['chocolate',20,35],['cream',0,15]], cup(300), ['dairy'], 'sweetMilk', L('Tahmini tarif: çift espresso, süt, çikolata sosu ve buz; üst süsleme değişir.','Assumed recipe: double espresso, milk, chocolate sauce and ice; topping varies.','Предполагаемый рецепт: двойной эспрессо, молоко, шоколадный соус, лёд; топпинг может отличаться.'), 'typical'),
  frappe: food([['espresso',60,60],['milk',100,160],['iceCream',50,80],['sugar',10,20],['cream',0,20]], cup(300), ['dairy'], 'sweetMilk', L('Tahmini sütlü tarif: kahve, süt, buz, şeker ve dondurma veya frappé bazı; krema olabilir. Kesin tarif bilinmiyor.','Assumed milk-based version: coffee, milk, ice, sugar and ice cream or frappé base; possibly cream. Exact recipe is unknown.','Предполагаемый молочный вариант: кофе, молоко, лёд, сахар и мороженое либо основа фраппе; возможны сливки. Точный рецепт неизвестен.'), 'typical'),
  'iced-matcha': food([['matcha',2,3],['milk',160,220],['sugar',0,20]], cup(300), ['dairy'], 'milk', L('Tahmini tarif: matcha, süt, su ve buz; tatlandırma değişebilir.','Assumed recipe: matcha, milk, water and ice; sweetening may vary.','Предполагаемый рецепт: матча, молоко, вода и лёд; подсластитель может отличаться.'), 'typical'),
  tea: food([['tea',100,150]], cup('100–150'), ['none'], 'tea', blackTea, 'typical'),
  relax: food([['tea',200,250]], cup('200–250'), ['none'], 'rooibos'),
  maroc: food([['tea',200,250]], cup('200–250'), ['none'], 'tea'),
  balance: food([['tea',200,250]], cup('200–250'), ['none'], 'tea'),
  syrup: food([['syrup',15,20]], cup('15–20'), ['none'], 'sugar', L('Şekerli aromalı şurup; vanilya, karamel, fındık veya hindistan cevizi seçimi. Tam içerik markaya bağlı.','Sweetened flavoured syrup: vanilla, caramel, hazelnut or coconut. Full ingredients depend on the brand.','Сладкий ароматизированный сироп: ваниль, карамель, фундук или кокос. Полный состав зависит от марки.'), 'typical'),
  'plant-milk': food([['plantMilk',100,100]], cup(100), ['plant'], 'plant', L('Badem veya yulaf bazlı içecek. Su, bitkisel ham madde ve markaya göre yağ, şeker, vitaminler içerebilir.','Almond- or oat-based drink. Water, plant ingredients and, depending on the brand, oil, sugar and added vitamins.','Напиток на основе миндаля или овса: вода, растительная основа; масло, сахар и добавленные витамины зависят от марки.'), 'typical'),
  'tomato-cucumber': food([['salad',100,150]], L('100–150 g; sos hariç','100–150 g; dressing excluded','100–150 г; без заправки'), ['vegetable'], 'veg', L('Domates ve salatalık.','Tomato and cucumber.','Томаты и огурцы.')),
  olives: food([['olives',25,40]], L('25–40 g, çekirdeksiz ağırlık','25–40 g edible portion','25–40 г без косточек'), ['olives'], 'olives', L('Zeytin; salamura ve baharat değişebilir.','Olives; brine and seasoning may vary.','Оливки; рассол и приправы могут отличаться.')),
  cheese: food([['cheese',30,40]], L('30–40 g','30–40 g','30–40 г'), ['dairy'], 'cheese', L('Dilim peynir; türü ekibe sorun.','Sliced cheese; ask the team which type.','Ломтики сыра; вид уточните у команды.')),
  egg: food([['egg',50,55],['oil',0,5]], L('1 yumurta','1 egg','1 яйцо'), ['eggs'], 'egg', L('1 yumurta; pişirme yöntemi ve yağ değişebilir.','1 egg; cooking method and fat may vary.','1 яйцо; способ приготовления и масло могут отличаться.')),
  nutella: food([['nutella',15,25]], L('15–25 g','15–25 g','15–25 г'), ['none'], 'sweet', nutellaText, 'label'),
  'chocolate-sauce': food([['chocolate',15,25]], L('15–25 g','15–25 g','15–25 г'), ['none'], 'sugar', L('Tahmini içerik: kakao / çikolata, şeker ve su; süt veya krema olabilir. Marka ve tarif bilinmiyor.','Assumed ingredients: cocoa / chocolate, sugar and water; may include milk or cream. Brand and recipe are unknown.','Предполагаемый состав: какао / шоколад, сахар и вода; возможны молоко или сливки. Марка и рецепт неизвестны.'), 'typical'),
};

export const comboParts = {
  'turkish-classic': ['cilbir', 'tea'],
  'sweet-morning': ['pancake', 'cappuccino'],
  'fresh-energy': ['granola', 'iced-matcha'],
  'lunch-favourite': ['smoked-turkey', 'iced-americano'],
};
