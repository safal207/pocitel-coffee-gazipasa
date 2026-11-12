import { items, feedOrder } from './catalog.js?v=20261105-focaccia';
import { resolveOrderItem } from './order-options.js?v=20261106-builder';
import { COST_FIELDS, normalizeCostBook, normalizedCost, makePaidOrder, revenueReport, parseOrderSlip, importPosCsv, parseCsv } from './revenue-core.js?v=20261112-ri';
import { TELEMETRY_KEY, cleanLog } from './telemetry.js?v=20261112-ri';

const $=selector=>document.querySelector(selector);
const ORDER_KEY='pocitel-admin-paid-orders-v1';
const COST_KEY='pocitel-admin-costs-v1';
const ADMIN_LANG='pocitel-admin-language-v1';
const LANGS=['tr','en','ru'];
let lang=LANGS.includes(localStorage.getItem(ADMIN_LANG))?localStorage.getItem(ADMIN_LANG):'tr';
let costs={},orders=[],slip=null;
const resolve=id=>resolveOrderItem(id,items);
const i18n={
  title:['Gelir ve ürün analizi','Revenue & menu intelligence','Выручка и экономика меню'],
  lang:['Dil','Language','Язык'],back:['Menüye dön','Back to menu','Вернуться в меню'],
  offline:['Yalnızca bu cihazda, bulutta eşitlenmiyor.','Local to this device, not cloud synced.','Только на этом устройстве, без облачной синхронизации.'],
  security:['Bu sayfa henüz kimlik doğrulamalı bir panel değil. Veriler bu tarayıcıda saklanır. Paylaşılan cihazlarda gizli maliyetleri girmeyin. Ödeme için POS veya personel teyidi gerekir.',
    'This is not an authenticated owner dashboard. Data stays in this browser. Do not enter sensitive costs on shared devices. POS or staff payment confirmation is required.',
    'Это ещё не защищённый кабинет хозяйки. Данные сохраняются в этом браузере. Не вводите конфиденциальную себестоимость на общем устройстве. Оплата требует подтверждения кассой или сотрудником.'],
  overview:['Genel bakış','Overview','Обзор'],paidOnly:['Sadece ödemesi bildirilen fişler; sepet veya garsona gösterilen taslaklar satış değildir.',
    'Reported paid receipts only; a cart or waiter screen is not a sale.','Только заявленные оплаченные чеки: корзина и показ официанту ещё не продажа.'],
  paidOrders:['Bildirilen ödemeler','Reported paid orders','Подтверждённые персоналом / POS чеки'],
  gross:['Brüt satışlar','Gross sales','Валовая выручка'],
  ticket:['Ortalama fiş','Average ticket','Средний чек'],
  margin:['Katkı payı (bilinen)','Contribution (known)','Маржинальный доход (известный)'],
  coverage:['Tam maliyetli fişler','Complete VAT & cost coverage','Чеки с известными расходами и НДС'],
  proof:['POS / manuel','POS / manual','POS / вручную'],
  costs:['Maliyetler','Costs','Себестоимость'],
  costHint:['Bir porsiyon için doğrudan maliyet (₺). Yalnızca malzeme girerseniz diğer alanlar sıfır kabul edilir. Eksikleri doğrulayın. Bu rakam vergi sonrası net kâr değildir.',
    'Variable cost per portion (₺). Empty non-ingredient fields become zero; verify missing expenses. This is not net profit after fixed costs and taxes.',
    'Переменные затраты на порцию (₺). Пустые поля, кроме ингредиентов, принимаются за ноль — проверьте полноту расходов. Это не чистая прибыль после аренды и налогов.'],
  product:['Ürün','Product','Позиция'],ingredientCost:['Malzeme *','Ingredients *','Ингредиенты *'],
  packageCost:['Paket','Packaging','Упаковка'],laborCost:['Değişken işçilik','Variable labour','Переменный труд'],
  feeCost:['Ödeme komisyonu','Payment fee','Комиссия'],wasteCost:['Fire','Waste','Списания'],
  saveCost:['Maliyeti kaydet','Save cost','Сохранить себестоимость'],
  costCsv:['Maliyet CSV (item_id + 5 alan)','Cost CSV (item_id + 5 fields)','CSV себестоимости (item_id + 5 полей)'],
  importCosts:['Maliyet CSV içe aktar','Import cost CSV','Импортировать себестоимость CSV'],
  sales:['Ödenen siparişler','Paid orders','Оплаченные заказы'],
  slip:['Müşteri sipariş fişi','Customer order slip','Передача заказа сотруднику'],
  slipHint:['Müşterinin PCT1. kodunu yapıştırın. Kod ödeme kanıtı değildir.',
    'Paste the customer PCT1. order slip. The code is not proof of payment.',
    'Вставьте код PCT1. из экрана заказа посетителя. Код сам по себе не доказывает оплату.'],
  pasteSlip:['Sipariş kodu','Order slip','Код заказа'],
  inspectSlip:['Fişi kontrol et','Inspect order slip','Проверить состав заказа'],
  vat:['Geçerli KDV oranı, % (bilinmiyorsa boş)','Applicable VAT rate, % (blank if unknown)',
    'Ставка НДС, % (оставьте пустой, если неизвестна)'],
  staffConfirmed:['Personel ödemeyi gerçekten teyit etti','Staff verified that payment was received',
    'Сотрудник подтвердил факт получения оплаты'],
  confirmPaid:['Manuel ödenmiş kaydet','Mark paid (staff reported)','Отметить оплату по подтверждению сотрудника'],
  posImport:['POS CSV içe aktarımı','POS CSV import','Импорт чеков POS'],
  posHint:['Gerekli: order_id, paid_at, item_id, quantity, unit_gross_try, vat_percent. Yalnızca bu cihazda işlenir, aynı kimlikler atlanır.',
    'Required: order_id, paid_at, item_id, quantity, unit_gross_try, vat_percent. Processed locally; duplicate order IDs skipped.',
    'Поля: order_id, paid_at, item_id, quantity, unit_gross_try, vat_percent. CSV обрабатывается локально; повторные ID пропускаются.'],
  chooseCsv:['POS CSV dosyası','POS CSV file','Файл POS CSV'],
  importCsv:['CSV içe aktar','Import CSV','Импортировать CSV'],
  sourcesTitle:['Satış kaynakları','Paid order sources','Источники оплаченных заказов'],
  sourcesHint:['Yalnızca ödenmiş bildirilen fişlerdeki UTM/QR bilgisi. Bu dönüşüm oranı veya reklam ROI değildir.',
    'UTM/QR from reported paid receipts only. This is not a visitor conversion rate or ad ROI.',
    'UTM/QR только из подтверждённых персоналом или POS чеков. Это не конверсия посетителей и не рекламный ROI.'],
  sourceName:['Kaynak / kampanya','Source / campaign','Источник / кампания'],
  products:['Ürün katkısı','Product contribution','Доходность позиций'],
  skuHint:['Yalnızca ödenmiş fişler; katkı sadece KDV ve değişken maliyeti bilinen satırlarda gösterilir.',
    'Paid receipts only. Contribution is shown only for lines with known VAT and variable costs.',
    'Только оплаченные чеки. Маржинальный доход показывается только при известных НДС и переменных затратах.'],
  units:['Adet','Units','Штук'],
  noData:['Henüz ödenmiş fiş yok.','No reported paid receipts yet.','Пока нет подтверждённых оплаченных чеков.'],
  export:['Dışa aktar / yedek','Export / backup','Экспорт / резервная копия'],
  exportHint:['Tarayıcı verilerini dışa aktarın ve güvenli saklayın. Ziyaretçi olayları yalnızca kendi izin verdiği cihazda tutulur; site geneli ölçülemez.',
    'Export and securely back up browser data. Visitor events live only on opted-in devices; this cannot measure sitewide traffic.',
    'Экспортируйте и безопасно храните данные браузера. События посетителей хранятся только на их устройствах при согласии; общую аналитику сайта здесь получить нельзя.'],
  ordersJson:['Fişler JSON','Paid orders JSON','Оплаченные заказы JSON'],
  costsJson:['Maliyetler JSON','Costs JSON','Себестоимость JSON'],
  eventsJson:['Cihaz olayları JSON','Device events JSON','События устройства JSON'],
  backendNote:['Çok cihazlı gerçek raporlama, POS entegrasyonu ve yetkiler için güvenli sunucu ve giriş gerekir. Bu sürüm henüz bağlı değildir.',
    'Reliable cross-device reporting, POS integration and staff roles require a secure server and sign-in, not provided here.',
    'Общая база чеков, интеграция POS и роли сотрудников требуют защищённого сервера и авторизации. В этой версии такого подключения нет.'],
  noCosts:['Girilmiş maliyet','Cost entries','Внесено себестоимостей'],
  unknown:['Belirsiz','Unknown','Неизвестно'],missing:['Eksik','Missing','Не хватает'],
  imported:['İçe aktarıldı','Imported','Импортировано'],
  skipped:['Atlandı','Skipped','Пропущено'],
  saved:['Kaydedildi','Saved','Сохранено'],
  failed:['Hata','Error','Ошибка'],
  duplicate:['Bu sipariş zaten kayıtlı','This order ID already exists','Заказ с таким ID уже есть'],
  paymentRequired:['Ödeme onayı olmadan fiş kaydedilmez','Staff payment checkbox is required','Необходимо подтвердить получение оплаты'],
  costInvalid:['Maliyet alanlarını kontrol edin','Check cost inputs','Проверьте поля себестоимости'],
};
const t=key=>(i18n[key]??[key,key,key])[LANGS.indexOf(lang)];
function money(v){return v==null?'—':new Intl.NumberFormat(lang==='tr'?'tr-TR':lang==='ru'?'ru-RU':'en-GB',{style:'currency',currency:'TRY',maximumFractionDigits:2}).format(v)}
function status(id,message){$(id).textContent=message}
function storageGet(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function storageSet(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
function resetCostInputs(){
  const item=$('#cost-item').value, value=costs[item]??{};
  for(const field of COST_FIELDS) $('#cost-'+field).value=value[field]??'';
}
function renderLanguages(){
  document.documentElement.lang=lang;
  $('#admin-lang').value=lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});
  const old=$('#cost-item').value;
  $('#cost-item').replaceChildren(...[...items.values()].sort((a,b)=>a.names[LANGS.indexOf(lang)].localeCompare(b.names[LANGS.indexOf(lang)])).map(item=>{
    const option=document.createElement('option');
    option.value=item.id;
    option.textContent=item.names[LANGS.indexOf(lang)]+' · '+money(item.price);
    return option;
  }));
  if(old&&items.has(old)) $('#cost-item').value=old;
  resetCostInputs();
  renderDashboard();
}
function renderDashboard(){
  const report=revenueReport(orders,costs,resolve);
  $('#kpi-orders').textContent=String(report.orderCount);
  $('#kpi-gross').textContent=report.orderCount?money(report.gross):'—';
  $('#kpi-ticket').textContent=money(report.averageTicket);
  $('#kpi-contribution').textContent=money(report.contributionKnown);
  $('#kpi-coverage').textContent=report.orderCount?report.knownOrders+' / '+report.orderCount:'—';
  $('#kpi-source').textContent=report.sourceCounts.pos_csv+' / '+report.sourceCounts.staff_manual;
  $('#data-quality').textContent=report.orderCount
    ? (t('missing')+': '+(report.missing.length?report.missing.join(', '):'—')+
      ' · '+t('noCosts')+': '+Object.keys(costs).length)
    : t('noData')+' · '+t('noCosts')+': '+Object.keys(costs).length;
  $('#cost-coverage').textContent=t('noCosts')+': '+Object.keys(costs).length+' / '+items.size;
  const body=$('#sku-table');
  body.replaceChildren();
  for(const row of report.bySku) {
    const tr=document.createElement('tr');
    const entry=resolve(row.itemId);
    for(const label of [entry?.names[LANGS.indexOf(lang)]??row.itemId,String(row.units),money(row.gross),money(row.contribution)]){
      const td=document.createElement('td');td.textContent=label;tr.appendChild(td);
    }
    body.appendChild(tr);
  }
  $('#empty-sales').hidden=report.orderCount>0;
  const sources=$('#source-table');
  sources.replaceChildren();
  for(const row of report.bySource){
    const tr=document.createElement('tr');
    for(const value of [row.source,String(row.orders),money(row.gross),
        money(row.contributionKnown),row.knownOrders+' / '+row.orders]){
      const td=document.createElement('td');td.textContent=value;tr.appendChild(td);
    }
    sources.appendChild(tr);
  }
  $('#empty-sources').hidden=report.bySource.length>0;
}
function download(filename,value){
  const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function initialize(){
  costs=normalizeCostBook(storageGet(COST_KEY,{}),new Set(items.keys()));
  const original=storageGet(ORDER_KEY,[]);
  if(Array.isArray(original)){
    for(const record of original.slice(0,5000)){
      try{const clean=makePaidOrder(record,resolve);if(!orders.some(x=>x.id===clean.id))orders.push(clean)}catch{}
    }
  }
  renderLanguages();
}
$('#admin-lang').addEventListener('change',e=>{
  lang=LANGS.includes(e.target.value)?e.target.value:'tr';
  try{localStorage.setItem(ADMIN_LANG,lang)}catch{}
  renderLanguages();
});
$('#cost-item').addEventListener('change',resetCostInputs);
$('#cost-form').addEventListener('submit',e=>{
  e.preventDefault();
  const item=$('#cost-item').value;
  const input=Object.fromEntries(COST_FIELDS.map(key=>{
    const raw=$('#cost-'+key).value;
    return [key,raw===''?key==='ingredients'?NaN:0:Number(raw)];
  }));
  const cost=normalizedCost(input);
  if(!cost){status('#cost-status',t('costInvalid'));return}
  costs[item]=cost;
  if(!storageSet(COST_KEY,costs)){status('#cost-status',t('failed')+': storage');return}
  status('#cost-status',t('saved')+' · '+item);
  renderDashboard();
});
$('#import-costs').addEventListener('click',async()=>{
  const file=$('#cost-file').files?.[0];if(!file)return;
  try{
    const rows=parseCsv(await file.text());
    let imported=0,skipped=0;
    const next={...costs};
    for(const row of rows){
      const item=row.item_id;
      if(!items.has(item)){skipped++;continue}
      const record=Object.fromEntries(COST_FIELDS.map(key=>[key,
        row[key.toLowerCase()]!==undefined && row[key.toLowerCase()]!==''?Number(row[key.toLowerCase()]):key==='ingredients'?NaN:0]));
      const cost=normalizedCost(record);
      if(!cost){skipped++;continue}
      next[item]=cost;imported++;
    }
    costs=next;
    if(!storageSet(COST_KEY,costs))throw Error('Storage not writable');
    renderDashboard();resetCostInputs();
    status('#cost-status',t('imported')+': '+imported+' · '+t('skipped')+': '+skipped);
  }catch(e){status('#cost-status',t('failed')+': '+e.message)}
});
$('#decode-slip').addEventListener('click',()=>{
  slip=null;$('#slip-preview').hidden=true;$('#staff-paid').checked=false;
  try{
    slip=parseOrderSlip($('#slip-value').value,resolve);
    const summary=slip.lines.map(line=>
      line.quantity+'× '+(resolve(line.itemId)?.names[LANGS.indexOf(lang)]??line.itemId)).join(' · ');
    $('#slip-items').textContent=slip.id+' · '+summary+' · '+money(slip.quoteTotal);
    $('#slip-preview').hidden=false;
    status('#manual-status','');
  }catch(e){status('#manual-status',t('failed')+': '+e.message)}
});
$('#confirm-paid').addEventListener('click',()=>{
  if(!slip)return;
  if(!$('#staff-paid').checked){status('#manual-status',t('paymentRequired'));return}
  if(orders.some(o=>o.id===slip.id)){status('#manual-status',t('duplicate'));return}
  const raw=$('#manual-vat').value.trim();
  const vat=raw===''?null:Number(raw);
  try{
    const paid=makePaidOrder({
      id:slip.id,paidAt:new Date().toISOString(),source:'staff_manual',
      attribution:slip.attribution,lines:slip.lines.map(line=>({...line,vatPercent:vat})),
    },resolve);
    const next=[...orders,paid];
    if(!storageSet(ORDER_KEY,next))throw Error('Storage not writable');
    orders=next;renderDashboard();
    $('#slip-preview').hidden=true;slip=null;$('#slip-value').value='';
    status('#manual-status',t('saved')+' · '+paid.id+' · staff_manual');
  }catch(e){status('#manual-status',t('failed')+': '+e.message)}
});
$('#import-pos').addEventListener('click',async()=>{
  const file=$('#pos-file').files?.[0];if(!file)return;
  try{
    const imported=importPosCsv(await file.text(),resolve);
    const existing=new Set(orders.map(x=>x.id));
    const unique=imported.filter(order=>!existing.has(order.id));
    const duplicateCount=imported.length-unique.length;
    const next=[...orders,...unique];
    if(next.length>5000)throw Error('Order storage limit; back up/export data');
    if(!storageSet(ORDER_KEY,next))throw Error('Storage not writable');
    orders=next;renderDashboard();
    status('#pos-status',t('imported')+': '+unique.length+' · '+t('skipped')+': '+duplicateCount);
  }catch(e){status('#pos-status',t('failed')+': '+e.message)}
});
$('#export-orders').addEventListener('click',()=>download('pocitel-paid-orders.json',orders));
$('#export-costs').addEventListener('click',()=>download('pocitel-private-costs.json',costs));
$('#export-events').addEventListener('click',()=>{
  download('pocitel-local-visitor-events.json',cleanLog(storageGet(TELEMETRY_KEY,[])));
});
initialize();
