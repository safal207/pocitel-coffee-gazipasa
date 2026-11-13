import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import jsQR from 'jsqr';
import { staffOrderText,orderQrMatrix } from '../dist/staff-handoff.js';
import { items } from '../dist/catalog.js';
import { resolveOrderItem,builtComboId } from '../dist/order-options.js';
const resolve=id=>resolveOrderItem(id,items);
test('Turkish staff text preserves quantity, serving and real configured prices without payment claims',()=>{
 const id='to-go-cappuccino~oat~vanilla',item=resolve(id);
 const text=staffOrderText(new Map([[id,2],['cilbir',1]]),resolve);
 assert.match(text,/2 ×/);assert.match(text,/Paket · Yulaf sütü · Vanilya/);
 assert.ok(text.includes(new Intl.NumberFormat('tr-TR').format(item.price*2+items.get('cilbir').price)+' ₺'));
 assert.match(text,/Sipariş gönderilmedi\. Ödeme alınmadı/);
 assert.doesNotMatch(text,/utm_|PCT1\.|https?:\/\//);
 assert.equal(staffOrderText(new Map(),resolve),'');
 assert.throws(()=>staffOrderText(new Map([['unknown',1]]),resolve));
 assert.throws(()=>staffOrderText(new Map([['tea',100]]),resolve));
});
test('custom pairing text includes actual food and drink, without invented ingredients',()=>{
 const id=builtComboId({foodId:'beetroot',drinkId:'latte',serving:'cafe'});
 const item=resolve(id),text=staffOrderText(new Map([[id,1]]),resolve);
 assert.ok(text.includes(item.descriptions[0]));assert.ok(text.includes('Kafede'));
});
test('QR round-trip preserves UTF-8 Turkish text and contains no network URL',()=>{
 const context={window:{}};vm.runInNewContext(readFileSync(new URL('../dist/assets/qr.js',import.meta.url),'utf8'),context);
 const text=staffOrderText(new Map([['cilbir',2],['to-go-cappuccino',1]]),resolve);
 const matrix=orderQrMatrix(text,context.window.PocitelQRCode),unit=4,side=(matrix.length+8)*unit;
 const pixels=new Uint8ClampedArray(side*side*4).fill(255);
 matrix.forEach((row,y)=>row.forEach((dark,x)=>{if(dark)for(let a=0;a<unit;a++)for(let b=0;b<unit;b++){
  const i=(((y+4)*unit+a)*side+(x+4)*unit+b)*4;pixels[i]=pixels[i+1]=pixels[i+2]=0;
 }}));
 assert.equal(jsQR(pixels,side,side).data,text);
 assert.throws(()=>orderQrMatrix('ğ'.repeat(600),context.window.PocitelQRCode),/too long/);
});
