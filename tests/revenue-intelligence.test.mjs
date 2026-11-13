import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { items } from '../dist/catalog.js';
import { resolveOrderItem, builtComboId } from '../dist/order-options.js';
import {
  COST_FIELDS, normalizedCost, normalizeCostBook, unitCostFor, paidOrderMetrics,
  makePaidOrder, revenueReport, parseCsv, importPosCsv, reconcilePosOrders, makeOrderSlip, parseOrderSlip,
} from '../dist/revenue-core.js';
import { createLocalTelemetry, safeAttribution, experimentVariant } from '../dist/telemetry.js';

const resolve=id=>resolveOrderItem(id,items);
const paidAt='2026-11-01T12:34:56.000Z';
const cupCost={ingredients:34, packaging:8, variableLabor:12, paymentFee:4, waste:5};
const costs={cappuccino:cupCost,pancake:{ingredients:80,packaging:6,variableLabor:21,paymentFee:5,waste:8}};

test('before real POS or staff receipts the dashboard does not fabricate revenue or margin',()=>{
  const report=revenueReport([],{},resolve);
  assert.equal(report.orderCount,0);
  assert.equal(report.gross,0);
  assert.equal(report.averageTicket,null);
  assert.equal(report.contributionKnown,null);
  assert.equal(report.knownOrders,0);
  assert.deepEqual(report.bySku,[]);
});
test('actual paid receipt and line-level VAT yield contribution, not net profit',()=>{
  const order=makePaidOrder({id:'pos_001',paidAt,source:'pos_csv',
    lines:[{itemId:'cappuccino',quantity:2,unitGross:185,discountGross:10,vatPercent:10}]},resolve);
  const detail=paidOrderMetrics(order,costs,resolve);
  assert.equal(detail.gross,360);
  assert.equal(detail.net,327.27);
  assert.equal(detail.variableCost,126);
  assert.equal(detail.contribution,201.27);
  const report=revenueReport([order],costs,resolve);
  assert.equal(report.averageTicket,360);
  assert.equal(report.contributionKnown,201.27);
  assert.equal(report.sourceCounts.pos_csv,1);
  assert.equal(report.bySku[0].units,2);
});
test('unknown VAT or missing cost never appears as zero-cost or zero-tax margin',()=>{
  const noVat=makePaidOrder({id:'manual_1',paidAt,source:'staff_manual',
    lines:[{itemId:'cappuccino',quantity:1,unitGross:185,vatPercent:null}]},resolve);
  const noCosts=makePaidOrder({id:'manual_2',paidAt,source:'staff_manual',
    lines:[{itemId:'tea',quantity:1,unitGross:30,vatPercent:10}]},resolve);
  const report=revenueReport([noVat,noCosts],costs,resolve);
  assert.equal(report.orderCount,2);
  assert.equal(report.gross,215);
  assert.equal(report.contributionKnown,null);
  assert.equal(report.knownOrders,0);
  assert.ok(report.missing.includes('VAT:cappuccino'));
  assert.ok(report.missing.includes('tea'));
});
test('fixed combos use the cost of both actual components, not a guessed price discount',()=>{
  const unit=unitCostFor('sweet-morning',costs,resolve);
  assert.deepEqual(unit,{complete:true,missing:[],value:183});
  assert.deepEqual(unitCostFor('fresh-energy',costs,resolve).complete,false);
  const order=makePaidOrder({id:'pos_bundle_1',paidAt,source:'pos_csv',
    lines:[{itemId:'sweet-morning',quantity:1,unitGross:460,vatPercent:10}]},resolve);
  assert.equal(paidOrderMetrics(order,costs,resolve).contribution,235.18);
});
test('milk/syrup modifiers cannot silently vanish from calculated costs',()=>{
  const entry=resolve('latte~oat~vanilla');
  assert.ok(entry);
  const book={latte:cupCost};
  assert.deepEqual(unitCostFor(entry.id,book,resolve).missing,['plant-milk','syrup']);
  book['plant-milk']={ingredients:12,packaging:0,variableLabor:0,paymentFee:0,waste:0};
  book.syrup={ingredients:4,packaging:0,variableLabor:0,paymentFee:0,waste:0};
  assert.equal(unitCostFor(entry.id,book,resolve).value,79);
});
test('cost records reject negative, NaN and bad inventory IDs',()=>{
  assert.equal(normalizedCost({ingredients:-1}),null);
  assert.equal(normalizedCost({ingredients:1,packaging:NaN}),null);
  assert.equal(normalizedCost({ingredients:0}).ingredients,0);
  assert.deepEqual(Object.keys(normalizedCost({ingredients:1})),COST_FIELDS);
  assert.deepEqual(Object.keys(normalizeCostBook({'hacker<script>':{ingredients:9},cappuccino:{ingredients:12}},new Set(items.keys()))),['cappuccino']);
});
test('POS import is grouped by paid order and validates columns and totals',()=>{
  const csv='order_id,paid_at,item_id,quantity,unit_gross_try,vat_percent,discount_gross_try,utm_source\n'+
    'pos_100,'+paidAt+',cappuccino,2,185,10,10,instagram\n'+
    'pos_100,'+paidAt+',pancake,1,300,10,0,instagram\n'+
    'pos_101,'+paidAt+',tea,1,30,,0,google\n';
  const result=importPosCsv(csv,resolve);
  assert.equal(result.length,2);
  assert.equal(result[0].lines.length,2);
  assert.equal(result[0].source,'pos_csv');
  assert.equal(result[0].attribution.utm_source,'instagram');
  assert.equal(result[1].lines[0].vatPercent,null);
  const report=revenueReport(result,costs,resolve);
  assert.equal(report.gross,690);
  assert.equal(report.bySource.length,2);
  assert.equal(report.bySource[0].source,'instagram');
  assert.equal(report.bySource[0].orders,1);
  assert.equal(report.bySource[0].gross,660);
  assert.equal(report.bySource[1].source,'google');
  assert.equal(report.bySource[1].knownOrders,0);
  assert.throws(()=>importPosCsv('order_id,paid_at,item_id\nx,y,tea',resolve),/Missing POS CSV columns/);
  assert.throws(()=>importPosCsv(csv.replace('cappuccino,2','unknown,2'),resolve),/Invalid POS line/);
});
test('SKU contribution is withheld until every sold unit has known VAT and cost',()=>{
  const known=makePaidOrder({id:'pos_sku_1',paidAt,source:'pos_csv',
    lines:[{itemId:'cappuccino',quantity:2,unitGross:185,vatPercent:10}]},resolve);
  const unknown=makePaidOrder({id:'manual_sku_2',paidAt,source:'staff_manual',
    lines:[{itemId:'cappuccino',quantity:1,unitGross:185,vatPercent:null}]},resolve);
  const partial=revenueReport([known,unknown],costs,resolve);
  assert.equal(partial.bySku[0].units,3);
  assert.equal(partial.bySku[0].knownUnits,2);
  assert.equal(partial.bySku[0].contribution,null);
  assert.equal(partial.knownOrders,1);
  assert.equal(partial.orderCount,2);
  const full=revenueReport([known],costs,resolve);
  assert.equal(full.bySku[0].knownUnits,2);
  assert.equal(full.bySku[0].contribution,paidOrderMetrics(known,costs,resolve).contribution);
});

test('POS import upgrades a matching staff receipt exactly once; never doubles paid revenue',()=>{
  const staff=makePaidOrder({id:'receipt_101',paidAt,source:'staff_manual',attribution:{utm_source:'instagram'},
    lines:[{itemId:'cappuccino',quantity:2,unitGross:185,vatPercent:null}]},resolve);
  const pos=makePaidOrder({id:'receipt_101',paidAt,source:'pos_csv',
    lines:[{itemId:'cappuccino',quantity:2,unitGross:185,vatPercent:10}]},resolve);
  const updated=reconcilePosOrders([staff],[pos]);
  assert.deepEqual([updated.added,updated.upgraded,updated.skipped],[0,1,0]);
  assert.equal(updated.orders.length,1);
  assert.equal(updated.orders[0].source,'pos_csv');
  assert.equal(updated.orders[0].attribution.utm_source,'instagram');
  assert.equal(revenueReport(updated.orders,costs,resolve).orderCount,1);
  assert.equal(revenueReport(updated.orders,costs,resolve).gross,370);
  assert.equal(revenueReport(updated.orders,costs,resolve).knownOrders,1);
  const again=reconcilePosOrders(updated.orders,[pos]);
  assert.deepEqual([again.added,again.upgraded,again.skipped],[0,0,1]);
  assert.equal(again.orders.length,1);
});

test('POS conflicts are atomic and cannot silently overwrite paid totals, items or time',()=>{
  const old=makePaidOrder({id:'receipt_210',paidAt,source:'staff_manual',
    lines:[{itemId:'cappuccino',quantity:1,unitGross:185,vatPercent:null}]},resolve);
  const unrelated=makePaidOrder({id:'receipt_211',paidAt,source:'pos_csv',
    lines:[{itemId:'tea',quantity:1,unitGross:30,vatPercent:10}]},resolve);
  const changed=makePaidOrder({id:'receipt_210',paidAt,source:'pos_csv',
    lines:[{itemId:'cappuccino',quantity:1,unitGross:190,vatPercent:10}]},resolve);
  const original=JSON.stringify([old]);
  assert.throws(()=>reconcilePosOrders([old],[unrelated,changed]),/Conflicting paid receipt/);
  assert.equal(JSON.stringify([old]),original);
  const converted=makePaidOrder({id:'receipt_210',paidAt,source:'pos_csv',
    lines:[{itemId:'cappuccino',quantity:1,unitGross:185,vatPercent:10}]},resolve);
  const differentAt={...converted,paidAt:'2026-11-02T12:34:56.000Z'};
  assert.throws(()=>reconcilePosOrders([converted],[differentAt]),/Conflicting POS receipt version/);
  assert.throws(()=>reconcilePosOrders([old,old],[]),/Duplicate existing receipt/);
});
test('CSV parser handles BOM, semicolon and quoted content',()=>{
  assert.deepEqual(parseCsv('\uFEFFitem_id;ingredients\n"tea";"10"\n'),[{item_id:'tea',ingredients:'10'}]);
  assert.deepEqual(parseCsv('a,b\n"foo,bar","x"\n'),[{a:'foo,bar',b:'x'}]);
  assert.throws(()=>parseCsv('a,b\n"broken'),/Unclosed/);
});
test('PCT1 order handoff is a draft, not a paid sale, and is tamper-checked',()=>{
  const lines=[['cappuccino',2],['pancake',1]];
  const code=makeOrderSlip({id:'pct_test_123',lines,quoteTotal:670,attribution:{utm_source:'instagram'}});
  assert.ok(code.startsWith('PCT1.'));
  const decoded=parseOrderSlip(code,resolve);
  assert.equal(decoded.id,'pct_test_123');
  assert.equal(decoded.quoteTotal,670);
  assert.equal(decoded.lines[0].vatPercent,null);
  assert.equal(decoded.attribution.utm_source,'instagram');
  assert.throws(()=>makeOrderSlip({id:'bad',lines:[],quoteTotal:0}),/Invalid/);
  assert.throws(()=>parseOrderSlip('PCT1.evil',resolve),/Unreadable|Bad/);
  assert.throws(()=>parseOrderSlip('PCT1.'+btoa(JSON.stringify({v:1,id:'pct_good',lines:[['cappuccino',1]],quoteTotal:1})).replace(/=+$/,''),resolve),/total differs/);
});
test('local diagnostics are opt-in, bounded, sanitized and never send network requests',()=>{
  const map=new Map();
  const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
  const t=createLocalTelemetry({storage,search:'?utm_source=instagram&utm_campaign=Coffee%20with%20@email&qr=table_4'});
  assert.equal(t.enabled,false);
  assert.equal(t.record('menu_view'),false);
  assert.equal(t.export().length,0);
  t.setEnabled(true);
  assert.equal(t.record('dish_view',{itemId:'cappuccino',language:'ru'}),true);
  assert.equal(t.export().length,1);
  assert.equal(t.export()[0].attribution.utm_source,'instagram');
  assert.equal(t.export()[0].attribution.utm_campaign,'');
  t.setEnabled(false);
  assert.equal(map.has('pocitel-local-events-v1'),false);
  assert.equal(t.export().length,0);
  assert.equal(safeAttribution('?qr=table_7').qr,'table_7');
});
test('experiment assignment is stable but does not enable any public experiment by itself',()=>{
  assert.equal(experimentVariant('session-one','coffee-bump'),experimentVariant('session-one','coffee-bump'));
  assert.match(experimentVariant('session-one','coffee-bump'),/control|treatment/);
});
test('source wiring: manual proof, no fake cloud authentication and no automatic interrupting pairing popup',()=>{
  const app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  const owner=readFileSync(new URL('../dist/admin.html',import.meta.url),'utf8');
  assert.match(app,/trace\('menu_view'\)/);
  assert.match(app,/trace\('add_to_cart'/);
  assert.match(app,/trace\('waiter_screen_view'/);
  assert.match(app,/makeOrderSlip\(/);
  assert.match(app,/id === 'copy-order-slip'/);
  assert.match(html,/id="telemetry-optin"/);
  assert.match(owner,/id="staff-paid"/);
  assert.match(owner,/noindex,nofollow/);
  assert.doesNotMatch(app,/scheduleFocacciaPromo\(600\)/);
  assert.doesNotMatch(app,/offerObserver\.observe\(/);
  assert.match(html,/style\.css\?v=20261113-cart-photo/);
});
