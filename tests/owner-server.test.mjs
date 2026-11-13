import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,rm,readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createOwnerServer } from '../server/owner-server.mjs';
import { makeOrderSlip,parseOrderSlip,normalizedCost,unitCostFor,parseCsv } from '../dist/revenue-core.js';
import { cleanLog,createLocalTelemetry,TELEMETRY_KEY,TELEMETRY_CONSENT } from '../dist/telemetry.js';
import { items } from '../dist/catalog.js';
import { resolveOrderItem } from '../dist/order-options.js';
const resolve=id=>resolveOrderItem(id,items);
test('missing variable expenses remain unknown; only explicit zero completes cost',()=>{
 const cost=normalizedCost({ingredients:40});assert.equal(cost.packaging,null);
 assert.equal(unitCostFor('cappuccino',{cappuccino:cost},resolve).complete,false);
 assert.equal(unitCostFor('cappuccino',{cappuccino:{ingredients:40,packaging:0,variableLabor:0,paymentFee:0,waste:0}},resolve).value,40);
});
test('slips reject omitted/nonfinite totals, malformed rows and duplicate quantities',()=>{
 for(const patch of [{quoteTotal:null},{quoteTotal:undefined},{quoteTotal:'185'},{lines:[null]},{lines:[['cappuccino',1],['cappuccino',1]],quoteTotal:370}]){
  const data={v:1,id:'pct_valid',lines:[['cappuccino',1]],quoteTotal:185,...patch};
  assert.throws(()=>parseOrderSlip('PCT1.'+btoa(JSON.stringify(data)).replace(/=+$/,''),resolve));
 }
 assert.throws(()=>parseCsv('a,b\n1,2,3'),/width/);
});
test('takeaway packaging cannot inherit a cafe cost declaration',()=>{
 const cost={ingredients:40,packaging:0,variableLabor:0,paymentFee:0,waste:0};
 assert.equal(unitCostFor('to-go-cappuccino',{cappuccino:cost},resolve).complete,false);
 assert.equal(unitCostFor('to-go-cappuccino',{'to-go-cappuccino':{...cost,packaging:8}},resolve).value,48);
});
test('restored diagnostics drop arbitrary fields and erase expired data on disk',()=>{
 const now=new Date().toISOString();
 assert.equal(cleanLog([{event:'menu_view',at:now,email:'private@example.com'}])[0].email,undefined);
 const map=new Map([[TELEMETRY_CONSENT,'yes'],[TELEMETRY_KEY,JSON.stringify([{event:'menu_view',at:'2000-01-01'}])]]);
 const storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 createLocalTelemetry({storage});assert.equal(map.get(TELEMETRY_KEY),'[]');
 map.set(TELEMETRY_CONSENT,'no');map.set(TELEMETRY_KEY,'[]');
 createLocalTelemetry({storage});assert.equal(map.has(TELEMETRY_KEY),false);
});
test('private owner HTTP boundary, unpaid confirmation, atomic import, dedup and restart',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'pocitel-owner-'));
 const password='test-only-'+ 'x'.repeat(32);
 let app=await createOwnerServer({password,dataDir:dir});
 const auth={Authorization:'Basic '+Buffer.from('owner:'+password).toString('base64')};
 const get=path=>fetch(app.url+path,{headers:auth});
 const post=(path,input,headers={})=>fetch(app.url+path,{method:'POST',headers:{...auth,'Content-Type':'application/json','X-Pocitel-Owner':'1',...headers},body:JSON.stringify(input)});
 try {
  assert.equal((await fetch(app.url+'/api/report')).status,401);
  assert.equal((await fetch(app.url+'/api/backup')).status,401);
  assert.equal((await get('/ledger.json')).status,404);
  assert.equal((await post('/api/costs',{}, {Origin:'https://attacker.example'})).status,403);
  assert.equal((await get('/')).headers.get('cache-control'),'no-store');
  const slip=makeOrderSlip({id:'pct_server_1',lines:[['cappuccino',1]],quoteTotal:185});
  assert.equal((await post('/api/confirm',{code:slip})).status,200);
  let report=await (await get('/api/report')).json();assert.equal(report.confirmedUnpaid,1);assert.equal(report.orderCount,0);
  assert.equal((await post('/api/paid',{id:'pct_server_1'})).status,400);
  assert.equal((await post('/api/paid',{id:'pct_server_1',paymentReceived:true,vatPercent:10})).status,200);
  assert.equal((await post('/api/paid',{id:'pct_server_1',paymentReceived:true})).status,400);
  const csv='order_id,paid_at,item_id,quantity,unit_gross_try,vat_percent\npct_server_1,2026-11-01T12:00:00Z,cappuccino,1,185,10';
  assert.equal((await post('/api/pos',{csv})).status,200);
  assert.equal((await post('/api/pos',{csv})).status,200);
  const costCsv='item_id,ingredients,packaging,variableLabor,paymentFee,waste\ncappuccino,40,0,0,0,0';
  assert.equal((await post('/api/costs',{csv:costCsv})).status,200);
  report=await (await get('/api/report')).json();assert.equal(report.orderCount,1);assert.equal(report.confirmedUnpaid,0);assert.equal(report.contributionKnown,128.18);
  const before=await readFile(join(dir,'ledger.json'),'utf8');
  assert.equal((await post('/api/pos',{csv:csv.replace(',185,',',190,')})).status,400);
  assert.equal((await post('/api/costs',{csv:costCsv+'\nunknown,1,0,0,0,0'})).status,400);
  assert.equal(await readFile(join(dir,'ledger.json'),'utf8'),before);
  await app.close();app=await createOwnerServer({password,dataDir:dir});
  report=await (await get('/api/report')).json();assert.equal(report.gross,185);assert.equal(report.sourceCounts.pos_csv,1);
 }finally{await app.close();await rm(dir,{recursive:true,force:true})}
});
