// An editorial selection from the catalog, never a ranking by sales or margin.
export const heroProducts = [
  { id:'focaccia', itemId:'smoked-turkey', labels:['Focaccia','Focaccia','Фокачча'] },
  { id:'brunch', itemId:'cilbir', labels:['Brunch','Brunch','Бранч'] },
  { id:'coffee', itemId:'cappuccino', labels:['Kahve','Coffee','Кофе'] },
];
const text = {
  choose:['Ne istersiniz?','What are you in the mood for?','Чего хочется сейчас?'],
  view:['İçeriği gör ve seç','View details & choose','Состав и выбор'],
  pairing:['Focaccia + içeceğini seç','Build focaccia + a drink','Собрать фокаччу + напиток'],
  pairingHelp:['İçeceği ve toplamı kendin seç.','Choose the drink and see the total.','Выберите напиток и проверьте общую цену.'],
  step:['Menüden bir fikir','An idea from our menu','Идея из нашего меню'],
  illustration:['Menü illüstrasyonu','Menu illustration','Иллюстрация блюда'],
};
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function showcaseMarkup(catalog,language=0,choice='focaccia') {
  const selected=heroProducts.find(entry=>entry.id===choice)??heroProducts[0];
  const entry=catalog.get(selected.itemId);
  const price=new Intl.NumberFormat(['tr-TR','en-GB','ru-RU'][language],{maximumFractionDigits:0}).format(entry.price)+' ₺';
  return `<div class="signature-choices" role="group" aria-label="${text.choose[language]}">${heroProducts.map(option=>`<button type="button" data-hero-choice="${option.id}" aria-pressed="${option.id===selected.id}">${option.labels[language]}</button>`).join('')}</div>
    <article class="signature-product" aria-labelledby="signature-title">
      <button type="button" class="signature-photo" data-hero-open="${entry.id}" aria-label="${escape(entry.names[language])} · ${text.view[language]}">
        <img src="assets/${entry.image}.webp" width="640" height="427" fetchpriority="high" alt="${escape(entry.names[language])}">
        ${entry.image.startsWith('illustrations/')?`<span class="signature-art-note">${text.illustration[language]}</span>`:''}
      </button>
      <div class="signature-details" aria-live="polite" aria-atomic="true">
        <p class="signature-kicker">${text.step[language]} <span>${heroProducts.indexOf(selected)+1} / 3</span></p>
        <div class="signature-title-row"><h2 id="signature-title">${escape(entry.names[language])}</h2><strong>${price}</strong></div>
        <p class="signature-description">${escape(entry.descriptions[language]??'')}</p>
        <button type="button" class="button primary signature-action" data-hero-open="${entry.id}">${text.view[language]} <span aria-hidden="true">↗</span></button>
      </div>
    </article>
    <button type="button" class="signature-pairing" data-home-pairing><span><strong>${text.pairing[language]}</strong><small>${text.pairingHelp[language]}</small></span><span aria-hidden="true">→</span></button>`;
}
