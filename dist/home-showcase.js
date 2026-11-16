// An editorial selection from the catalog, never a ranking by sales or margin.
export const heroProducts = [
  { id:'focaccia', itemId:'smoked-turkey', labels:['Focaccia','Focaccia','Фокачча'], actions:['Focaccia seç','Choose focaccia','Выбрать фокаччу'] },
  // Existing landscape crop of the same çılbır. A portrait image in a wide
  // contain frame makes the actual dish a narrow strip on a phone.
  { id:'brunch', itemId:'cilbir', labels:['Brunch','Brunch','Бранч'], actions:['Çılbırı keşfet','Explore çılbır','Посмотреть чылбыр'], cover:'hero-wide-640', cover2x:'hero-wide-960', width:640, height:388 },
  { id:'coffee', itemId:'cappuccino', labels:['Kahve','Coffee','Кофе'], actions:['Kahveni seç','Choose your coffee','Выбрать кофе'] },
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
  const image=selected.cover??entry.image;
  const position=String(heroProducts.indexOf(selected)+1).padStart(2,'0');
  const price=new Intl.NumberFormat(['tr-TR','en-GB','ru-RU'][language],{maximumFractionDigits:0}).format(entry.price)+' ₺';
  return `<div class="signature-choices" role="group" aria-label="${text.choose[language]}">${heroProducts.map(option=>`<button type="button" data-hero-choice="${option.id}" aria-pressed="${option.id===selected.id}">${option.labels[language]}</button>`).join('')}</div>
    <article class="signature-product" data-hero-product="${selected.id}" aria-labelledby="signature-title">
      <button type="button" class="signature-photo" data-hero-open="${entry.id}" aria-label="${escape(entry.names[language])} · ${text.view[language]}">
        <img src="assets/${image}.webp" ${selected.cover2x?`srcset="assets/${image}.webp 640w, assets/${selected.cover2x}.webp 960w" sizes="(max-width: 600px) calc(100vw - 28px), 540px"`:''} width="${selected.width??640}" height="${selected.height??427}" fetchpriority="high" alt="${escape(entry.names[language])}">
      </button>
      <div class="signature-details" aria-live="polite" aria-atomic="true">
        <p class="signature-kicker"><span${entry.image.startsWith('illustrations/')?' class="signature-art-note"':''}>${entry.image.startsWith('illustrations/')?text.illustration[language]:text.step[language]}</span><span class="signature-counter">${position} <span aria-hidden="true">/</span> 03</span></p>
        <div class="signature-title-row"><h2 id="signature-title">${escape(entry.names[language])}</h2><strong>${price}</strong></div>
        <p class="signature-description">${escape(entry.descriptions[language]??'')}</p>
        <button type="button" class="button primary signature-action" data-hero-open="${entry.id}">${selected.actions[language]} <span aria-hidden="true">↗</span></button>
      </div>
    </article>
    <button type="button" class="signature-pairing" data-home-pairing><span><strong>${text.pairing[language]}</strong><small>${text.pairingHelp[language]}</small></span><span aria-hidden="true">→</span></button>`;
}
