import { optionLabels, isTakeaway } from './order-options.js?v=20261106-builder';

export function staffOrderText(selection,resolve) {
  if(!(selection instanceof Map)||!selection.size) return '';
  const money=value=>new Intl.NumberFormat('tr-TR',{maximumFractionDigits:2}).format(value)+' ₺';
  let total=0;
  const lines=[...selection].map(([id,quantity])=>{
    const item=resolve(id);
    if(!item||!Number.isInteger(quantity)||quantity<1||quantity>99||!Number.isFinite(item.price)) throw Error('Invalid order line');
    const amount=Math.round(item.price*quantity*100)/100;
    total+=amount;
    const details=[isTakeaway(item)?'Paket':'Kafede',optionLabels(item,0),item.isBuiltCombo?item.descriptions[0]:''].filter(Boolean).join(' · ');
    return `${quantity} × ${item.names[0]} — ${money(amount)}\n  ${details}`;
  });
  return ['Poçitel Coffee & Brunch','SİPARİŞ TASLAĞI',...lines,'Toplam: '+money(Math.round(total*100)/100),
    'Sipariş gönderilmedi. Ödeme alınmadı. Fiyat ve uygunluğu ekibimizle teyit edin.'].join('\n');
}

export function orderQrMatrix(text,QRCode) {
  const bytes=new TextEncoder().encode(text);
  if(!text||bytes.length>1100) throw Error('Order too long for readable QR');
  const code=new QRCode(-1,1);
  // The vendored encoder expects bytes, not UTF-16 code points.
  code.addData(String.fromCharCode(...bytes));code.make();
  const size=code.getModuleCount();
  return Array.from({length:size},(_,y)=>Array.from({length:size},(_,x)=>code.isDark(y,x)));
}

export async function drawOrderQr(canvas,text) {
  await import('./assets/qr.js?v=20261113-miora');
  const matrix=orderQrMatrix(text,window.PocitelQRCode),unit=4,quiet=4;
  canvas.width=canvas.height=(matrix.length+quiet*2)*unit;
  const ctx=canvas.getContext('2d');
  if(!ctx) throw Error('Canvas unavailable');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#000';
  matrix.forEach((row,y)=>row.forEach((dark,x)=>{if(dark)ctx.fillRect((x+quiet)*unit,(y+quiet)*unit,unit,unit)}));
}
