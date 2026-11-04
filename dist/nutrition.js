import { ingredients, nutritionData, vitaminProfiles, benefitProfiles, comboParts } from './nutrition-data.js?v=20261104-nutrition';

const copy = {
  title: ['İçerik ve besin bilgisi', 'Ingredients & nutrition', 'Состав и пищевая ценность'],
  ingredients: ['İçindekiler', 'Ingredients', 'Состав'],
  menu: ['Menüde belirtilen ana içerik', 'Main ingredients listed in the menu', 'Основной состав из меню'],
  typical: ['Tipik tarif varsayımı · ekibimizle teyit edin', 'Assumed typical recipe · confirm with our team', 'Типовой рецепт · уточните у команды'],
  label: ['Üretici etiketindeki içerik', 'Ingredients on the manufacturer’s label', 'Состав по этикетке производителя'],
  benefits: ['Beslenmeye katkısı', 'Nutritional contribution', 'Что даёт организму'],
  vitamins: ['Malzemelerdeki vitaminler', 'Vitamins in the ingredients', 'Витамины в ингредиентах'],
  estimate: ['Tahmini', 'Estimated', 'Оценка'],
  base: ['Temel tarif', 'Base recipe', 'Базовый рецепт'],
  kcal: ['kcal', 'kcal', 'ккал'],
  basis: ['Hesaptaki örnek miktarlar', 'Assumed amounts used in the estimate', 'Примерные количества для расчёта'],
  unitG: ['g', 'g', 'г'],
  unitMl: ['ml', 'ml', 'мл'],
  note: [
    'Kafenin ölçülmüş besin değerleri değildir. Porsiyon, tarif ve markaya göre değişir. Ek şeker, şurup veya süt değişimi sonucu etkiler. Vitamin miktarları ölçülmemiştir.',
    'These are not measured café nutrition values. Portions, recipes and brands vary. Extra sugar, syrup or a milk substitution changes the result. Vitamin amounts have not been measured.',
    'Это оценка, а не измеренные данные кафе. Порция, рецепт и марка ингредиентов могут отличаться. Добавочный сахар, сироп и замена молока меняют результат. Количество витаминов не измерено.',
  ],
  take: ['Aynı örnek porsiyon için hesaplandı; gerçek paket boyutu farklı olabilir.', 'Uses the same assumed serving; the actual takeaway cup may differ.', 'Расчёт для той же примерной порции; фактический объём стакана с собой может отличаться.'],
  changed: ['Tarif değiştirildi. Aşağıdaki bilgiler süt / şurup değişikliğinden önceki temel tarif içindir.', 'Recipe changed. The information below is for the base recipe before your milk / syrup changes.', 'Рецепт изменён. Ниже — данные базового рецепта до выбранной замены молока / добавления сиропа.'],
  combo: ['Eşleşmenin tamamı; bileşen tahminlerinin toplamı', 'Whole pairing; sum of the component estimates', 'Всё комбо; сумма оценок входящих позиций'],
  sources: ['Bilgi kaynakları', 'Reference sources', 'Источники'],
  bread: ['Focaccia ekmeği; ', 'Focaccia bread; ', 'Хлеб фокачча; '],
};
export const nutritionCopy = copy;
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function recipeEnergy(recipe) {
  const totals = recipe.reduce((sum, [key, low, high]) => {
    const rate = ingredients[key]?.kcal;
    if (!rate || !Number.isFinite(low) || !Number.isFinite(high) || low < 0 || high < low) throw new Error(`Invalid nutrition component: ${key}`);
    return [sum[0] + rate[0] * low / 100, sum[1] + rate[1] * high / 100];
  }, [0, 0]);
  const step = totals[1] <= 30 ? 5 : 10;
  return [Math.floor((totals[0] + 1e-9) / step) * step, Math.ceil((totals[1] - 1e-9) / step) * step];
}

export function nutritionFor(entry, catalog) {
  if (!entry) return null;
  const id = entry.sourceId ?? entry.baseId ?? entry.id;
  const parts = comboParts[id]?.map(part => nutritionFor(catalog.get(part), catalog));
  if (parts) {
    if (parts.some(part => !part)) throw new Error(`Missing pairing nutrition: ${id}`);
    return { id, entry, parts, energy: parts.reduce((sum, part) => [sum[0] + part.energy[0], sum[1] + part.energy[1]], [0, 0]),
      vitamins: [...new Set(parts.flatMap(part => part.vitamins).filter(key => key !== 'none'))],
      benefits: [...new Set(parts.flatMap(part => part.benefits))] };
  }
  const data = nutritionData[id];
  if (!data) return null;
  return { ...data, id, entry, energy: recipeEnergy(data.recipe), benefits: [data.benefit] };
}

function ingredientText(record, language) {
  const text = record.ingredients?.[language] ?? record.entry.descriptions[language];
  return ['beetroot', 'smoked-turkey', 'zucchini'].includes(record.id) ? copy.bread[language] + text : text;
}
const amountText = (recipe, language) => recipe.map(([key, low, high]) => {
  const ingredient = ingredients[key];
  return `${ingredient.labels[language]} ${low === high ? low : `${low}–${high}`} ${copy[ingredient.unit === 'ml' ? 'unitMl' : 'unitG'][language]}`;
}).join(' · ');

export function nutritionMarkup(entry, language, catalog, { open = false, changed = false } = {}) {
  const record = nutritionFor(entry, catalog);
  if (!record) throw new Error(`Missing nutrition for ${entry?.id}`);
  const t = key => copy[key][language];
  const energy = record.energy.join('–');
  const components = record.parts ?? [record];
  const ingredientBlocks = components.map(part => `<p>${record.parts ? `<strong>${escape(part.entry.names[language])}</strong><br>` : ''}${escape(ingredientText(part, language))}<small class="nutrition-origin">${escape(t(part.basis))}</small></p>`).join('');
  const basis = components.map(part => `${record.parts ? `<strong>${escape(part.entry.names[language])}</strong> · ` : ''}${escape(part.portion[language])}<br><span>${escape(amountText(part.recipe, language))}</span>`).join('<br><br>');
  const vitamins = (record.vitamins.length ? record.vitamins : ['none']).map(key => escape(vitaminProfiles[key][language])).join(' ');
  return `<details class="nutrition-panel"${open ? ' open' : ''}>
    <summary><span>${t('title')}</span><span class="nutrition-energy"><small>${t(changed ? 'base' : 'estimate')}</small> ≈ ${energy} ${t('kcal')}</span></summary>
    <div class="nutrition-content">
      ${changed ? `<p class="nutrition-changed" role="status">${t('changed')}</p>` : ''}
      <p class="nutrition-portion">${escape(record.parts ? t('combo') : record.portion[language])}</p>
      <div><h3>${t('ingredients')}</h3>${ingredientBlocks}</div>
      <div><h3>${t('benefits')}</h3><p>${record.benefits.map(key => escape(benefitProfiles[key][language])).join(' ')}</p></div>
      <div><h3>${t('vitamins')}</h3><p>${vitamins}</p></div>
      <p class="nutrition-note">${t('note')}${entry.sourceId ? ` ${t('take')}` : ''}</p>
      <details class="nutrition-basis"><summary>${t('basis')}</summary><p>${basis}</p>
        <p class="nutrition-sources">${t('sources')}: <a href="https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/nutrient-data/nutrient-value-some-common-foods-2008.html" target="_blank" rel="noopener noreferrer">Health Canada</a> · <a href="https://www.nhs.uk/conditions/vitamins-and-minerals/" target="_blank" rel="noopener noreferrer">NHS</a> · <a href="https://www.nutella.com/tr/tr/products/spread/nutella" target="_blank" rel="noopener noreferrer">Nutella</a></p>
      </details>
    </div>
  </details>`;
}
