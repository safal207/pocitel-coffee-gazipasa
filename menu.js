const item = (id, price, names, descriptions = [], image, before) => ({
  id, price, names, descriptions, image, before,
});

export const categories = [
  { id: 'breakfast', labels: ['Kahvaltı', 'Breakfast', 'Завтраки'], items: [
    item('breakfast-plate', 300, ['Kahvaltı Tabağı', 'Breakfast Plate', 'Тарелка на завтрак'], [
      '2 yumurta (sade omlet veya haşlanmış), peynir, zeytin, salata, reçel, ekmek',
      '2 eggs (plain omelet or boiled), cheese, olives, salad, jam, bread',
      '2 яйца (простой омлет или варёные), сыр, оливки, салат, варенье, хлеб'], 'illustrations/branded/breakfast-plate'),
    item('omelet-plate', 320, ['Omlet Tabağı', 'Omelet Plate', 'Тарелка с омлетом'], [
      '2 yumurtalı omlet (mantarlı veya kaşarlı), peynir, zeytin, salata, reçel, ekmek',
      '2-egg omelet (mushroom or kaşar cheese), cheese, olives, salad, jam, bread',
      'Омлет из 2 яиц (с грибами или сыром кашар), сыр, оливки, салат, варенье, хлеб'], 'illustrations/branded/omelet-plate'),
    item('menemen', 330, ['Menemen', 'Menemen', 'Менемен'], [
      '2 yumurta, soğan, biber, domates, ekmek, salata',
      '2 eggs, onion, peppers, tomato, bread, salad',
      '2 яйца, лук, перец, томаты, хлеб, салат'], 'menemen'),
    item('cilbir', 330, ['Çılbır', 'Çılbır', 'Чылбыр'], [
      '2 poşe yumurta, yoğurt, acı biberli zeytinyağı, ekmek',
      '2 poached eggs, yogurt, chili olive oil, bread',
      '2 яйца пашот, йогурт, оливковое масло с чили, хлеб'], 'cilbir-small'),
  ] },
  { id: 'sweet', labels: ['Tatlı & atıştırmalık', 'Sweet & bites', 'Сладкое и закуски'], items: [
    item('pancake', 300, ['Pancake', 'Pancake', 'Панкейки'], [
      '5 pancake, meyve, Nutella', '5 pancakes, fruit, Nutella', '5 панкейков, фрукты, Nutella'], 'pancake'),
    item('sucuk', 300, ['Sucuklu Yumurta', 'Eggs with Sucuk', 'Яйца с суджуком'], [
      '2 yumurta, sucuk, ekmek, salata', '2 eggs, sucuk, bread, salad', '2 яйца, суджук, хлеб, салат'], 'sucuk'),
    item('fries', 150, ['Patates Kızartması', 'French Fries', 'Картофель фри'], [
      'Çıtır patates kızartması', 'Crispy fries', 'Хрустящий картофель фри'], 'fries'),
    item('granola', 300, ['Meyveli Granola Bowl', 'Fruity Granola Bowl', 'Гранола с фруктами'], [
      'Yoğurt, karışık meyve, granola, ceviz', 'Yogurt, mixed fruit, granola, walnut', 'Йогурт, фрукты, гранола, грецкий орех'], 'granola'),
  ] },
  { id: 'focaccia', labels: ['Focaccia', 'Focaccia', 'Фокачча'], items: [
    item('beetroot', 220, ['Pancarlı Focaccia Sandviç', 'Beetroot Focaccia Sandwich', 'Фокачча со свёклой'], [
      'Beyaz peynir, pancar, roka, humus, avokado sosu',
      'White cheese, beetroot, arugula, hummus, avocado sauce',
      'Белый сыр, свёкла, руккола, хумус, соус из авокадо'], 'illustrations/branded/beetroot'),
    item('smoked-turkey', 240, ['Hindi Fümeli Focaccia Sandviç', 'Smoked Turkey Focaccia Sandwich', 'Фокачча с копчёной индейкой'], [
      'Hindi füme, domates, roka, avokado sosu',
      'Smoked turkey, tomato, arugula, avocado sauce',
      'Копчёная индейка, томаты, руккола, соус из авокадо'], 'illustrations/branded/smoked-turkey'),
    item('zucchini', 240, ['Kabaklı Focaccia Sandviç', 'Zucchini Focaccia Sandwich', 'Фокачча с цукини'], [
      'Kırmızı pesto, ricotta peyniri, ızgara kabak, roka',
      'Red pesto, ricotta cheese, grilled zucchini, arugula',
      'Красный песто, рикотта, цукини на гриле, руккола'], 'illustrations/branded/zucchini'),
  ] },
  { id: 'coffee', labels: ['Kahve', 'Coffee', 'Кофе'], items: [
    item('turkish-coffee', 100, ['Türk Kahvesi', 'Turkish Coffee', 'Турецкий кофе'], [], 'illustrations/branded/turkish-coffee'),
    item('espresso', 130, ['Espresso', 'Espresso', 'Эспрессо'], ['30 ml', '30 ml', '30 мл'], 'illustrations/branded/espresso'),
    item('americano', 165, ['Americano', 'Americano', 'Американо'], [], 'illustrations/branded/americano'),
    item('flat-white', 185, ['Flat White', 'Flat White', 'Флэт уайт'], [], 'illustrations/branded/flat-white'),
    item('cappuccino', 185, ['Cappuccino', 'Cappuccino', 'Капучино'], ['180 ml', '180 ml', '180 мл'], 'illustrations/branded/cappuccino'),
    item('latte', 185, ['Caffè Latte', 'Caffè Latte', 'Латте'], ['250 ml', '250 ml', '250 мл'], 'illustrations/branded/latte'),
    item('cortado', 165, ['Cortado', 'Cortado', 'Кортадо'], ['120 ml', '120 ml', '120 мл'], 'illustrations/branded/cortado'),
    item('mocha', 225, ['Dark Mocha', 'Dark Mocha', 'Тёмный мокко'], [], 'illustrations/branded/mocha'),
    item('matcha', 220, ['Matcha', 'Matcha', 'Матча'], [], 'illustrations/branded/matcha'),
  ] },
  { id: 'hot', labels: ['Sıcak içecekler', 'Hot drinks', 'Горячие напитки'], items: [
    item('hot-chocolate', 200, ['Sıcak Çikolata', 'Hot Chocolate', 'Горячий шоколад'], [], 'illustrations/drinks-v2/hot-chocolate'),
    item('chai', 200, ['Chai Tea Latte', 'Chai Tea Latte', 'Чай латте'], [], 'illustrations/drinks-v2/chai'),
    item('salep', 180, ['Salep', 'Salep', 'Салеп'], [], 'illustrations/drinks-v2/salep'),
    item('toffee', 220, ['Toffee Nut Latte', 'Toffee Nut Latte', 'Латте «Ореховая ириска»'], [], 'illustrations/drinks-v2/toffee'),
    item('caramel', 220, ['Caramel Drizzle', 'Caramel Drizzle', 'Карамельный напиток Caramel Drizzle'], [], 'illustrations/drinks-v2/caramel'),
  ] },
  { id: 'cold', labels: ['Soğuk kahveler', 'Iced drinks', 'Холодные напитки'], note: [
    'Soğuk kahvelerimiz çift shot espresso ile hazırlanır.',
    'Our iced coffees are made with a double shot of espresso.',
    'Холодный кофе готовим на двойном эспрессо.',
  ], items: [
    item('iced-americano', 175, ['Buzlu Americano', 'Iced Americano', 'Айс-американо'], [], 'illustrations/branded/iced-americano'),
    item('iced-latte', 195, ['Buzlu Latte', 'Iced Latte', 'Айс-латте'], [], 'illustrations/drinks-v2/iced-latte'),
    item('iced-mocha', 235, ['Buzlu Mocha', 'Iced Mocha', 'Айс-мокко'], [], 'illustrations/branded/iced-mocha'),
    item('frappe', 270, ['Frappé', 'Frappé', 'Фраппе'], [], 'illustrations/branded/frappe'),
    item('iced-matcha', 235, ['Buzlu Matcha', 'Iced Matcha', 'Айс-матча'], [], 'illustrations/branded/iced-matcha'),
  ] },
  { id: 'extras', labels: ['Çay & ekler', 'Tea & extras', 'Чай и добавки'], items: [
    item('tea', 30, ['Çay', 'Turkish Tea', 'Турецкий чай'], [], 'illustrations/branded/tea'),
    item('relax', 130, ['Relax Çayı', 'Relax Tea', 'Чай Relax'], [
      'Lavantalı rooibos çayı', 'Lavender rooibos tea', 'Ройбуш с лавандой'], 'illustrations/branded/relax'),
    item('maroc', 130, ['Maroc Çayı', 'Maroc Tea', 'Чай Maroc'], [
      'Naneli yeşil çay', 'Mint green tea', 'Зелёный чай с мятой'], 'illustrations/branded/maroc'),
    item('balance', 130, ['Balance Çayı', 'Balance Tea', 'Чай Balance'], [
      'Yeşil çay', 'Green tea', 'Зелёный чай'], 'illustrations/branded/balance'),
    item('syrup', 30, ['Kahve Şurubu', 'Coffee Syrup', 'Сироп для кофе'], [
      'Vanilya, karamel, fındık, hindistan cevizi', 'Vanilla, caramel, hazelnut, coconut', 'Ваниль, карамель, фундук, кокос'], 'illustrations/branded/syrup'),
    item('plant-milk', 50, ['Bitkisel Süt', 'Plant-based Milk', 'Растительное молоко'], [
      'Badem veya yulaf', 'Almond or oat', 'Миндальное или овсяное'], 'illustrations/branded/plant-milk'),
    item('tomato-cucumber', 40, ['Domates & Salatalık', 'Tomato & Cucumber', 'Помидоры и огурцы'], [], 'illustrations/branded/tomato-cucumber'),
    item('olives', 30, ['Zeytin', 'Olives', 'Оливки'], [], 'illustrations/branded/olives'),
    item('cheese', 60, ['Dilim Peynir', 'Sliced Cheese', 'Ломтики сыра'], [], 'illustrations/branded/cheese'),
    item('egg', 30, ['Ekstra Yumurta', 'Extra Egg', 'Дополнительное яйцо'], [], 'illustrations/branded/egg'),
    item('nutella', 50, ['Nutella', 'Nutella', 'Nutella'], [], 'illustrations/branded/nutella'),
    item('chocolate-sauce', 70, ['Belçika Çikolata Sosu', 'Belgian Chocolate Sauce', 'Соус из бельгийского шоколада'], [], 'illustrations/branded/chocolate-sauce'),
  ] },
  { id: 'combos', labels: ['Eşleşmeler', 'Pairings', 'Комбо'], items: [
    item('turkish-classic', 345, ['Türk Klasiği', 'Turkish Classic', 'Турецкая классика'], [
      'Çılbır + Türk çayı', 'Çılbır + Turkish tea', 'Чылбыр + турецкий чай'], 'turkish-classic', 360),
    item('sweet-morning', 460, ['Tatlı Sabah', 'Sweet Morning', 'Сладкое утро'], [
      'Pancake + Cappuccino', 'Pancakes + cappuccino', 'Панкейки + капучино'], 'sweet-morning', 485),
    item('fresh-energy', 510, ['Taze Enerji', 'Fresh Energy', 'Бодрое утро'], [
      'Meyveli Granola Bowl + Buzlu Matcha', 'Fruity granola bowl + iced matcha', 'Гранола с фруктами + айс-матча'], 'fresh-energy', 535),
    item('lunch-favourite', 395, ['Öğle Favorisi', 'Lunch Favourite', 'Любимый обед'], [
      'Hindi Fümeli Focaccia Sandviç + Buzlu Americano', 'Smoked turkey focaccia sandwich + iced americano', 'Фокачча с копчёной индейкой + айс-американо'], 'lunch-favourite', 415),
  ] },
];
