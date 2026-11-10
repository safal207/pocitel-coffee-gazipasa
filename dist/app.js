import { categories } from './menu.js?v=20261104-drinks';
import { items, categoryByItem, categoryById, combos, feedOrder, takeawaySuggestions, takeawayItems } from './catalog.js?v=20261105-focaccia';
import { shareUrl } from './share-links.js?v=20261104-share';
import { socialShareTargets } from './social-share.js?v=20261110-fast-share';
import { milkOptions, syrupOptions, customization, configurationId, resolveOrderItem, optionLabels, replaceOrderLine, comboFoodIds, comboDrinkIds, builtComboId, comboChoice, isTakeaway } from './order-options.js?v=20261106-builder';
import { selectionSignature, checkoutSavings, recommendCheckout, applyCheckoutOffer, undoCheckoutOffer } from './checkout-offers.js?v=20261106-builder';
import { energyRanges } from './nutrition-summary.js?v=20261105-focaccia';
import { focacciaTakeawayOffer, selectedComboOffer } from './focaccia-offer.js?v=20261106-builder';
import { moments, restoreFavoriteCombos, nextComboChoice } from './discovery.js?v=20261107-moments';
import { revealFor } from './ingredient-reveal.js?v=20261110-complete-food';
import { cutawayOverlayMarkup } from './cutaway-overlay.js?v=20261110-visibility-qa';
import { restoreEngagement, toggleLike, recordView, serializeEngagement } from './engagement.js?v=20261110-social';

const copy = {
  skip: ['Menüye geç', 'Skip to menu', 'Перейти к меню'],
  navigation: ['Gezinme', 'Navigation', 'Навигация'],
  navPair: ['Eşleşmeler', 'Pairings', 'Комбо'],
  navMenu: ['Menü', 'Menu', 'Меню'],
  navVisit: ['Ziyaret', 'Visit', 'Как добраться'],
  language: ['Dil', 'Language', 'Язык'],
  like: ['Beğen', 'Like', 'Нравится'],
  likedFeedback: ['Beğendin', 'Liked', 'Понравилось'],
  unlikedFeedback: ['Beğeni kaldırıldı', 'Like removed', 'Лайк убран'],
  savedFeedback: ['Kaydedildi', 'Saved', 'Сохранено'],
  unsavedFeedback: ['Kaydedilenlerden kaldırıldı', 'Removed from saved', 'Убрано из сохранённого'],
  views: ['Görüntülenme', 'Views', 'Просмотры'],
  socialActions: ['Ürün etkileşimleri', 'Dish interactions', 'Действия с блюдом'],
  engagementLocal: ['Beğeniler ve görüntülenmeler yalnızca bu cihazda saklanır.', 'Likes and views are saved on this device only.', 'Лайки и просмотры сохраняются только на этом устройстве.'],
  appearance: ['Görünüm', 'Appearance', 'Оформление'],
  appearanceMood: ['Görünüm', 'Appearance', 'Оформление'],
  settings: ['Dil ve görünüm', 'Language & appearance', 'Язык и оформление'],
  done: ['Tamam', 'Done', 'Готово'],
  added: ['Siparişe eklendi', 'Added to your order', 'Добавлено в заказ'],
  comboFood: ['Focaccia seç', 'Choose your focaccia', 'Выберите фокаччу'],
  comboDrinkSelect: ['İçecek seç', 'Choose your drink', 'Выберите напиток'],
  comboOptions: ['Servis ve eklemeler', 'Serving & extras', 'Подача и дополнения'],
  comboSave: ['Eşleşmeyi kaydet', 'Save pairing', 'Сохранить комбо'],
  comboAdd: ['Eşleşmeyi ekle', 'Add pairing', 'Добавить комбо'],
  comboJoin: ['Eşleşme oluştur', 'Combine items', 'Собрать комбо'],
  comboMenuSum: ['Seçtiğin iki ürünün menü fiyatları', 'Menu prices of your two choices', 'Сумма выбранных позиций по меню'],
  comboFrom: ['Başlangıç', 'From', 'От'],
  comboOne: ['Bir eşleşme', 'Per pairing', 'За одно комбо'],
  comboEditQuantity: ['Siparişteki adet', 'Quantity in your order', 'Количество в заказе'],
  momentsTitle: ['Nasıl bir mola istersin?', 'What kind of break?', 'Чего хочется сейчас?'],
  momentsHint: ['Sana uygun bir seçki seç', 'Choose a collection for the moment', 'Выберите подборку по настроению'],
  savedCombosTitle: ['Favori eşleşmelerin', 'Your favourite pairings', 'Любимые комбо'],
  savedCombosHint: ['Bu tarayıcıda saklanır', 'Saved in this browser', 'Сохранены в этом браузере'],
  saveComboFavorite: ['Favorilere kaydet', 'Save pairing', 'В избранное'],
  savedComboFavorite: ['Favorilerde', 'Saved', 'Сохранено'],
  removeComboFavorite: ['Favorilerden çıkar', 'Remove favourite', 'Убрать из избранного'],
  openComboFavorite: ['Eşleşmeyi aç', 'Open pairing', 'Открыть комбо'],
  comboSavedNotice: ['Eşleşme favorilerine kaydedildi.', 'Pairing saved to your favourites.', 'Комбо сохранено в избранном.'],
  comboRemovedNotice: ['Eşleşme favorilerden çıkarıldı.', 'Pairing removed from your favourites.', 'Комбо убрано из избранного.'],
  comboSessionNotice: ['Yalnızca bu oturum için kaydedildi.', 'Saved for this session only.', 'Сохранено только на время этой сессии.'],
  anotherCombo: ['Başka bir eşleşme', 'Another pairing', 'Другое сочетание'],
  comboBudget: ['Öneri bütçesi', 'Budget for suggestions', 'Бюджет для подбора'],
  comboAnyBudget: ['Sınır yok', 'No limit', 'Без ограничения'],
  comboUpTo: ['En fazla', 'Up to', 'До'],
  comboNoAlternative: ['Bu bütçe ve seçeneklerle başka eşleşme yok. Bütçeyi veya seçenekleri değiştirin.', 'No other pairing fits these options and budget. Change the budget or options.', 'Других сочетаний с такими настройками и бюджетом нет. Измените бюджет или дополнения.'],
  lookInside: ['İçine bak', 'Look inside', 'Заглянуть внутрь'],
  cutawayHeading: ['İçindekileri keşfet', 'Discover what is inside', 'Посмотрите, что внутри'],
  insideLabel: ['İçinde', 'Inside', 'Внутри'],
  moreIngredients: ['daha', 'more', 'ещё'],
  cutawayHelp: ['İçini görmek için kaydırıcıyı sürükleyin', 'Drag the slider to reveal the ingredients', 'Передвиньте ползунок, чтобы увидеть состав'],
  cutawayHelpShort: ['Kaydır, içini gör', 'Swipe to reveal', 'Проведи, чтобы раскрыть'],
  cutawayAllIngredients: ['Tüm malzemeler', 'All ingredients', 'Весь состав'],
  cutawaySource: ['Menüde belirtilenler', 'As listed on the menu', 'Состав по меню'],
  cutawayRange: ['Yemeğin içindekilerini göster', 'Reveal the dish ingredients', 'Показать состав блюда'],
  cutawayShown: ['Görünen iç kısım', 'Inside shown', 'Состав открыт на'],
  cutawayCombo: ['Eşleşmedeki yemek', 'Dish in the pairing', 'Блюдо в комбо'],
  cutawayShow: ['Tam aç', 'Reveal fully', 'Раскрыть целиком'],
  cutawayHide: ['Fotoğrafı göster', 'Show photo', 'Вернуть фото'],
  focacciaKicker: ['Molanı yanında götür', 'Take your break with you', 'Возьмите паузу с собой'],
  focacciaTitle: ['Kendi eşleşmeni oluştur', 'Build your perfect pairing', 'Соберите своё комбо'],
  focacciaBody: ['Hindi fümeli, sebzeli focaccia. Yanına buzlu Americano. Güzel bir mola, nereye gidersen.', 'Golden focaccia with smoked turkey and vegetables, paired with an iced Americano. A lovely break, wherever you go.', 'Румяная фокачча с индейкой и овощами. А к ней — айс-американо. Всё для вкусной паузы на прогулке.'],
  focacciaBanner: ['Focaccia + sevdiğin içecek', 'Focaccia + your favourite drink', 'Фокачча + любимый напиток'],
  focacciaAction: ['Al götür istiyorum', 'I’ll take it to go', 'Хочу с собой'],
  focacciaUpgrade: ['Siparişimi tamamla', 'Complete my order', 'Дополнить заказ'],
  focacciaCombine: ['Al götür eşleşmesine çevir', 'Make it a to-go pairing', 'Собрать комбо с собой'],
  focacciaLater: ['Şimdilik değil', 'Not right now', 'Пока нет'],
  focacciaBoth: ['İki ürün birlikte', 'Both items together', 'За обе позиции'],
  focacciaDelta: ['Sipariş tutarındaki değişim', 'Change to your order total', 'Изменение суммы заказа'],
  focacciaReplace: ['Seçtiğin birer porsiyon yerine', 'Replaces one of each selected item', 'Заменит по одной выбранной порции'],
  focacciaTakeNote: ['Paket servis uygunluğunu ekibimizle teyit edin. Sipariş ve ödeme kafede.', 'Confirm takeaway availability with our team. Order and pay at the café.', 'Возможность подачи с собой уточните у команды. Заказ и оплата в кафе.'],
  focacciaAdded: ['Eşleşmen siparişinde.', 'Your pairing is in the order.', 'Комбо добавлено в заказ.'],
  focacciaUndo: ['Geri al', 'Undo', 'Отменить'],
  updated: ['Seçim güncellendi', 'Selection updated', 'Выбор обновлён'],
  customize: ['Özelleştir', 'Customize', 'Настроить'],
  themeLight: ['Açık', 'Light', 'Светлый'],
  themeDark: ['Koyu', 'Dark', 'Тёмный'],
  themeRomantic: ['Romantik', 'Romantic', 'Романтика'],
  themeKids: ['Çocuk', 'Kids', 'Детский'],
  heroFirst: ['İyi kahve.', 'Good coffee.', 'Хороший кофе.'],
  heroSecond: ['Güzel anlar.', 'Beautiful moments.', 'Приятные моменты.'],
  heroBody: [
    'Gazipaşa’da kahvaltı, taze focaccia ve kahve.',
    'Breakfast, fresh focaccia and coffee in Gazipaşa.',
    'Завтраки, свежая фокачча и кофе в Газипаше.',
  ],
  seeMenu: ['Menüyü keşfet', 'Explore the menu', 'Посмотреть меню'],
  findUs: ['Bizi bulun', 'Find us', 'Как добраться'],
  heroAlt: ['Yoğurt, poşe yumurta ve ekmekle çılbır', 'Çılbır with yogurt, poached eggs and bread', 'Чылбыр с йогуртом, яйцами пашот и хлебом'],
  heroDish: ['Çılbır', 'Çılbır', 'Чылбыр'],
  heroCaption: ['Pocitel’in seçimi', 'Pocitel’s choice', 'Выбор Pocitel'],
  quickTitle: ['Canınız ne çekiyor?', 'What are you in the mood for?', 'Чего хочется?'],
  quickBreakfast: ['Kahvaltı', 'Breakfast', 'Хочу завтрак'],
  quickSweet: ['Kahve ve tatlı', 'Coffee & something sweet', 'Кофе и сладкое'],
  quickLunch: ['Atıştırmalık', 'A quick bite', 'Перекусить'],
  quickSavings: ['Tasarruf', 'You save', 'Экономия'],
  quickAdd: ['Eşleşmeyi ekle', 'Add pairing', 'Добавить комбо'],
  menuKicker: ['Poçitel Coffee & Brunch', 'Poçitel Coffee & Brunch', 'Poçitel Coffee & Brunch'],
  feedTitle: ['Menü', 'Menu', 'Меню'],
  menuBody: ['Beğendiğinizi ekleyin. Sipariş ve ödeme kafede.', 'Add what you like. Order and pay at the café.', 'Добавляйте то, что нравится. Заказ и оплата в кафе.'],
  search: ['Menüde ara', 'Search the menu', 'Поиск по меню'],
  clearSearch: ['Aramayı temizle', 'Clear search', 'Очистить поиск'],
  illustration: ['Yapay zekâ görseli', 'AI illustration', 'ИИ-иллюстрация'],
  filters: ['Kategoriler', 'Categories', 'Категории'],
  all: ['Tümü', 'All', 'Всё'],
  noResults: ['Sonuç bulunamadı. Başka bir kelime veya kategori deneyin.', 'Nothing found. Try a different word or category.', 'Ничего не найдено. Попробуйте другой запрос или категорию.'],
  noSaved: ['Beğendiğiniz ürünleri yer imi simgesiyle kaydedebilirsiniz.', 'Tap the bookmark on a dish to save it here.', 'Нажмите на закладку на карточке блюда, чтобы сохранить его здесь.'],
  saved: ['Kaydedilenler', 'Saved', 'Сохранённое'],
  save: ['Kaydet', 'Save', 'Сохранить'],
  stories: ['Menü hikâyeleri', 'Menu stories', 'Истории меню'],
  previous: ['Önceki', 'Previous', 'Назад'],
  next: ['Sonraki', 'Next', 'Дальше'],
  details: ['Ürünü incele', 'View item', 'Открыть карточку'],
  nutrition: ['İçerik · katkı · vitaminler', 'Ingredients · benefits · vitamins', 'Состав · польза · витамины'],
  kcal: ['kcal', 'kcal', 'ккал'],
  perServing: ['porsiyon başına', 'per serving', 'на порцию'],
  perPairing: ['tüm eşleşme', 'whole pairing', 'всё комбо'],
  caloriesNote: ['Kaloriler örnek porsiyon için tahmini değerlerdir. İçerik, beslenmeye katkı ve vitaminler için ürüne dokunun.', 'Calories are estimates for an assumed serving. Tap an item for ingredients, nutritional benefits and vitamins.', 'Калории — примерная оценка на порцию. Нажмите на строку калорий, чтобы увидеть состав, пользу и витамины.'],
  nutritionLoading: ['Besin bilgisi yükleniyor…', 'Loading nutrition…', 'Загружаем пищевую ценность…'],
  nutritionRetry: ['Besin bilgisini yeniden yükle', 'Retry nutrition information', 'Загрузить пищевую ценность ещё раз'],
  pinned: ['Poçitel’in seçimi', 'Poçitel’s pick', 'Выбор Poçitel'],
  more: ['Daha fazla göster', 'Show more', 'Показать ещё'],
  paired: ['Bu eşleşmeyi deneyin', 'Try it in this pairing', 'Попробуйте в комбо'],
  share: ['Paylaş', 'Share', 'Поделиться'],
  shareInvite: ['Şuna bak:', 'Check this out:', 'Посмотри:'],
  quickShare: ['Uygulama seçin', 'Choose an app', 'Выберите приложение'],
  shareLink: ['Bağlantıyı paylaş', 'Send link', 'Отправить ссылку'],
  photoSeparately: ['Fotoğrafı ayrıca gönder', 'Send photo separately', 'Фото отдельно'],
  linkPreviewHint: ['Bağlantıda ürünün fotoğrafı, adı ve fiyatı bulunur.', 'The link includes this item’s photo, name and price.', 'В превью ссылки — фото, название и цена этой позиции.'],
  sharePhoto: ['Fotoğrafla paylaş', 'Share with photo', 'Поделиться с фото'],
  savePhoto: ['Fotoğrafı kaydet', 'Save photo', 'Сохранить фото'],
  preparingPhoto: ['Fotoğraf hazırlanıyor…', 'Preparing your photo…', 'Готовим фото…'],
  photoReady: ['Ürünün fotoğrafı ve bağlantısı paylaşılmaya hazır.', 'The item’s photo and link are ready to share.', 'Фото блюда и ссылка готовы к отправке.'],
  photoFallback: ['Bağlantıyı kopyalayıp mesajınıza yapıştırın.', 'Copy the link and paste it into your message.', 'Скопируйте ссылку и вставьте её в сообщение.'],
  photoFailed: ['Fotoğraf yüklenemedi. Tekrar açmayı deneyin veya bağlantıyı kopyalayın.', 'The photo couldn’t load. Try opening this again or copy the link.', 'Фото не загрузилось. Откройте это окно ещё раз или скопируйте ссылку.'],
  linkLabel: ['Ürün bağlantısı', 'Link to this item', 'Ссылка на блюдо'],
  copyLink: ['Bağlantıyı kopyala', 'Copy link', 'Скопировать ссылку'],
  copied: ['Bağlantı kopyalandı.', 'Link copied.', 'Ссылка скопирована.'],
  manualCopy: ['Seçili bağlantıyı kopyalayabilirsiniz.', 'You can copy the selected link.', 'Можно скопировать выделенную ссылку.'],
  serviceMode: ['Servis şekli', 'Serving preference', 'Формат подачи'],
  dineIn: ['Kafede', 'Dine in', 'В кафе'],
  takeaway: ['Al götür', 'To go', 'С собой'],
  takeInvite: ['Yanınızda götürün', 'Take it to go', 'Возьмите с собой'],
  takeHint: ['Kahve, matcha ve atıştırmalıklar bardakta.', 'Coffee, matcha and snacks in a cup.', 'Кофе, матча и закуски в стакане.'],
  takeTitle: ['Al götür menüsü', 'The to-go menu', 'Меню с собой'],
  takeNote: ['Paket servis için menü önerileri. Bardak ve uygunluğu ekibimizle teyit edin.', 'Menu suggestions to take with you. Check packaging and availability with our team.', 'Идеи для заказа с собой. Упаковку и наличие уточняйте у команды кафе.'],
  addOn: ['Yanına ne gider?', 'Something to go with it?', 'Что добавить к заказу?'],
  totalWith: ['Birlikte', 'Together', 'Вместе'],
  choose: ['Seç', 'Choose', 'Выбрать'],
  orderSteps: ['Sipariş adımları', 'Order steps', 'Шаги выбора'],
  stepChoose: ['Seç', 'Choose', 'Выбрать'],
  stepReview: ['Kontrol et', 'Review', 'Проверить'],
  stepShow: ['Sipariş', 'Order', 'Заказать'],
  readyToShow: ['3 · Siparişi ekibimizle tamamlayın', '3 · Place your order with our team', '3 · Закажите у официанта'],
  yourVersion: ['Nasıl olsun?', 'Make it yours', 'Ваш вариант'],
  single: ['Tek ürün', 'Just this item', 'Одна позиция'],
  combo: ['Eşleşme', 'Make it a pairing', 'Взять комбо'],
  milk: ['Süt tercihi', 'Milk preference', 'Молоко'],
  syrup: ['Kahve şurubu', 'Coffee syrup', 'Сироп для кофе'],
  included: ['Dahil', 'Included', 'Включено'],
  comboDrink: ['İçeceğiniz için', 'For the drink in your pairing', 'Для напитка в комбо'],
  quantity: ['Adet', 'Quantity', 'Количество'],
  increase: ['Bir ekle', 'Add one', 'Добавить одну порцию'],
  edit: ['Düzenle', 'Edit', 'Изменить'],
  saveChanges: ['Değişiklikleri kaydet', 'Save changes', 'Сохранить изменения'],
  quantityLimit: ['Bu seçimden en fazla 99 adet ekleyebilirsiniz.', 'You can add up to 99 of this selection.', 'Можно выбрать до 99 порций одного варианта.'],
  skipExtras: ['Şimdilik yeterli', 'That’s everything', 'Пока без дополнений'],
  menuNote: ['Fiyatlar paylaşılan basılı menüdendir. Güncel fiyat ve içerik için ekibimize danışabilirsiniz.', 'Prices are from the printed menu. Please check with our team for current prices and ingredients.', 'Цены взяты из печатного меню. Актуальные цены и состав можно уточнить у команды кафе.'],
  visitTitle: ['Kahveye bekleriz.', 'Come by for coffee.', 'Заходите на кофе.'],
  hours: ['Pazartesi–Cumartesi 07.00–22.00 · Pazar kapalı', 'Mon–Sat 07:00–22:00 · Closed Sunday', 'Пн–сб 07:00–22:00 · Вс закрыто'],
  hoursSource: ['Saatleri Google Haritalar’da kontrol edin', 'Check hours on Google Maps', 'Сверить график в Google Maps'],
  visitArt: ['Menü illüstrasyonu', 'Illustration from the menu', 'Иллюстрация из меню'],
  route: ['Yol tarifi', 'Get directions', 'Построить маршрут'],
  cart: ['Siparişim', 'My order', 'Мой заказ'],
  checkoutTitle: ['Güzel bir mola zamanı.', 'Time for something good.', 'Самое время попробовать.'],
  checkoutIntro: ['Seçiminiz hazır. Sipariş ve ödeme kafede.', 'Your selection is ready. Order and pay at the café.', 'Ваш выбор готов. Оформление и оплата в кафе.'],
  checkoutAction: ['Kafede sipariş ver', 'Order at the café', 'Заказать в кафе'],
  checkoutHelp: ['Sonraki adım: ekibimize gösterin, kafede ödeyin.', 'Next: show our team and pay at the café.', 'Дальше — покажите заказ официанту и оплатите в кафе.'],
  checkoutItems: ['Seçtikleriniz', 'Your selection', 'В вашем заказе'],
  separately: ['Ayrı ayrı', 'Bought separately', 'По отдельности'],
  comboSavings: ['Eşleşme avantajınız', 'Your pairing savings', 'Выгода комбо'],
  oneMoreTouch: ['Küçük bir dokunuş', 'The finishing touch', 'Последний вкусный штрих'],
  combineTitle: ['Birlikte daha avantajlı', 'Better together', 'Вместе выгоднее'],
  upgradeTitle: ['Eşleşmeye tamamlayın', 'Make it a pairing', 'Добавьте пару к любимому'],
  addOffer: ['Siparişime ekle', 'Add to my order', 'Добавить к заказу'],
  upgradeOffer: ['Eşleşmeyi seç', 'Choose the pairing', 'Взять комбо'],
  combineOffer: ['Eşleşmeyle tasarruf et', 'Bundle and save', 'Объединить в комбо'],
  offerAdded: ['Siparişinizde · kaldırmak için dokunun', 'In your order · tap to undo', 'В заказе · нажмите, чтобы отменить'],
  offerReplaces: ['Birer adet yerine', 'Replaces one of each', 'Заменит по одной порции'],
  offerReplacesSingle: ['Bir porsiyon yerine', 'Replaces one portion', 'Заменит одну порцию'],
  offerPriceAfter: ['Yeni toplam', 'New total', 'Новый итог'],
  offerApplied: ['Sipariş güncellendi.', 'Order updated.', 'Заказ обновлён.'],
  offerUndone: ['Önceki seçiminiz geri yüklendi.', 'Your previous selection is restored.', 'Прежний выбор восстановлен.'],
  combineReason: ['Seçtiğiniz lezzetler, menüdeki eşleşme fiyatıyla.', 'The same favourites at the menu’s pairing price.', 'Те же блюда и напитки по цене комбо из меню.'],
  drinkWithFoodReason: ['Yemeğinizin yanına, menüden bir içecek eşleşmesi.', 'A drink from the menu to complete your meal.', 'Добавьте напиток к блюду по цене комбо.'],
  foodWithDrinkReason: ['İçeceğinizin yanına bir lezzet daha.', 'Something delicious to enjoy with your drink.', 'Любимый напиток и ещё кое-что вкусное к нему.'],
  teaWithBreakfastReason: ['Kahvaltınızın yanına bir bardak Türk çayı.', 'A glass of Turkish tea alongside your breakfast.', 'Стакан турецкого чая к вашему завтраку.'],
  coffeeForWalkReason: ['Brunch burada, cappuccino yolda. Molayı yanınızda götürün.', 'Brunch here, cappuccino on your walk. Take the moment with you.', 'Бранч здесь, капучино на прогулку. Возьмите настроение с собой.'],
  breakfastToGoReason: ['Kahvenizin yanına meyve, yoğurt ve granola — bardakta.', 'Fruit, yogurt and granola to go with your coffee — in a cup.', 'Фрукты, йогурт и гранола к кофе — тоже в стакане.'],
  sweetWithCoffeeReason: ['Kahvenizin yanına meyveli, Nutellalı pancake.', 'Fruit and Nutella pancakes to enjoy with your coffee.', 'Панкейки с фруктами и Nutella к вашему кофе.'],
  handoffTitle: ['Sipariş vermek istiyorum', 'Let’s order this.', 'Хочу заказать это.'],
  handoffHelp: ['Bu ekranı ekibimize gösterin. Sipariş ve ödeme kafede tamamlanır.', 'Show this screen to our team. Your order and payment are completed at the café.', 'Покажите экран официанту. Он оформит заказ и примет оплату в кафе.'],
  handoffTurkish: ['Sipariş detayları', 'Order details · in Turkish for our team', 'Детали заказа · на турецком для официанта'],
  cartNote: ['Bu listeyi ekibimize gösterin. Sipariş ve ödeme kafede yapılır.', 'Show this list to our team. Order and pay at the café.', 'Покажите список официанту. Оформление и оплата в кафе.'],
  emptyCart: ['Listeniz henüz boş.', 'Your list is empty.', 'Ваш список пока пуст.'],
  total: ['Toplam', 'Total', 'Итого'],
  backToMenu: ['Menüye dön', 'Back to menu', 'Вернуться к меню'],
  showWaiter: ['Garsona göster', 'Show the waiter', 'Показать официанту'],
  backToSelection: ['Seçime dön', 'Back to selection', 'Вернуться к выбору'],
  add: ['Ekle', 'Add', 'Добавить'],
  remove: ['Bir azalt', 'Remove one', 'Убрать одну порцию'],
  close: ['Kapat', 'Close', 'Закрыть'],
};

const languages = ['tr', 'en', 'ru'];
const locales = ['tr-TR', 'en-GB', 'ru-RU'];
const pairedWith = new Map([
  ['cilbir', 'turkish-classic'], ['tea', 'turkish-classic'],
  ['pancake', 'sweet-morning'], ['cappuccino', 'sweet-morning'],
  ['granola', 'fresh-energy'], ['iced-matcha', 'fresh-energy'],
  ['smoked-turkey', 'lunch-favourite'], ['iced-americano', 'lunch-favourite'],
]);
const $ = selector => document.querySelector(selector);
const search = $('#search');
const results = $('#results');
const cart = $('#cart');
const cartItems = $('#cart-items');
const waiter = $('#waiter');
const settings = $('#settings');
let lastAddedId;
let lastAddedOpener;
let noticeTimer;
let microFeedbackTimer;
const pulseTimers = new WeakMap();
const viewer = $('#post-viewer');
const viewerContent = $('#viewer-content');
const shareDialog = $('#share-dialog');
const shareLink = $('#share-link');
const savedFilter = $('#saved-filter');
const configure = $('#configure');
const focacciaPromo = $('#focaccia-promo');
const selectionKey = 'pocitel-selection-v1';
const languageKey = 'pocitel-language';
const savedKey = 'pocitel-saved-v1';
const engagementKey = 'pocitel-engagement-v1';
const favoriteCombosKey = 'pocitel-favorite-combos-v1';
const pageSize = 8;
const maxQuantity = 99;
let draft;
let nutritionSequence = 0;
let focacciaOffer;
let focacciaDraft;
let focacciaTransaction;
let focacciaOpener;
let focacciaAutoTimer;
let focacciaSeen = false;
try { focacciaSeen = sessionStorage.getItem('pocitel-focaccia-offer-v1') === 'seen'; } catch { /* Keep the current visit usable. */ }

async function fillNutrition(container, entry, options = {}) {
  if (!container) return;
  const sequence = String(++nutritionSequence);
  const languageAtStart = language;
  const open = options.open ?? Boolean(container.querySelector('.nutrition-panel[open]'));
  container.dataset.nutritionSequence = sequence;
  container.innerHTML = `<p class="nutrition-loading" role="status">${t('nutritionLoading')}</p>`;
  try {
    // Nutrition is only fetched when someone opens a product, keeping the feed light.
    const { nutritionMarkup } = await import('./nutrition.js?v=20261106-builder');
    if (!container.isConnected || container.dataset.nutritionSequence !== sequence || language !== languageAtStart) return;
    container.innerHTML = nutritionMarkup(entry, language, items, { ...options, open });
    if (options.scrollTo && open) requestAnimationFrame(() => {
      if (!container.isConnected || container.dataset.nutritionSequence !== sequence || !viewer.open) return;
      const summary = container.querySelector('.nutrition-panel > summary');
      summary?.focus({ preventScroll: true });
      summary?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  } catch {
    if (!container.isConnected || container.dataset.nutritionSequence !== sequence) return;
    container.innerHTML = `<button type="button" class="nutrition-link" data-nutrition-retry="${entry.id}">${t('nutritionRetry')}</button>`;
  }
}
let configureOpener;
let suggestionsDismissed = false;
let checkoutOffer;
let offerTransaction;

function orderItem(id) {
  return resolveOrderItem(id, items);
}

function readSetting(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeSetting(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Keep the current session usable. */ }
}

function restoreSelection() {
  try {
    const saved = JSON.parse(readSetting(selectionKey));
    if (!Array.isArray(saved)) return new Map();
    return new Map(saved.filter(entry =>
      Array.isArray(entry) && orderItem(entry[0]) &&
      Number.isInteger(entry[1]) && entry[1] >= 1 && entry[1] <= maxQuantity
    ));
  } catch {
    return new Map();
  }
}

const params = new URLSearchParams(location.search);
const linkedItem = document.documentElement.dataset.shareItem || params.get('item');
let language = languages.indexOf(document.documentElement.dataset.shareLang || params.get('lang'));
if (language < 0) language = Math.max(0, languages.indexOf(readSetting(languageKey)));
let activeCategory = location.hash === '#pairings' ? 'combos' : 'all';
let activeMoment = null;
let takeawayMode = Boolean(items.get(linkedItem)?.sourceId);
if (takeawayMode) activeCategory = 'all';
let savedOnly = false;
let visibleLimit = pageSize;
let openedPost;
let postOpener;
let shareOpener;
let sharedPost;
let sharedLink;
let sharedItemId;
let shareSequence = 0;
let sharePhotoUrl;
let sharePhotoLoading = false;
let touchOrigin;
const selection = restoreSelection();
const saved = new Set();
let engagement = restoreEngagement(readSetting(engagementKey), items.keys());
let favoriteCombos = restoreFavoriteCombos(readSetting(favoriteCombosKey), orderItem);
try {
  const stored = JSON.parse(readSetting(savedKey));
  if (Array.isArray(stored)) stored.filter(id => items.has(id)).forEach(id => saved.add(id));
} catch { /* Ignore invalid saved data. */ }

const t = key => copy[key][language];
const name = entry => entry.names[language];
const description = entry => entry.descriptions[language];
const price = (value, locale = locales[language]) => `${value.toLocaleString(locale)} ₺`;
const icon = key => `<svg class="icon" aria-hidden="true"><use href="#i-${key}"/></svg>`;
const normalize = value => value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replaceAll('ı', 'i').replace(/[-‐‑–]/gu, ' ').trim();

function priceMarkup(entry) {
  return `<span class="prices">${entry.before ? `<del>${price(entry.before)}</del>` : ''}<strong>${price(entry.price)}</strong></span>`;
}

function choiceField(field, title, options, selected) {
  return `<fieldset class="choice-field"><legend>${title}</legend><div class="choice-options">
    ${options.map(option => `<label class="choice-option">
      <input type="radio" name="${field}" value="${option.id}" ${option.id === selected ? 'checked' : ''}>
      <span><strong>${option.label}</strong>${option.detail ? `<small>${option.detail}</small>` : ''}</span>
      ${option.price ? `<b>${option.price}</b>` : ''}
    </label>`).join('')}
  </div></fieldset>`;
}

function draftItem() {
  return orderItem(configurationId(draft.itemId, draft.milk, draft.syrup));
}

function renderConfigurator() {
  const entry = items.get(draft.itemId);
  const supported = customization(entry);
  if (!supported.milk) draft.milk = 'standard';
  if (!supported.syrup) draft.syrup = 'none';
  $('#configure-product').innerHTML = `<div class="configure-product">
    <div class="configure-photo">${itemImage(entry, false)}${illustrationLabel(entry)}</div>
    <div><p class="eyebrow">${t(isTakeaway(entry) ? 'takeaway' : 'dineIn')}</p><h2 id="configure-title">${name(entry)}</h2>
      ${description(entry) ? `<p>${description(entry)}</p>` : ''}${priceMarkup(entry)}</div>
  </div><div id="configure-nutrition"></div>`;
  const fields = [];
  const toGo = items.get(`to-go-${draft.singleId}`);
  if (toGo) {
    fields.push(choiceField('serving', t('serviceMode'), [
      { id: 'cafe', label: t('dineIn') },
      { id: 'takeaway', label: t('takeaway') },
    ], entry.sourceId ? 'takeaway' : 'cafe'));
  }
  const pair = items.get(pairedWith.get(draft.singleId));
  if (pair && !entry.sourceId) {
    const single = items.get(draft.singleId);
    fields.push(choiceField('version', t('yourVersion'), [
      { id: single.id, label: t('single'), detail: name(single), price: price(single.price) },
      { id: pair.id, label: `${t('combo')} · +${price(pair.price - single.price)}`, detail: `${description(pair)} · ${t('quickSavings')} ${price(pair.before - pair.price)}`, price: price(pair.price) },
    ], entry.id));
  }
  if (entry.before && (supported.milk || supported.syrup)) fields.push(`<p class="option-note">${t('comboDrink')}</p>`);
  if (supported.milk) fields.push(choiceField('milk', t('milk'), milkOptions.map(option => ({
    id: option.id, label: option.labels[language], price: option.id === 'standard' ? t('included') : `+${price(items.get('plant-milk').price)}`,
  })), draft.milk));
  if (supported.syrup) fields.push(choiceField('syrup', t('syrup'), syrupOptions.map(option => ({
    id: option.id, label: option.labels[language], price: option.id === 'none' ? t('included') : `+${price(items.get('syrup').price)}`,
  })), draft.syrup));
  $('#configure-choices').innerHTML = fields.join('');
  updateConfigurationTotal();
}

function updateConfigurationTotal() {
  const entry = draftItem();
  $('#configure-quantity').textContent = draft.quantity;
  $('#configure-minus').disabled = draft.quantity === 1;
  $('#configure-plus').disabled = draft.quantity === maxQuantity;
  $('#configure-total').textContent = price(entry.price * draft.quantity);
  $('#confirm-configure').textContent = t(draft.editId ? 'saveChanges' : 'add');
  $('#configure-error').hidden = true;
  fillNutrition($('#configure-nutrition'), entry, { changed: draft.milk !== 'standard' || draft.syrup !== 'none' });
}

function openConfigurator(id, opener, editId) {
  const entry = orderItem(id);
  const pairing = comboChoice(entry);
  if (pairing) return openFocacciaPromo(opener, false, editId, pairing);
  const baseId = entry.baseId ?? entry.id;
  draft = {
    singleId: entry.sourceId ?? baseId, itemId: baseId,
    milk: entry.milk ?? 'standard', syrup: entry.syrup ?? 'none',
    quantity: editId ? selection.get(editId) : 1, editId,
  };
  configureOpener = opener;
  renderConfigurator();
  configure.scrollTop = 0;
  configure.showModal();
}

function confirmConfiguration() {
  const entry = draftItem();
  if (!replaceOrderLine(selection, draft.editId, entry.id, draft.quantity, maxQuantity)) {
    $('#configure-error').textContent = t('quantityLimit');
    $('#configure-error').hidden = false;
    return;
  }
  persistSelection();
  configure.close('saved');
  if (cart.open) {
    renderCart();
    cartItems.querySelector(`[data-edit="${entry.id}"]`)?.focus({ preventScroll: true });
  } else {
    if (viewer.open) viewer.close();
    const opener = configureOpener?.closest('#post-viewer') ? postOpener : configureOpener;
    opener?.focus({ preventScroll: true });
    showAdded(entry, opener, Boolean(draft.editId));
  }
  $('#announcement').textContent = `${name(entry)} · ${draft.quantity} · ${price(entry.price * draft.quantity)}`;
}

function addButton(entry) {
  return `<button type="button" class="button primary post-add" data-add="${entry.id}" aria-label="${t('add')} · ${name(entry)}">${icon('plus')}${t('add')}</button>`;
}

// Keep media and social buttons as siblings: buttons must never nest in buttons.
function postSocialRail(entry) {
  const liked = engagement.likes.has(entry.id);
  const views = engagement.views.get(entry.id) ?? 0;
  return `<div class="post-social-rail" role="group" aria-label="${t('socialActions')} · ${name(entry)}">
    <span class="social-rail-item social-rail-views" aria-label="${t('views')}: ${views} · ${name(entry)}" title="${t('views')}">
      ${icon('eye')}<span data-view-count="${entry.id}">${views}</span>
    </span>
    <button type="button" class="social-rail-item social-rail-like" data-like="${entry.id}" aria-label="${t('like')} · ${name(entry)}" aria-pressed="${liked}" title="${t('like')}">
      ${icon('heart')}<span data-like-count="${entry.id}">${liked ? 1 : 0}</span>
    </button>
    <button type="button" class="social-rail-item social-rail-share" data-share="${entry.id}" aria-label="${t('share')} · ${name(entry)}" title="${t('share')}">
      ${icon('share')}
    </button>
  </div>`;
}

function postActions(entry) {
  return `<div class="post-actions">
    <button type="button" class="icon-button save-post" data-save="${entry.id}" aria-label="${t('save')} · ${name(entry)}" aria-pressed="${saved.has(entry.id)}">${icon('bookmark')}</button>
    ${addButton(entry)}
  </div>`;
}

function refreshEngagement(id) {
  const liked = engagement.likes.has(id);
  const views = engagement.views.get(id) ?? 0;
  const entry = items.get(id);
  document.querySelectorAll('[data-like]').forEach(button => {
    if (button.dataset.like !== id) return;
    button.setAttribute('aria-pressed', String(liked));
    const count = button.querySelector('[data-like-count]');
    if (count) count.textContent = liked ? '1' : '0';
  });
  document.querySelectorAll('[data-view-count]').forEach(count => {
    if (count.dataset.viewCount !== id) return;
    count.textContent = String(views);
    count.parentElement.setAttribute('aria-label', `${t('views')}: ${views} · ${name(entry)}`);
  });
}

function persistEngagement() {
  writeSetting(engagementKey, serializeEngagement(engagement));
}

function pulseTap(element) {
  if (!element) return;
  const card = element.closest('.feed-post, #post-viewer');
  for (const node of [element, card].filter(Boolean)) {
    clearTimeout(pulseTimers.get(node));
    node.classList.remove('is-joy-tapped');
    // Double RAF is unnecessary: the class is also a short-lived glowing state.
    node.classList.add('is-joy-tapped');
    pulseTimers.set(node, setTimeout(() => node.classList.remove('is-joy-tapped'), 500));
  }
}

function showMicroFeedback(message) {
  const toast = $('#micro-feedback');
  if (!toast) return;
  // A modal dialog is in the browser top layer; body-level toasts appear behind it.
  const host = viewer.open ? viewer : document.body;
  if (toast.parentElement !== host) host.appendChild(toast);
  clearTimeout(microFeedbackTimer);
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add('is-visible');
  microFeedbackTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.hidden = true;
  }, 1450);
}

function handleLike(id, opener) {
  if (!items.has(id)) return;
  toggleLike(engagement, id);
  persistEngagement();
  refreshEngagement(id);
  pulseTap(opener);
  showMicroFeedback(t(engagement.likes.has(id) ? 'likedFeedback' : 'unlikedFeedback'));
}

function handleView(id) {
  if (!items.has(id)) return;
  recordView(engagement, id);
  persistEngagement();
  refreshEngagement(id);
}

function itemImage(entry, lazy = true) {
  return `<img src="assets/${entry.image}.webp" alt="" ${lazy ? 'loading="lazy"' : ''} decoding="async">`;
}

function illustrationLabel(entry) {
  return entry.sourceId || entry.image.startsWith('illustrations/') ? `<span class="illustration-label">${t('illustration')}</span>` : '';
}

function nutritionLink(entry) {
  const energy = energyRanges[entry.id].join('–');
  const serving = t(entry.before ? 'perPairing' : 'perServing');
  return `<button type="button" class="nutrition-link nutrition-preview" data-post="${entry.id}" data-open-nutrition="true">
    <span><strong class="nutrition-kcal">≈ ${energy} ${t('kcal')} <small>· ${serving}</small></strong><span class="nutrition-preview-label">${t('nutrition')}</span></span>${icon('chevron')}
  </button>`;
}

function menuPost(entry, index = 8) {
  const category = categoryByItem.get(entry.id);
  const peek = hasCutaway(entry);
  return `<article class="feed-post${entry.sourceId ? ' take-post' : ''}" id="post-${entry.id}">
    <div class="post-top">
      <span class="post-mark"><svg aria-hidden="true"><use href="#i-sprig"/></svg></span>
      <span>${category.labels[language]}</span>
      ${entry.sourceId ? `<span class="pinned">${t('takeaway')}</span>` : entry.before ? `<span class="pinned">${t('pinned')}</span>` : ''}
    </div>
    <div class="post-media-wrap">
      <button type="button" class="post-media" data-post="${entry.id}" aria-label="${t('details')} · ${name(entry)}${peek ? ` · ${t('lookInside')}` : ''}">
        ${itemImage(entry, index > 1)}
        ${illustrationLabel(entry)}
        ${peek ? `<span class="cutaway-preview"><span aria-hidden="true">↔</span> ${t('lookInside')}</span>` : ''}
      </button>
      ${postSocialRail(entry)}
    </div>
    <div class="post-body">
      <div class="post-heading"><h3>${name(entry)}</h3>${priceMarkup(entry)}</div>
      ${description(entry) ? `<p class="post-description">${description(entry)}</p>` : ''}
      ${peek ? `<button type="button" class="look-inside-button" data-post="${entry.id}" aria-label="${t('lookInside')} · ${name(entry)}"><span aria-hidden="true">↔</span> ${t('lookInside')}</button>` : ''}
      ${nutritionLink(entry)}
      ${postActions(entry)}
    </div>
  </article>`;
}

function renderFilters() {
  const available = takeawayMode ? new Set(takeawayItems.map(entry => categoryByItem.get(entry.id).id)) : null;
  const groups = available ? categories.filter(category => available.has(category.id)) : [categoryById.get('combos'), ...categories.filter(category => category.id !== 'combos')];
  const filters = [{ id: 'all', labels: copy.all }, ...groups];
  $('#filters').innerHTML = filters.map(filter => `<button type="button" data-category="${filter.id}" aria-pressed="${filter.id === activeCategory}">${filter.labels[language]}</button>`).join('');
}

function renderServiceMode() {
  $('#service-picker').dataset.activeMode = takeawayMode ? 'takeaway' : 'cafe';
  document.querySelectorAll('[data-mode]').forEach(button => {
    button.setAttribute('aria-pressed', (button.dataset.mode === 'takeaway') === takeawayMode);
  });
  $('#menu-title').textContent = t(takeawayMode ? 'takeTitle' : 'feedTitle');
  $('#take-note').hidden = !takeawayMode;
  renderFilters();
}

function renderResults(append = false) {
  const terms = normalize(search.value).split(/\s+/u).filter(Boolean);
  const moment = moments.find(option => option.id === activeMoment);
  const matching = (takeawayMode ? takeawayItems : feedOrder).filter(entry =>
    (activeCategory === 'all' || categoryByItem.get(entry.id).id === activeCategory) &&
    (!moment || moment.ids.includes(entry.id)) &&
    (!savedOnly || saved.has(entry.id)) &&
    terms.every(term => entry.searchText.includes(term))
  );
  const shown = matching.slice(0, visibleLimit);
  const count = matching.length;
  $('#result-meta').textContent = `${savedOnly ? `${t('saved')} · ` : ''}${[`${count} ürün`, `${count} ${count === 1 ? 'item' : 'items'}`, `Позиций: ${count}`][language]}`;
  $('#clear-search').hidden = !search.value;
  const categoryNote = categoryById.get(activeCategory)?.note?.[language];
  $('#category-note').hidden = !count || !categoryNote;
  $('#category-note').textContent = categoryNote ?? '';
  $('#more-posts').hidden = shown.length >= count;
  if (append) {
    const newPosts = shown.slice(visibleLimit - pageSize);
    results.insertAdjacentHTML('beforeend', newPosts.map(menuPost).join(''));
    results.querySelector(`[data-post="${newPosts[0].id}"]`).focus();
  } else {
    results.innerHTML = count ? shown.map(menuPost).join('') : `<p class="empty">${t(savedOnly && !saved.size ? 'noSaved' : 'noResults')}</p>`;
  }
}

function filterResults() {
  visibleLimit = pageSize;
  renderMoments();
  document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', button.dataset.category === activeCategory));
  savedFilter.setAttribute('aria-pressed', savedOnly);
  renderResults();
}

function scrollToMenuStart(smooth = false) {
  requestAnimationFrame(() => {
    const tools = $('.menu-tools');
    const style = getComputedStyle(tools);
    const offset = style.position === 'sticky' ? parseFloat(style.top) + tools.offsetHeight : 0;
    const top = $('#result-meta').getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant' });
  });
}

const hasCutaway = entry => Boolean(revealFor(entry, language));
const focacciaViews = {
  'smoked-turkey': ['assets/cutaway/focaccia-outside.webp', 'assets/cutaway/focaccia-inside.webp'],
  beetroot: ['assets/cutaway/beetroot-outside.webp', 'assets/illustrations/branded/beetroot.webp'],
  zucchini: ['assets/cutaway/zucchini-outside.webp', 'assets/illustrations/branded/zucchini.webp'],
};

function cutawayMarkup(entry, socialRail = '') {
  const reveal = revealFor(entry, language);
  const food = items.get(reveal.dishId);
  const shown = reveal.pairing ? food : entry;
  const views = focacciaViews[reveal.dishId] ?? [`assets/${shown.image}.webp`, `assets/${shown.image}.webp`];
  const illustrated = Boolean(focacciaViews[reveal.dishId]) || shown.sourceId || shown.image.startsWith('illustrations/');
  return `<div class="cutaway" style="--cutaway-split: 50%">
    <img class="cutaway-outside" src="${views[0]}" alt="" decoding="async">
    <div class="cutaway-inside${focacciaViews[reveal.dishId] ? '' : ' cutaway-annotated'}" aria-hidden="true">
      <img src="${views[1]}" alt="" decoding="async">
    </div>
    <span class="cutaway-divider" aria-hidden="true"><span class="cutaway-handle">↔</span></span>
    <input type="range" min="0" max="100" step="1" value="50" class="cutaway-range" data-cutaway-range aria-label="${t('cutawayRange')}" aria-describedby="cutaway-help" aria-valuetext="${t('cutawayShown')} 50%">
    ${cutawayOverlayMarkup(reveal, t('insideLabel'), t('moreIngredients'))}
    ${socialRail}
    ${illustrated ? `<span class="cutaway-art-label">${t('illustration')}</span>` : ''}
  </div>
  <div class="cutaway-details">
    <div class="cutaway-guide" id="cutaway-help">${t('cutawayHelpShort')}</div>
    <div class="cutaway-controls"><button type="button" data-cutaway-toggle aria-pressed="false" aria-label="${t('cutawayShow')}">${t('cutawayShow')}</button></div>
    <details class="cutaway-ingredients" data-qa="ingredient-disclosure">
      <summary>${t('cutawayAllIngredients')}</summary>
      <div class="cutaway-legend" aria-label="${t('cutawayAllIngredients')}">${reveal.parts.map(part => `<span>${part}</span>`).join('')}</div>
      <small class="cutaway-ingredient-source">${t('cutawaySource')}</small>
    </details>
  </div>`;
}

function renderViewer() {
  const { ids, index, story } = openedPost;
  const entry = items.get(ids[index]);
  const related = items.get(pairedWith.get(entry.id));
  const viewerSteps = $('#viewer-steps');
  viewerSteps.innerHTML = story ? `
    <p class="eyebrow">${categoryById.get(story).labels[language]} · ${index + 1}/${ids.length}</p>
    <div class="story-progress" aria-hidden="true">${ids.map((_, step) => `<span class="${step <= index ? 'read' : ''}"></span>`).join('')}</div>` :
    (openedPost.nutritionOpen ? `<p class="viewer-item-name">${name(entry)}</p>` : `<p class="eyebrow">${entry.sourceId ? `${t('takeaway')} · ` : ''}${categoryByItem.get(entry.id).labels[language]}</p>`);
  viewerContent.innerHTML = `
    <div class="viewer-photo${entry.sourceId ? ' take-photo' : ''}${hasCutaway(entry) ? ' has-cutaway' : ''}">
      ${hasCutaway(entry) ? cutawayMarkup(entry, postSocialRail(entry)) : `${itemImage(entry, false)}${illustrationLabel(entry)}${postSocialRail(entry)}`}
    </div>
    <div class="viewer-body">
      <div class="post-heading"><h2 id="post-title">${name(entry)}</h2>${priceMarkup(entry)}</div>
      ${description(entry) ? `<p class="post-description">${description(entry)}</p>` : ''}
      ${postActions(entry)}
      <div id="viewer-nutrition"></div>
      <button type="button" class="customize-item" data-customize="${entry.id}">${t('customize')}</button>
      ${related ? `<button type="button" class="related-post" data-related="${related.id}">
        ${itemImage(related)}
        <span><small>${t('paired')}</small><strong>${name(related)} · ${price(related.price)}</strong></span>
        ${icon('chevron')}
      </button>` : ''}
    </div>`;
  fillNutrition($('#viewer-nutrition'), entry, { open: Boolean(openedPost.nutritionOpen), scrollTo: Boolean(openedPost.nutritionOpen) });
}

function openPost(ids, opener, story) {
  openedPost = { ids, index: 0, story, nutritionOpen: opener?.dataset.openNutrition === 'true' };
  postOpener = opener;
  touchOrigin = null;
  renderViewer();
  handleView(ids[0]);
  const controls = $('#story-controls');
  controls.hidden = !story;
  updateStoryControls();
  viewer.scrollTop = 0;
  viewer.showModal();
}

function updateStoryControls() {
  $('#previous-story').disabled = openedPost.index === 0;
  $('#next-story').disabled = openedPost.index >= openedPost.ids.length - 1;
}

function stepStory(delta) {
  const next = openedPost.index + delta;
  if (!openedPost.story || next < 0 || next >= openedPost.ids.length) return;
  openedPost.index = next;
  renderViewer();
  handleView(openedPost.ids[next]);
  updateStoryControls();
  if (document.activeElement?.disabled) {
    (delta > 0 ? $('#previous-story') : $('#next-story')).focus();
  }
}

function toggleSaved(id, opener) {
  if (!saved.delete(id)) saved.add(id);
  writeSetting(savedKey, JSON.stringify([...saved]));
  document.querySelectorAll(`[data-save="${id}"]`).forEach(node => node.setAttribute('aria-pressed', saved.has(id)));
  pulseTap(opener);
  showMicroFeedback(t(saved.has(id) ? 'savedFeedback' : 'unsavedFeedback'));
  if (savedOnly && !saved.has(id)) {
    renderResults();
    if (!viewer.open) (results.querySelector('.save-post') ?? savedFilter).focus();
  }
}

// Native OS share sheet opens IN the original click: no modal, image loading or await
// may happen first, otherwise browsers lose the required transient user activation.
function sharePost(button, id) {
  const entry = items.get(id);
  if (!entry) return;
  const payload = {
    title: `${name(entry)} · ${price(entry.price)} · Poçitel`,
    text: `${t('shareInvite')} ${name(entry)} · ${price(entry.price)} · Poçitel Coffee & Brunch`,
    url: shareUrl(id, languages[language]),
  };
  if (typeof navigator.share === 'function') {
    try {
      Promise.resolve(navigator.share(payload)).catch(error => {
        // Cancelling a native sheet must not open an unwanted second dialog.
        if (error?.name !== 'AbortError') openQuickShareFallback(button, id, payload);
      });
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }
  }
  openQuickShareFallback(button, id, payload);
}

function openQuickShareFallback(button, id, payload) {
  const entry = items.get(id);
  if (!entry) return;
  shareSequence++;
  if (sharePhotoUrl) URL.revokeObjectURL(sharePhotoUrl);
  sharePhotoUrl = undefined;
  sharePhotoLoading = false;
  sharedPost = null;
  sharedLink = payload;
  sharedItemId = id;
  shareOpener = button;
  shareLink.value = payload.url;
  shareLink.hidden = true;
  $('#share-status').textContent = '';
  $('#share-caption').textContent = `${name(entry)} · ${price(entry.price)}`;
  const targets = socialShareTargets(payload);
  for (const [channel, url] of Object.entries(targets)) {
    $('#share-' + channel).href = url;
  }
  $('#share-extras').open = false;
  $('#share-photo-button').hidden = true;
  $('#share-photo-button').disabled = true;
  $('#save-photo').hidden = true;
  $('#save-photo').removeAttribute('href');
  shareDialog.showModal();
}

async function prepareFallbackPhoto() {
  if (!shareDialog.open || !sharedLink || !sharedItemId || sharedPost || sharePhotoLoading) return;
  const sequence = shareSequence;
  const entry = items.get(sharedItemId);
  if (!entry) return;
  sharePhotoLoading = true;
  $('#share-status').textContent = t('preparingPhoto');
  try {
    const { prepareSharePhoto } = await import('./share-photo.js');
    const file = await prepareSharePhoto(`assets/${entry.image}.webp`, entry.id);
    if (sequence !== shareSequence || !shareDialog.open) return;
    sharedPost = {
      files: [file], title: name(entry), text: sharedLink.text, url: sharedLink.url,
    };
    sharePhotoUrl = URL.createObjectURL(file);
    $('#save-photo').href = sharePhotoUrl;
    $('#save-photo').download = file.name;
    $('#save-photo').hidden = false;
    let canShareFiles = false;
    try { canShareFiles = Boolean(navigator.share && navigator.canShare?.({ files: [file] })); } catch { /* Keep download. */ }
    $('#share-photo-button').hidden = !canShareFiles;
    $('#share-photo-button').disabled = !canShareFiles;
    $('#share-status').textContent = t('photoReady');
  } catch {
    if (sequence === shareSequence && shareDialog.open) $('#share-status').textContent = t('photoFailed');
  } finally {
    if (sequence === shareSequence) sharePhotoLoading = false;
  }
}

async function sharePreparedPhoto() {
  if (!sharedPost) return;
  const sequence = shareSequence;
  $('#share-photo-button').disabled = true;
  try {
    // No fetch/decode awaits here: the tap must reach navigator.share directly.
    await navigator.share(sharedPost);
    if (sequence === shareSequence && shareDialog.open) shareDialog.close();
  } catch (error) {
    if (sequence === shareSequence && error.name !== 'AbortError') $('#share-status').textContent = t('photoFallback');
  } finally {
    if (sequence === shareSequence) $('#share-photo-button').disabled = false;
  }
}

async function copyPostLink() {
  if (!sharedLink) return;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(sharedLink.url);
    $('#announcement').textContent = t('copied');
    if (shareDialog.open) shareDialog.close();
  } catch {
    shareLink.hidden = false;
    shareLink.focus();
    shareLink.select();
    $('#share-status').textContent = t('manualCopy');
  }
}

function showAdded(entry, opener, updated = false) {
  lastAddedId = entry.id;
  lastAddedOpener = opener;
  $('#added-message').textContent = `${t(updated ? 'updated' : 'added')} · ${name(entry)}`;
  const addedNotice = $('#added-notice');
  addedNotice.hidden = false;
  pulseTap(addedNotice);
  pulseTap($('#selection-bar'));
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => {
    const notice = $('#added-notice');
    if (!notice.contains(document.activeElement)) notice.hidden = true;
  }, 6000);
}

function renderMoments() {
  $('#moments').innerHTML = `<div class="discovery-heading"><div><p class="eyebrow">${t('momentsHint')}</p><h3 id="moments-title">${t('momentsTitle')}</h3></div></div>
    <div class="moment-list" role="group" aria-label="${t('momentsTitle')}">${moments.map(moment => `
      <button type="button" class="moment-card" data-moment="${moment.id}" aria-pressed="${activeMoment === moment.id}" aria-controls="results">
        <span class="moment-photo">${itemImage(items.get(moment.image))}</span>
        <span class="moment-copy"><strong>${moment.labels[language]}</strong><small>${moment.captions[language]}</small></span>
      </button>`).join('')}</div>`;
}

let favoritesPersisted = true;
function persistFavoriteCombos() {
  try { localStorage.setItem(favoriteCombosKey, JSON.stringify(favoriteCombos)); return true; }
  catch { return false; }
}

function renderFavoriteCombos() {
  const area = $('#favorite-combos');
  area.hidden = !favoriteCombos.length;
  if (!favoriteCombos.length) { area.innerHTML = ''; return; }
  area.innerHTML = `<div class="discovery-heading"><div><p class="eyebrow">${t(favoritesPersisted ? 'savedCombosHint' : 'comboSessionNotice')}</p><h3 id="favorite-combos-title">${t('savedCombosTitle')}</h3></div></div>
    <div class="favorite-list">${favoriteCombos.map(id => {
      const entry = orderItem(id);
      const choice = comboChoice(entry);
      const drink = items.get(choice.drinkId);
      const details = [t(isTakeaway(entry) ? 'takeaway' : 'dineIn'), optionLabels(entry, language)].filter(Boolean).join(' · ');
      return `<article class="favorite-card">
        <button type="button" class="favorite-open" data-favorite-combo="${id}" aria-label="${t('openComboFavorite')} · ${description(entry)}">
          <span class="favorite-photos">${itemImage(items.get(choice.foodId))}${itemImage(drink)}</span>
          <span class="favorite-copy"><strong>${description(entry)}</strong><small>${details}</small><b>${price(entry.price)}</b></span>
        </button>
        <button type="button" class="favorite-remove" data-remove-favorite="${id}" aria-label="${t('removeComboFavorite')} · ${description(entry)}">${icon('close')}</button>
      </article>`;
    }).join('')}</div>`;
}

function toggleFavoriteCombo() {
  const id = builtComboId(focacciaDraft);
  if (!comboChoice(orderItem(id))) return;
  const removing = favoriteCombos.includes(id);
  favoriteCombos = removing ? favoriteCombos.filter(savedId => savedId !== id) : [...favoriteCombos, id];
  favoritesPersisted = persistFavoriteCombos();
  renderFavoriteCombos();
  renderFocacciaPromo();
  const status = $('#combo-pick-status');
  status.textContent = t(favoritesPersisted ? (removing ? 'comboRemovedNotice' : 'comboSavedNotice') : 'comboSessionNotice');
  status.hidden = false;
  $('#favorite-current-combo').focus({ preventScroll: true });
}

function renderFocacciaTeaser() {
  const teaser = $('#focaccia-teaser');
  teaser.hidden = false;
  const minimum = Math.min(...comboFoodIds.map(id => items.get(id).price)) + Math.min(...comboDrinkIds.map(id => items.get(id).price));
  teaser.innerHTML = `<span class="focaccia-teaser-photo">${itemImage(items.get('smoked-turkey'))}</span><span class="focaccia-teaser-copy"><small>${t('focacciaTitle')}</small><strong>${t('focacciaBanner')}</strong><span>${t('comboFrom')} ${price(minimum)}</span></span>${icon('chevron')}`;
}

function comboSelect(field, title, options, value) {
  return `<label class="combo-select"><span id="combo-${field}-label">${title}</span><select id="combo-${field}" aria-labelledby="combo-${field}-label" data-combo-field="${field}">${options.map(option => `<option value="${option.id}"${option.id === value ? ' selected' : ''}>${option.label}</option>`).join('')}</select></label>`;
}

function renderFocacciaPromo() {
  const drink = items.get(focacciaDraft.drinkId);
  const supported = customization(drink);
  if (!supported.milk) focacciaDraft.milk = 'standard';
  if (!supported.syrup) focacciaDraft.syrup = 'none';
  const entry = orderItem(builtComboId(focacciaDraft));
  const food = items.get(focacciaDraft.foodId);
  focacciaOffer = selectedComboOffer(selection, items, orderItem, focacciaDraft, { editId: focacciaDraft.editId, limit: maxQuantity });
  const quantity = focacciaDraft.editId ? selection.get(focacciaDraft.editId) ?? 1 : 1;
  const base = items.get(entry.baseId ?? entry.id);
  const before = base?.before ? base.before + entry.price - base.price : entry.price;
  const saving = before - entry.price;
  const delta = focacciaOffer ? `${focacciaOffer.delta < 0 ? '−' : '+'}${price(Math.abs(focacciaOffer.delta))}` : '';
  const action = focacciaDraft.editId ? 'comboSave' : focacciaOffer?.kind === 'combine' ? 'comboJoin' : focacciaOffer?.kind === 'upgrade' ? 'focacciaUpgrade' : focacciaDraft.serving === 'takeaway' ? 'focacciaAction' : 'comboAdd';
  const advancedOpen = Boolean($('#focaccia-content .combo-advanced[open]'));
  const budgetOpen = Boolean($('#focaccia-content .combo-budget[open]'));
  const favorite = favoriteCombos.includes(builtComboId(focacciaDraft));
  const serving = t(focacciaDraft.serving === 'takeaway' ? 'takeaway' : 'dineIn');
  const drinkPhoto = (focacciaDraft.serving === 'takeaway' && items.get(`to-go-${drink.id}`)) || drink;
  $('#focaccia-service').textContent = serving;
  $('#focaccia-content').innerHTML = `<div class="focaccia-hero"><div class="focaccia-food">${itemImage(food, false)}</div><div class="focaccia-drink">${itemImage(drinkPhoto, false)}<span>${icon('cup')}${serving}</span></div><small class="focaccia-illustration">${t('illustration')}</small></div>
    <div class="focaccia-copy"><h2 id="focaccia-title">${t('focacciaTitle')}</h2>
      <div class="combo-selectors">
        ${comboSelect('foodId', t('comboFood'), comboFoodIds.map(id => ({ id, label: `${name(items.get(id))} · ${price(items.get(id).price)}` })), focacciaDraft.foodId)}
        ${comboSelect('drinkId', t('comboDrinkSelect'), comboDrinkIds.map(id => ({ id, label: `${name(items.get(id))} · ${price(items.get(id).price)}` })), focacciaDraft.drinkId)}
      </div><p class="combo-ingredients">${description(food)}</p>
      <div class="combo-personal-actions">
        <button type="button" class="combo-alternative" id="another-combo"><span aria-hidden="true">↻</span> ${t('anotherCombo')}</button>
        <button type="button" class="combo-favorite" id="favorite-current-combo" aria-pressed="${favorite}">${icon('bookmark')} ${t(favorite ? 'savedComboFavorite' : 'saveComboFavorite')}</button>
      </div>
      <details class="combo-budget"${budgetOpen ? ' open' : ''}><summary>${t('comboBudget')}</summary>
        ${comboSelect('budget', t('comboBudget'), [{ id: '0', label: t('comboAnyBudget') }, ...[350, 450, 550, 700].map(value => ({ id: String(value), label: `${t('comboUpTo')} ${price(value)}` }))], focacciaDraft.budget)}
      </details>
      <p id="combo-pick-status" class="combo-pick-status" role="status" hidden></p>
      <details class="combo-advanced"${advancedOpen ? ' open' : ''}><summary>${t('comboOptions')}</summary>
        ${comboSelect('serving', t('serviceMode'), [{ id: 'takeaway', label: t('takeaway') }, { id: 'cafe', label: t('dineIn') }], focacciaDraft.serving)}
        ${supported.milk ? comboSelect('milk', t('milk'), milkOptions.map(option => ({ id: option.id, label: `${option.labels[language]} · ${option.id === 'standard' ? t('included') : `+${price(items.get('plant-milk').price)}`}` })), focacciaDraft.milk) : ''}
        ${supported.syrup ? comboSelect('syrup', t('syrup'), syrupOptions.map(option => ({ id: option.id, label: `${option.labels[language]} · ${option.id === 'none' ? t('included') : `+${price(items.get('syrup').price)}`}` })), focacciaDraft.syrup) : ''}
      </details>
      <div class="focaccia-price"><div><small>${t(quantity > 1 ? 'comboOne' : 'focacciaBoth')}</small><strong>${price(entry.price)}</strong>${saving ? `<del>${price(before)}</del>` : ''}</div>${saving ? `<span>${t('quickSavings')} ${price(saving)}</span>` : ''}</div>
      ${!saving ? `<p class="combo-price-note">${t('comboMenuSum')}</p>` : ''}
      ${quantity > 1 ? `<p class="combo-price-note">${t('comboEditQuantity')}: ${quantity} · ${t('total')}: ${price(entry.price * quantity)}</p>` : ''}
      ${focacciaOffer?.remove.length && !focacciaDraft.editId ? `<p class="focaccia-replacement">${t('focacciaReplace')}: ${focacciaOffer.remove.map(([id]) => name(orderItem(id))).join(' + ')}.<br>${t('focacciaDelta')}: <strong>${delta}</strong></p>` : ''}
      <div id="combo-nutrition"></div><p class="focaccia-note">${t('focacciaTakeNote')}</p>${!focacciaOffer ? `<p class="nutrition-changed" role="alert">${t('quantityLimit')}</p>` : ''}
    </div>`;
  fillNutrition($('#combo-nutrition'), entry, { changed: focacciaDraft.milk !== 'standard' || focacciaDraft.syrup !== 'none' });
  $('#accept-focaccia').disabled = !focacciaOffer;
  $('#accept-focaccia').innerHTML = `<span>${t(action)}</span><strong>${focacciaDraft.editId ? price(entry.price * quantity) : focacciaOffer?.remove.length ? delta : price(entry.price)}</strong>${icon('arrow')}`;
  $('#focaccia-later').textContent = t('focacciaLater');
  $('#combo-price-status').textContent = `${name(food)} + ${name(drink)} · ${t('total')} ${price(entry.price * quantity)}`;
}

function openFocacciaPromo(opener, automatic = false, editId = null, initialChoice = null) {
  const openDialog = document.querySelector('dialog[open]');
  if ((openDialog && (automatic || (openDialog !== cart && openDialog !== viewer))) || (automatic && (focacciaSeen || document.hidden))) return false;
  if (automatic) {
    if (document.activeElement?.matches('input, textarea, select, [contenteditable="true"]')) return false;
    const menuBounds = $('#menu').getBoundingClientRect();
    if (menuBounds.bottom <= 0 || menuBounds.top >= innerHeight) return false;
  }
  const offer = focacciaTakeawayOffer(selection, items, orderItem);
  if (automatic && (!offer || (selection.size && !offer.remove.length))) return false;
  const choice = initialChoice ?? comboChoice(orderItem(offer?.addId ?? 'to-go-lunch-favourite'));
  focacciaDraft = { ...choice, editId, budget: '0' };
  focacciaOpener = opener;
  focacciaSeen = true;
  clearTimeout(focacciaAutoTimer);
  focacciaAutoTimer = null;
  try { sessionStorage.setItem('pocitel-focaccia-offer-v1', 'seen'); } catch { /* Still once in this page visit. */ }
  renderFocacciaPromo();
  focacciaPromo.showModal();
  $('#focaccia-content').scrollTop = 0;
  return true;
}

function scheduleFocacciaPromo(delay = 8000) {
  if (focacciaSeen || linkedItem) return;
  if (focacciaAutoTimer) {
    if (delay >= 8000) return;
    clearTimeout(focacciaAutoTimer);
  }
  focacciaAutoTimer = setTimeout(() => {
    focacciaAutoTimer = null;
    openFocacciaPromo($('#focaccia-teaser'), true);
  }, delay);
}

function acceptFocacciaPromo() {
  const next = applyCheckoutOffer(selection, focacciaOffer, orderItem, maxQuantity);
  if (!next) { renderFocacciaPromo(); return; }
  const changedId = focacciaOffer.addId;
  focacciaTransaction = { before: [...selection], after: selectionSignature(next) };
  selection.clear();
  next.forEach((quantity, id) => selection.set(id, quantity));
  suggestionsDismissed = true;
  offerTransaction = null;
  persistSelection();
  focacciaPromo.close();
  if (viewer.open) viewer.close();
  if (cart.open) {
    renderCart();
    cartItems.querySelector(`[data-edit="${changedId}"]`)?.focus({ preventScroll: true });
  } else openCart($('.top [data-open-cart]'));
  $('#announcement').textContent = `${t('focacciaAdded')} ${t('total')} ${price(selectionTotal())}`;
}

function undoFocacciaPromo() {
  const previous = undoCheckoutOffer(selection, focacciaTransaction);
  focacciaTransaction = null;
  if (!previous) { renderCart(); return; }
  selection.clear();
  previous.forEach((quantity, id) => selection.set(id, quantity));
  persistSelection();
  $('#close-cart').focus({ preventScroll: true });
  $('#announcement').textContent = t('offerUndone');
}

function addToSelection(id, opener) {
  if ((selection.get(id) ?? 0) >= maxQuantity) {
    $('#announcement').textContent = t('quantityLimit');
    return;
  }
  changeSelection(id, 1);
  if (viewer.open) {
    viewer.close();
    opener = postOpener;
  }
  opener?.focus({ preventScroll: true });
  showAdded(orderItem(id), opener);
}

function renderCounts() {
  const count = [...selection.values()].reduce((sum, quantity) => sum + quantity, 0);
  document.querySelectorAll('[data-count]').forEach(node => { node.textContent = count; });
  document.querySelectorAll('[data-open-cart]').forEach(node => node.setAttribute('aria-label', `${t('cart')} (${count})`));
  $('#selection-bar').hidden = count === 0;
  $('#bar-total').textContent = price(selectionTotal());
  renderFocacciaTeaser();
}

function selectionTotal() {
  return [...selection].reduce((sum, [id, quantity]) => sum + orderItem(id).price * quantity, 0);
}

function renderCartSuggestion() {
  const offer = $('#cart-suggestion');
  if (offerTransaction && offerTransaction.after !== selectionSignature(selection)) {
    offerTransaction = null;
    suggestionsDismissed = true;
  }
  if (!offerTransaction) checkoutOffer = suggestionsDismissed ? null : recommendCheckout(selection, items, orderItem);
  offer.hidden = !checkoutOffer;
  if (!checkoutOffer) { offer.innerHTML = ''; return; }
  const next = orderItem(checkoutOffer.addId);
  const applied = Boolean(offerTransaction);
  const titleKey = checkoutOffer.kind === 'combine' ? 'combineTitle' : checkoutOffer.kind === 'upgrade' ? 'upgradeTitle' : 'oneMoreTouch';
  const actionKey = checkoutOffer.kind === 'combine' ? 'combineOffer' : checkoutOffer.kind === 'upgrade' ? 'upgradeOffer' : 'addOffer';
  const delta = checkoutOffer.delta < 0 ? `−${price(-checkoutOffer.delta)}` : `+${price(checkoutOffer.delta)}`;
  offer.classList.toggle('offer-selected', applied);
  offer.innerHTML = `
    <p class="eyebrow">${t(titleKey)}</p>
    <div class="checkout-offer-product">
      <div class="checkout-offer-photo">${itemImage(next, false)}${illustrationLabel(next)}</div>
      <div><h3>${name(next)}</h3><p>${t(`${checkoutOffer.reason}Reason`)}</p>
        ${description(next) ? `<small>${description(next)}</small>` : ''}
        ${optionLabels(next, language) ? `<small>${optionLabels(next, language)}</small>` : ''}
      </div>
    </div>
    ${checkoutOffer.remove.length ? `<p class="offer-replacement">${t(checkoutOffer.remove.length === 1 ? 'offerReplacesSingle' : 'offerReplaces')}: ${checkoutOffer.remove.map(([id]) => name(orderItem(id))).join(' + ')}.</p>` : ''}
    <label class="checkout-offer-toggle">
      <input type="checkbox" id="checkout-offer-toggle" ${applied ? 'checked' : ''}>
      <span>${t(applied ? 'offerAdded' : actionKey)}</span><strong>${delta}</strong>
    </label>
    <div class="offer-bottom"><small>${t(applied ? 'total' : 'offerPriceAfter')} <b>${price(selectionTotal() + (applied ? 0 : checkoutOffer.delta))}</b></small>
    ${applied ? '' : `<button type="button" class="skip-extras" id="skip-extras">${t('skipExtras')}</button>`}</div>`;
}

function toggleCheckoutOffer() {
  const removing = Boolean(offerTransaction);
  const next = removing ? undoCheckoutOffer(selection, offerTransaction) : applyCheckoutOffer(selection, checkoutOffer, orderItem, maxQuantity);
  if (!next) { renderCart(); return; }
  offerTransaction = removing ? null : { before: [...selection], after: selectionSignature(next) };
  selection.clear();
  next.forEach((quantity, id) => selection.set(id, quantity));
  persistSelection();
  $('#checkout-offer-toggle')?.focus({ preventScroll: true });
  $('#announcement').textContent = `${t(removing ? 'offerUndone' : 'offerApplied')} ${t('total')} ${price(selectionTotal())}`;
}

function renderCart() {
  if (focacciaTransaction && focacciaTransaction.after !== selectionSignature(selection)) focacciaTransaction = null;
  $('#focaccia-undo').hidden = !focacciaTransaction;
  const rows = [...selection].map(([id, quantity]) => {
    const entry = orderItem(id);
    return `<article class="cart-row">
      <div class="cart-product-image">${itemImage(entry)}</div>
      <div class="cart-product-copy"><h3>${name(entry)}</h3><small class="service-tag">${t(isTakeaway(entry) ? 'takeaway' : 'dineIn')}</small>${entry.before || entry.isBuiltCombo ? `<p class="cart-description">${description(entry)}</p>` : ''}${optionLabels(entry, language) ? `<small class="line-options">${optionLabels(entry, language)}</small>` : ''}
        <button type="button" class="edit-line" data-edit="${id}" aria-label="${t('edit')} · ${name(entry)}">${t('edit')}</button>
      </div>
      <div class="quantity cart-quantity">
        <button type="button" class="icon-button" data-quantity="-1" data-item="${id}" aria-label="${t('remove')} · ${name(entry)}">${icon('minus')}</button>
        <span>${quantity}</span>
        <button type="button" class="icon-button" data-quantity="1" data-item="${id}" aria-label="${t('add')} · ${name(entry)}" ${quantity === maxQuantity ? 'disabled' : ''}>${icon('plus')}</button>
      </div>
      <strong>${price(quantity * entry.price)}</strong>
    </article>`;
  }).join('');
  cartItems.innerHTML = rows || `<p class="empty">${t('emptyCart')}</p>`;
  $('#cart .checkout-intro').hidden = !selection.size;
  renderCartSuggestion();
  $('#cart-total').hidden = !selection.size;
  $('#show-waiter').hidden = !selection.size;
  $('#total-price').textContent = price(selectionTotal());
  $('#checkout-button-total').textContent = price(selectionTotal());
  const savings = checkoutSavings(selection, items, orderItem);
  $('#checkout-savings').hidden = !savings;
  $('#checkout-saving-price').textContent = `−${price(savings)}`;
  $('#checkout-before-price').textContent = price(selectionTotal() + savings);
  $('#checkout-help').hidden = !selection.size;
  $('#checkout-items-label').hidden = !selection.size;
  $('#checkout-picture-note').hidden = ![...selection.keys()].some(id => { const entry = orderItem(id); return entry.sourceId || entry.image.startsWith('illustrations/'); });
}

function renderWaiter() {
  $('#waiter-items').innerHTML = [...selection].map(([id, quantity]) => {
    const entry = orderItem(id);
    return `<li><div class="waiter-photo">${itemImage(entry, false)}<span class="waiter-quantity">${quantity}×</span></div>
      <div class="waiter-item-copy"><strong>${entry.names[0]}</strong>${language ? `<small lang="${languages[language]}">${name(entry)}</small>` : ''}<p class="service-tag">${copy[isTakeaway(entry) ? 'takeaway' : 'dineIn'][0]}</p>${optionLabels(entry, 0) ? `<p class="line-options">${optionLabels(entry, 0)}</p>` : ''}${entry.before || entry.isBuiltCombo ? `<p>${entry.descriptions[0]}</p>` : ''}
      <span class="waiter-price">${price(entry.price * quantity, locales[0])}</span></div></li>`;
  }).join('');
  $('#waiter-total').textContent = price(selectionTotal(), locales[0]);
  $('#waiter-take-note').hidden = ![...selection.keys()].some(id => isTakeaway(orderItem(id)));
  const savings = checkoutSavings(selection, items, orderItem);
  $('#waiter-savings').hidden = !savings;
  $('#waiter-savings').textContent = `Eşleşme avantajınız: ${price(savings, locales[0])}`;
}

function persistSelection() {
  writeSetting(selectionKey, JSON.stringify([...selection]));
  if (!selection.size) { suggestionsDismissed = false; offerTransaction = null; checkoutOffer = null; }
  renderCounts();
  if (cart.open) renderCart();
}

function changeSelection(id, delta) {
  const previous = selection.get(id) ?? 0;
  const next = Math.min(previous + delta, maxQuantity);
  if (next < 0 || next === previous) return;
  if (next) selection.set(id, next);
  else selection.delete(id);
  persistSelection();
  $('#announcement').textContent = `${name(orderItem(id))} · ${next}`;
}

function applyLanguage() {
  document.documentElement.lang = languages[language];
  document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed', button.dataset.lang === languages[language]));
  document.querySelectorAll('[data-copy]').forEach(node => { node.textContent = t(node.dataset.copy); });
  for (const [attribute, key] of [['aria-label', 'aria'], ['placeholder', 'placeholder'], ['alt', 'alt']]) {
    document.querySelectorAll(`[data-${key}]`).forEach(node => node.setAttribute(attribute, t(node.dataset[key])));
  }
  $('#current-language').textContent = languages[language].toUpperCase();
  renderServiceMode();
  renderResults();
  renderCounts();
  renderMoments();
  renderFavoriteCombos();
  if (focacciaPromo.open) renderFocacciaPromo();
}

for (const entry of items.values()) {
  entry.searchText = normalize([...entry.names, ...entry.descriptions].join(' '));
}

let cartOpener;

function openCart(opener) {
  cartOpener = opener;
  $('#added-notice').hidden = true;
  renderCart();
  cart.showModal();
}

document.addEventListener('click', event => {
  if (event.target.closest('.settings-visit')) settings.close();
  const jump = event.target.closest('[data-jump]');
  if (jump) {
    event.preventDefault();
    activeMoment = null;
    takeawayMode = false;
    activeCategory = jump.dataset.jump;
    savedOnly = false;
    search.value = '';
    renderServiceMode();
    filterResults();
    scrollToMenuStart(true);
    return;
  }
  if (event.target.closest('a[href="#menu"]:not(.skip)')) {
    event.preventDefault();
    scrollToMenuStart(true);
    return;
  }
  const button = event.target.closest('button');
  if (!button) return;
  const { lang, category, add, quantity, item, post, story, save, like, share, related, mode, edit, moment, favoriteCombo, removeFavorite } = button.dataset;
  if (moment) {
    activeMoment = activeMoment === moment ? null : moment;
    const selected = moments.find(option => option.id === activeMoment);
    takeawayMode = selected?.mode === 'takeaway';
    activeCategory = 'all';
    savedOnly = false;
    search.value = '';
    renderServiceMode();
    filterResults();
    document.querySelector(`[data-moment="${moment}"]`)?.focus({ preventScroll: true });
    scrollToMenuStart();
  } else if (favoriteCombo) {
    const choice = comboChoice(orderItem(favoriteCombo));
    if (choice) openFocacciaPromo(button, false, null, choice);
  } else if (removeFavorite) {
    favoriteCombos = favoriteCombos.filter(id => id !== removeFavorite);
    favoritesPersisted = persistFavoriteCombos();
    renderFavoriteCombos();
    ($('#favorite-combos .favorite-open') ?? $('#focaccia-teaser')).focus({ preventScroll: true });
    $('#announcement').textContent = t(favoritesPersisted ? 'comboRemovedNotice' : 'comboSessionNotice');
  } else if (button.id === 'another-combo') {
    const next = nextComboChoice(focacciaDraft, orderItem, focacciaDraft.budget);
    if (!next) {
      $('#combo-pick-status').textContent = t('comboNoAlternative');
      $('#combo-pick-status').hidden = false;
    } else {
      focacciaDraft = next;
      renderFocacciaPromo();
      $('#another-combo').focus({ preventScroll: true });
    }
  } else if (button.id === 'favorite-current-combo') {
    toggleFavoriteCombo();
  } else if (button.id === 'focaccia-teaser') {
    openFocacciaPromo(button);
  } else if (button.id === 'close-focaccia' || button.id === 'focaccia-later') {
    focacciaPromo.close();
  } else if (button.id === 'accept-focaccia') {
    acceptFocacciaPromo();
  } else if (button.id === 'undo-focaccia') {
    undoFocacciaPromo();
  } else if (button.dataset.nutritionRetry) {
    const entry = orderItem(button.dataset.nutritionRetry);
    fillNutrition(button.parentElement, entry, { open: true, changed: (entry.milk && entry.milk !== 'standard') || (entry.syrup && entry.syrup !== 'none') });
  } else if (button.id === 'open-settings') {
    settings.showModal();
  } else if (button.id === 'close-settings' || button.id === 'done-settings') {
    settings.close();
  } else if (button.id === 'toggle-search') {
    const panel = $('#search-panel');
    panel.hidden = !panel.hidden;
    button.setAttribute('aria-expanded', !panel.hidden);
    if (panel.hidden) { search.value = ''; filterResults(); }
    else search.focus({ preventScroll: true });
  } else if (button.id === 'edit-added') {
    if (selection.has(lastAddedId)) openConfigurator(lastAddedId, lastAddedOpener, lastAddedId);
    $('#added-notice').hidden = true;
  } else if (button.id === 'dismiss-added') {
    $('#added-notice').hidden = true;
    lastAddedOpener?.focus({ preventScroll: true });
  } else if (lang) {
    language = languages.indexOf(lang);
    writeSetting(languageKey, lang);
    applyLanguage();
  } else if (category) {
    activeMoment = null;
    activeCategory = category;
    filterResults();
    scrollToMenuStart();
  } else if (mode && (mode === 'takeaway') !== takeawayMode) {
    activeMoment = null;
    takeawayMode = mode === 'takeaway';
    activeCategory = 'all';
    savedOnly = false;
    search.value = '';
    renderServiceMode();
    filterResults();
    scrollToMenuStart();
    if (takeawayMode) scheduleFocacciaPromo(600);
  } else if (button === savedFilter) {
    activeMoment = null;
    savedOnly = !savedOnly;
    if (savedOnly) {
      activeCategory = 'all';
      search.value = '';
    }
    filterResults();
    scrollToMenuStart();
  } else if (button.id === 'more-posts') {
    visibleLimit += pageSize;
    renderResults(true);
  } else if (like) {
    handleLike(like, button);
  } else if (post) {
    openPost([post], button);
  } else if (related) {
    openedPost = { ids: [related], index: 0 };
    $('#story-controls').hidden = true;
    renderViewer();
    handleView(related);
    viewer.scrollTop = 0;
    $('#close-post').focus();
  } else if (save) {
    toggleSaved(save, button);
  } else if (share) {
    sharePost(button, share);
  } else if (button.id === 'copy-link') {
    copyPostLink();
  } else if (button.id === 'share-photo-button') {
    sharePreparedPhoto();
  } else if (button.id === 'close-share') {
    shareDialog.close();
  } else if (button.id === 'close-post') {
    viewer.close();
  } else if (button.id === 'previous-story' || button.id === 'next-story') {
    stepStory(button.id === 'previous-story' ? -1 : 1);
  } else if (add) {
    addToSelection(add, button);
  } else if (button.dataset.customize) {
    openConfigurator(button.dataset.customize, button);
  } else if (edit) {
    openConfigurator(edit, button, edit);
  } else if (button.id === 'close-configure') {
    configure.close();
  } else if (button.id === 'confirm-configure') {
    confirmConfiguration();
  } else if (button.id === 'configure-minus' || button.id === 'configure-plus') {
    draft.quantity += button.id === 'configure-minus' ? -1 : 1;
    updateConfigurationTotal();
    if (button.disabled) (button.id === 'configure-minus' ? $('#configure-plus') : $('#configure-minus')).focus();
  } else if (button.id === 'skip-extras') {
    suggestionsDismissed = true;
    renderCartSuggestion();
    $('#show-waiter').focus();
  } else if (quantity) {
    changeSelection(item, Number(quantity));
    const replacement = cartItems.querySelector(`[data-item="${item}"][data-quantity="${quantity}"]:not(:disabled)`);
    (replacement ?? cartItems.querySelector('button') ?? $('#close-cart')).focus();
  } else if (button.hasAttribute('data-open-cart')) {
    openCart(button);
  } else if (button.id === 'show-waiter' && selection.size) {
    renderWaiter();
    waiter.showModal();
    waiter.scrollTop = 0;
  } else if (button.id === 'close-waiter') {
    waiter.close();
  } else if (button.id === 'close-cart') {
    cart.close();
  } else if (button.id === 'back-to-menu') {
    cart.close('menu');
  } else if (button.id === 'clear-search') {
    clearSearch();
  }
});

settings.addEventListener('close', () => $('#open-settings').focus({ preventScroll: true }));
focacciaPromo.addEventListener('close', () => {
  if (!cart.open && focacciaOpener?.isConnected && !focacciaOpener.hidden) focacciaOpener.focus({ preventScroll: true });
});

cart.addEventListener('change', event => {
  if (event.target.id === 'checkout-offer-toggle') toggleCheckoutOffer();
});
waiter.addEventListener('close', () => $('#show-waiter').focus({ preventScroll: true }));

configure.addEventListener('change', event => {
  const input = event.target;
  if (input.name === 'milk' || input.name === 'syrup') {
    draft[input.name] = input.value;
    updateConfigurationTotal();
    return;
  }
  if (input.name === 'serving') draft.itemId = input.value === 'takeaway' ? `to-go-${draft.singleId}` : draft.singleId;
  else if (input.name === 'version') draft.itemId = input.value;
  else return;
  renderConfigurator();
  configure.querySelector(`input[name="${input.name}"][value="${input.value}"]`)?.focus({ preventScroll: true });
});
configure.addEventListener('close', () => {
  if (configure.returnValue === 'saved') {
    configure.returnValue = '';
    return;
  }
  if (configureOpener?.isConnected) configureOpener.focus({ preventScroll: true });
});

function clearSearch() {
  search.value = '';
  filterResults();
  search.focus();
}

search.addEventListener('input', filterResults);
search.addEventListener('keydown', event => {
  if (event.key === 'Escape' && search.value) {
    event.preventDefault();
    clearSearch();
  }
});
cart.addEventListener('close', () => {
  if (cart.returnValue === 'menu') {
    cart.returnValue = '';
    $('#filters button[aria-pressed="true"]')?.focus({ preventScroll: true });
    scrollToMenuStart();
  } else {
    cartOpener?.focus();
  }
});

viewer.addEventListener('close', () => {
  if (!cart.open) (postOpener?.isConnected ? postOpener : savedFilter).focus({ preventScroll: true });
});
$('#share-extras').addEventListener('toggle', () => {
  if ($('#share-extras').open) prepareFallbackPhoto();
});
shareDialog.addEventListener('close', () => {
  shareSequence++;
  sharedPost = null;
  sharedLink = null;
  sharedItemId = null;
  sharePhotoLoading = false;
  if (sharePhotoUrl) URL.revokeObjectURL(sharePhotoUrl);
  sharePhotoUrl = undefined;
  if (shareOpener?.isConnected) shareOpener.focus({ preventScroll: true });
});
viewer.addEventListener('keydown', event => {
  if (event.target.matches('[data-cutaway-range]')) return;
  if (openedPost.story && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    stepStory(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
viewerContent.addEventListener('touchstart', event => {
  if (event.target.closest('.cutaway')) { touchOrigin = null; return; }
  touchOrigin = event.target.closest('.viewer-photo') && event.touches.length === 1
    ? event.touches[0]
    : null;
}, { passive: true });
viewerContent.addEventListener('touchend', event => {
  if (!touchOrigin) return;
  const { clientX, clientY } = event.changedTouches[0];
  const dx = clientX - touchOrigin.clientX;
  const dy = clientY - touchOrigin.clientY;
  touchOrigin = null;
  if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) stepStory(dx < 0 ? 1 : -1);
}, { passive: true });

function updateCutaway(range, amount) {
  const cutaway = range.closest('.cutaway');
  if (!cutaway || !Number.isFinite(amount)) return;
  range.value = amount;
  cutaway.style.setProperty('--cutaway-split', `${amount}%`);
  range.setAttribute('aria-valuetext', `${t('cutawayShown')} ${100 - amount}%`);
  const toggle = viewerContent.querySelector('[data-cutaway-toggle]');
  toggle.setAttribute('aria-pressed', String(amount === 0));
  toggle.textContent = t(amount === 0 ? 'cutawayHide' : 'cutawayShow');
  toggle.setAttribute('aria-label', toggle.textContent);
}

viewerContent.addEventListener('input', event => {
  if (!event.target.matches('[data-cutaway-range]')) return;
  updateCutaway(event.target, Number(event.target.value));
});

viewerContent.addEventListener('click', event => {
  if (!event.target.closest('[data-cutaway-toggle]')) return;
  const range = viewerContent.querySelector('[data-cutaway-range]');
  updateCutaway(range, Number(range.value) === 0 ? 100 : 0);
});

window.addEventListener('storage', event => {
  if (event.key !== engagementKey) return;
  engagement = restoreEngagement(event.newValue, items.keys());
  for (const id of items.keys()) refreshEngagement(id);
});

applyLanguage();
$('#service-picker').hidden = false;
if (items.has(linkedItem)) openPost([linkedItem], results.querySelector(`[data-post="${linkedItem}"]`) ?? search);
else if (location.hash === '#pairings') scrollToMenuStart();

if (!linkedItem && !focacciaSeen && 'IntersectionObserver' in window) {
  const offerObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      scheduleFocacciaPromo();
      offerObserver.disconnect();
    }
  }, { threshold: .5 });
  offerObserver.observe($('#result-meta'));
}

// Native selects retain their focus when dependent choices and prices rerender.
focacciaPromo.addEventListener('change', event => {
  const field = event.target.dataset.comboField;
  if (!['foodId', 'drinkId', 'serving', 'milk', 'syrup', 'budget'].includes(field)) return;
  focacciaDraft[field] = event.target.value;
  renderFocacciaPromo();
  $(`#combo-${field}`)?.focus({ preventScroll: true });
});
