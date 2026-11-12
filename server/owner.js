const languages=['tr','en','ru'];
let language='tr';
const $=id=>document.getElementById(id);
const copy={
 title:['İşletme paneli','Owner workspace','Кабинет хозяйки'],language:['Dil','Language','Язык'],
 scope:['Şifre korumalı yerel sunucu. Yalnızca bu bilgisayardan erişilir; Pages ile eşitlenmez.', 'Password-protected local server. Accessible on this computer only; not synced with Pages.', 'Локальный сервер с паролем. Доступен на этом компьютере; с Pages не синхронизируется.'],
 overview:['Genel bakış','Overview','Обзор'],confirmed:['Teyitli, ödenmemiş','Confirmed, unpaid','Подтверждены, не оплачены'],
 paid:['Ödendi bildirilen','Reported paid','Заявлены оплаченными'],gross:['Brüt (₺)','Gross (₺)','Выручка (₺)'],margin:['Bilinen katkı (₺)','Known contribution (₺)','Известный маржинальный доход (₺)'],coverage:['Tam veri / toplam','Complete / total','Полные данные / всего'],
 definitions:['Sepet ve gösterim satış değildir. POS CSV uzaktan doğrulanmaz. Katkı net kâr değildir; eksik maliyetler bilinmiyor.', 'Carts and views are not sales. POS CSV is not remotely verified. Contribution is not net profit; missing costs stay unknown.', 'Корзина и показ заказа не являются продажей. POS CSV не проверяется удалённо. Маржинальный доход — не чистая прибыль; пропущенные затраты неизвестны.'],
 handoff:['Siparişi teyit et','Confirm order','Подтвердить заказ'],code:['PCT1 kodu','PCT1 code','Код PCT1'],confirm:['Teyit et (ödeme değil)','Confirm (not payment)','Подтвердить (без оплаты)'],
 receipt:['Teyitli sipariş','Confirmed order','Подтверждённый заказ'],vat:['KDV %, bilinmiyorsa boş','VAT %, blank if unknown','НДС %, пусто — неизвестен'],
 payment:['Gösterilen tutarın tamamı alındı; farklı tutar varsa gerçek POS fişini içe aktarın.', 'The full displayed amount was received; import the actual POS receipt if the amount differs.', 'Вся показанная сумма получена; если сумма отличается, импортируйте фактический чек POS.'],
 markPaid:['Ödemeyi kaydet','Record payment','Записать оплату'],imports:['Güvenli yerel içe aktarım','Protected local imports','Защищённый локальный импорт'],
 costHint:['Boş giderler bilinmiyor. Gider yoksa açıkça 0 girin. Güncel maliyetler tahmindir; geçmiş dönem maliyeti değildir. CSV: item_id,ingredients,packaging,variableLabor,paymentFee,waste', 'Blank expenses are unknown. Enter 0 explicitly for no expense. Current costs are estimates, not historical snapshots. CSV: item_id,ingredients,packaging,variableLabor,paymentFee,waste', 'Пустые расходы неизвестны. Если расхода нет, укажите 0. Текущие затраты — оценка, а не исторический срез. CSV: item_id,ingredients,packaging,variableLabor,paymentFee,waste'],
 costFile:['Maliyet CSV','Cost CSV','CSV затрат'],importPos:['POS içe aktar','Import POS','Импортировать POS'],importCosts:['Maliyetleri içe aktar','Import costs','Импортировать затраты'],
 products:['Ürünler','Products','Позиции'],units:['Adet','Units','Единицы'],sources:['Ödenmiş fiş kaynakları','Paid receipt sources','Источники оплаченных чеков'],
 backup:['Özel yedeği indir','Download private backup','Скачать конфиденциальную копию'],saved:['Kaydedildi','Saved','Сохранено'],error:['Hata','Error','Ошибка'],
};
const t=key=>copy[key][languages.indexOf(language)];
async function api(path,input){
 const response=await fetch('/api/'+path,input===undefined?{cache:'no-store'}:{method:'POST',headers:{'Content-Type':'application/json','X-Pocitel-Owner':'1'},body:JSON.stringify(input)});
 const data=await response.json();if(!response.ok)throw Error(data.error??response.status);return data;
}
const money=value=>value==null?'—':new Intl.NumberFormat(language,{maximumFractionDigits:2,minimumFractionDigits:2}).format(value);
function table(id,rows){
 $(id).replaceChildren(...rows.map(values=>{const row=document.createElement('tr');for(const value of values){const cell=document.createElement('td');cell.textContent=value;row.append(cell)}return row}));
}
async function refresh(){
 const report=await api('report');
 $('confirmed').textContent=report.confirmedUnpaid;$('paid').textContent=report.orderCount;
 $('gross').textContent=report.orderCount?money(report.gross):'—';$('margin').textContent=money(report.contributionKnown);
 $('coverage').textContent=report.knownOrders+' / '+report.orderCount;
 $('evidence').textContent=report.sourceCounts.pos_csv+' / '+report.sourceCounts.staff_manual;
 table('products',report.bySku.map(row=>[row.itemId,row.units,money(row.gross),money(row.contribution),row.knownUnits+' / '+row.units]));
 table('sources',report.bySource.map(row=>[row.source,row.orders,money(row.gross),money(row.contributionKnown),row.knownOrders+' / '+row.orders]));
 const backup=await api('backup'),old=$('receipt').value;
 $('receipt').replaceChildren(...backup.confirmed.filter(order=>!backup.orders.some(paid=>paid.id===order.id)).map(order=>{const option=document.createElement('option');option.value=order.id;option.textContent=order.id+' · '+money(order.quoteTotal)+' ₺';return option}));
 if([...$('receipt').options].some(option=>option.value===old))$('receipt').value=old;
}
async function action(work){try{await work();await refresh();$('status').textContent=t('saved')}catch(error){$('status').textContent=t('error')+': '+error.message}}
$('language').addEventListener('change',()=>{language=$('language').value;render();});
function render(){document.documentElement.lang=language;document.querySelectorAll('[data-text]').forEach(node=>{node.textContent=t(node.dataset.text)});action(()=>Promise.resolve())}
$('confirm-form').addEventListener('submit',event=>{event.preventDefault();action(async()=>{await api('confirm',{code:$('code').value});$('code').value=''})});
$('paid-form').addEventListener('submit',event=>{event.preventDefault();action(async()=>{await api('paid',{id:$('receipt').value,paymentReceived:$('payment').checked,vatPercent:$('vat').value===''?null:Number($('vat').value)});$('payment').checked=false})});
for(const kind of ['pos','cost'])$(kind+'-form').addEventListener('submit',event=>{event.preventDefault();action(async()=>{const file=$(kind+'-file').files[0];if(file.size>2000000)throw Error('CSV > 2 MB');await api(kind==='pos'?'pos':'costs',{csv:await file.text()})})});
$('backup').addEventListener('click',()=>action(async()=>{const data=await api('backup');const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='pocitel-private-backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}));
render();
