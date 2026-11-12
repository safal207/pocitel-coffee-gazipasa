// Poçitel Revenue Intelligence v0.1 — pure, local-first calculations.
// Never treat a cart/hand-off as a paid sale. No assumptions about VAT or COGS.
export const COST_FIELDS = ['ingredients', 'packaging', 'variableLabor', 'paymentFee', 'waste'];
export const FIXED_COMBO_PARTS = Object.freeze({
  'turkish-classic': ['cilbir', 'tea'],
  'sweet-morning': ['pancake', 'cappuccino'],
  'fresh-energy': ['granola', 'iced-matcha'],
  'lunch-favourite': ['smoked-turkey', 'iced-americano'],
});
export const MAX_ROWS = 2000;
const MONEY_SCALE = 100;
const euroSafeId = value => typeof value === 'string' && /^[a-z0-9~_-]{1,140}$/i.test(value);
const money = number => Math.round((Number(number) + Number.EPSILON) * MONEY_SCALE) / MONEY_SCALE;
const finiteNonnegative = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;
export function normalizedCost(value) {
  if (!value || typeof value !== 'object' || !finiteNonnegative(value.ingredients)) return null;
  if (COST_FIELDS.some(field => value[field] !== undefined && !finiteNonnegative(value[field]))) return null;
  return Object.fromEntries(COST_FIELDS.map(field => [field, money(value[field] ?? 0)]));
}
export function normalizeCostBook(input, allowedIds) {
  const output = {};
  if (!input || typeof input !== 'object') return output;
  for (const [id, cost] of Object.entries(input)) {
    if (!euroSafeId(id) || (allowedIds && !allowedIds.has(id))) continue;
    const record = normalizedCost(cost);
    if (record) output[id] = record;
  }
  return output;
}
export function unitCostFor(itemId, costs, resolve) {
  const entry = resolve(itemId);
  if (!entry) return {complete:false, missing:[itemId], value:null};
  // Direct SKU overrides handle special takeaway packaging or combo-specific waste.
  if (normalizedCost(costs[itemId])) {
    return {complete:true, missing:[], value:money(Object.values(normalizedCost(costs[itemId])).reduce((a,b)=>a+b,0))};
  }
  const base = entry.sourceId ?? entry.baseId ?? entry.id;
  if (base !== itemId && normalizedCost(costs[base]) && !entry.isBuiltCombo) {
    let total = Object.values(normalizedCost(costs[base])).reduce((a,b)=>a+b,0);
    const extras = [
      ...(entry.milk && entry.milk !== 'standard' ? ['plant-milk'] : []),
      ...(entry.syrup && entry.syrup !== 'none' ? ['syrup'] : []),
    ];
    const missing=[];
    for(const id of extras) {
      const cost=normalizedCost(costs[id]);
      if(!cost) missing.push(id);
      else total+=Object.values(cost).reduce((a,b)=>a+b,0);
    }
    return missing.length?{complete:false,missing,value:null}
      :{complete:true,missing:[],value:money(total)};
  }
  const parts = entry.isBuiltCombo ? [...entry.componentIds] :
    (FIXED_COMBO_PARTS[base] ?? [base]);
  if (entry.milk && entry.milk !== 'standard') parts.push('plant-milk');
  if (entry.syrup && entry.syrup !== 'none') parts.push('syrup');
  const missing = [];
  let value = 0;
  for (const component of parts) {
    const cost = normalizedCost(costs[component]);
    if (!cost) { missing.push(component); continue; }
    value += Object.values(cost).reduce((a,b)=>a+b,0);
  }
  return missing.length
    ? {complete:false, missing:[...new Set(missing)], value:null}
    : {complete:true, missing:[], value:money(value)};
}
export function validSaleLine(line, resolve) {
  return Boolean(line && euroSafeId(line.itemId) && resolve(line.itemId) &&
    Number.isInteger(line.quantity) && line.quantity >= 1 && line.quantity <= 99 &&
    finiteNonnegative(line.unitGross) && line.unitGross < 1000000 &&
    finiteNonnegative(line.discountGross ?? 0) &&
    (line.vatPercent === null || line.vatPercent === undefined ||
      (finiteNonnegative(line.vatPercent) && line.vatPercent <= 100)) &&
    (line.discountGross ?? 0) <= line.quantity * line.unitGross);
}
export function makePaidOrder(input, resolve) {
  if (!input || typeof input !== 'object') throw new Error('Missing order');
  const id = String(input.id ?? '').trim();
  if (!/^[a-z0-9_-]{4,100}$/i.test(id)) throw new Error('Invalid order ID');
  if (!['pos_csv', 'staff_manual'].includes(input.source)) throw new Error('Invalid evidence source');
  const paidAt = new Date(input.paidAt ?? '');
  if (Number.isNaN(paidAt.getTime()) || paidAt.getTime() > Date.now() + 86400000) throw new Error('Invalid paid date');
  const lines = input.lines;
  if (!Array.isArray(lines) || !lines.length || lines.length > 100) throw new Error('No valid paid lines');
  if (!lines.every(line => validSaleLine(line, resolve))) throw new Error('Invalid SKU, price or quantity');
  const attrs = input.attribution && typeof input.attribution === 'object' ? input.attribution : {};
  const attribution = Object.fromEntries(['utm_source','utm_medium','utm_campaign','qr'].map(key => {
    const value = String(attrs[key] ?? '').trim();
    return [key, /^[a-z0-9_.-]{0,48}$/i.test(value) ? value : ''];
  }));
  return {
    version: 1, id, status:'paid', source:input.source, paidAt:paidAt.toISOString(),
    attribution,
    lines:lines.map(line => ({
      itemId:line.itemId, quantity:line.quantity, unitGross:money(line.unitGross),
      discountGross:money(line.discountGross ?? 0),
      vatPercent:line.vatPercent == null ? null : line.vatPercent,
    })),
  };
}
export function paidOrderMetrics(order, costs, resolve) {
  if (order?.status !== 'paid') throw new Error('Only paid orders are revenue');
  let gross = 0, net = 0, cost = 0;
  let complete = true;
  const missing = new Set();
  const lines = order.lines.map(line => {
    const lineGross = money(line.quantity * line.unitGross - line.discountGross);
    gross += lineGross;
    const vatKnown = line.vatPercent !== null && line.vatPercent !== undefined;
    const lineNet = vatKnown ? money(lineGross / (1 + line.vatPercent / 100)) : null;
    const unit = unitCostFor(line.itemId, costs, resolve);
    const lineCost = unit.complete ? money(unit.value * line.quantity) : null;
    if (lineNet === null || lineCost === null) complete = false;
    unit.missing.forEach(id => missing.add(id));
    if (!vatKnown) missing.add('VAT:' + line.itemId);
    if (lineNet !== null) net += lineNet;
    if (lineCost !== null) cost += lineCost;
    return {
      ...line, gross:lineGross, net:lineNet, variableCost:lineCost,
      contribution:lineNet === null || lineCost === null ? null : money(lineNet - lineCost),
    };
  });
  return {
    id:order.id, source:order.source, paidAt:order.paidAt,
    gross:money(gross), net:complete ? money(net) : null,
    variableCost:complete ? money(cost) : null,
    contribution:complete ? money(net-cost) : null,
    costCoverage:complete, missing:[...missing], lines,
  };
}
export function revenueReport(orders, costs, resolve) {
  const paid = orders.filter(order => order?.status === 'paid');
  const metrics = paid.map(o => paidOrderMetrics(o, costs, resolve));
  const known = metrics.filter(o => o.costCoverage);
  const bySku = {};
  for (const order of metrics) for (const line of order.lines) {
    const item = bySku[line.itemId] ??= {itemId:line.itemId, units:0, paidOrders:new Set(), gross:0, contribution:0, knownUnits:0};
    item.units += line.quantity;
    item.paidOrders.add(order.id);
    item.gross += line.gross;
    if (line.contribution !== null) { item.contribution += line.contribution; item.knownUnits += line.quantity; }
  }
  // Marketing attribution only from paid receipts; an empty label is
  // explicit "unknown", never counted as organic or attributed by guesswork.
  const bySource=new Map();
  paid.forEach((order,index)=>{
    const meta=order.attribution??{};
    const label=meta.utm_source
      ? meta.utm_source+(meta.utm_campaign?' / '+meta.utm_campaign:'')
      : meta.qr?'qr:'+meta.qr:'unknown';
    const bucket=bySource.get(label)??{source:label,orders:0,gross:0,knownOrders:0,contributionKnown:0};
    bucket.orders++;
    bucket.gross+=metrics[index].gross;
    if(metrics[index].costCoverage){
      bucket.knownOrders++;
      bucket.contributionKnown+=metrics[index].contribution;
    }
    bySource.set(label,bucket);
  });
  return {
    orderCount:paid.length,
    bySource:[...bySource.values()].map(row=>({
      ...row,gross:money(row.gross),
      contributionKnown:row.knownOrders?money(row.contributionKnown):null,
    })).sort((a,b)=>b.gross-a.gross),
    sourceCounts:{pos_csv:paid.filter(o=>o.source==='pos_csv').length,
      staff_manual:paid.filter(o=>o.source==='staff_manual').length},
    gross:money(metrics.reduce((s,o)=>s+o.gross,0)),
    averageTicket:paid.length ? money(metrics.reduce((s,o)=>s+o.gross,0)/paid.length) : null,
    contributionKnown:known.length ? money(known.reduce((s,o)=>s+o.contribution,0)) : null,
    knownOrders:known.length,
    missing:[...new Set(metrics.flatMap(o=>o.missing))],
    bySku:Object.values(bySku).map(o=>({...o, paidOrders:o.paidOrders.size,
      gross:money(o.gross), contribution:o.knownUnits === o.units ? money(o.contribution) : null}))
      .sort((a,b)=>b.gross-a.gross),
    orders:metrics,
  };
}
export function parseCsv(text) {
  if (typeof text !== 'string' || text.length > 2000000) throw new Error('CSV too large');
  const source = text.replace(/^\uFEFF/, '');
  const first = source.split(/\r?\n/,1)[0];
  const delimiter = (first.match(/;/g)??[]).length > (first.match(/,/g)??[]).length ? ';' : ',';
  const rows=[]; let row=[], cell='', quote=false;
  for (let i=0; i<source.length; i++) {
    const char=source[i];
    if (quote) {
      if (char==='"' && source[i+1]==='"') {cell+='"'; i++;}
      else if (char==='"') quote=false;
      else cell+=char;
    } else if (char==='"') quote=true;
    else if (char===delimiter) {row.push(cell);cell='';}
    else if (char==='\n') {
      row.push(cell.replace(/\r$/,'')); if(row.some(x=>x.trim())) rows.push(row);
      if(rows.length>MAX_ROWS+1) throw new Error('Too many CSV rows');
      row=[];cell='';
    } else cell+=char;
  }
  if(quote) throw new Error('Unclosed CSV quote');
  row.push(cell.replace(/\r$/,'')); if(row.some(x=>x.trim())) rows.push(row);
  if(!rows.length) return [];
  const header=rows.shift().map(x=>x.trim().toLowerCase());
  if(new Set(header).size!==header.length) throw new Error('Duplicate CSV header');
  return rows.map(row=>Object.fromEntries(header.map((h,i)=>[h,(row[i]??'').trim()])));
}
export function importPosCsv(text, resolve) {
  const rows=parseCsv(text);
  const required=['order_id','paid_at','item_id','quantity','unit_gross_try','vat_percent'];
  const grouped = new Map();
  for (const row of rows) {
    if (!required.every(key=>key in row)) throw new Error('Missing POS CSV columns');
    if (!row.order_id) throw new Error('Missing POS order ID');
    const num=value=>value.trim()==='' ? NaN : Number(value);
    const item = {
      itemId:row.item_id, quantity:num(row.quantity), unitGross:num(row.unit_gross_try),
      discountGross:row.discount_gross_try ? num(row.discount_gross_try):0,
      vatPercent:row.vat_percent===''?null:num(row.vat_percent),
    };
    if(!validSaleLine(item,resolve)) throw new Error('Invalid POS line '+row.order_id);
    const order=grouped.get(row.order_id) ?? {
      id:row.order_id,paidAt:row.paid_at,source:'pos_csv',
      attribution:{utm_source:row.utm_source,utm_medium:row.utm_medium,utm_campaign:row.utm_campaign,qr:row.qr},
      lines:[],
    };
    if(order.paidAt!==row.paid_at) throw new Error('Conflicting POS timestamps');
    order.lines.push(item);grouped.set(row.order_id,order);
  }
  return [...grouped.values()].map(order=>makePaidOrder(order,resolve));
}
// Re-imports must not silently discard conflicting receipts or count a payment
// twice. The POS export may upgrade a staff declaration if SKU/quantity/amount
// agree. Conflicts fail atomically; owners must reconcile with their POS.
const saleLinesSignature = (order, includeVat) => JSON.stringify(
  order.lines.map(line => [
    line.itemId, line.quantity, money(line.unitGross), money(line.discountGross ?? 0),
    ...(includeVat ? [line.vatPercent ?? null] : []),
  ]).map(JSON.stringify).sort()
);
export function reconcilePosOrders(existing, imported) {
  if (!Array.isArray(existing) || !Array.isArray(imported)) throw new Error('Invalid order collections');
  const indexed = new Map();
  for (const record of existing) {
    if (!record || typeof record.id !== 'string' || indexed.has(record.id)) throw new Error('Duplicate existing receipt');
    indexed.set(record.id, record);
  }
  let added=0, upgraded=0, skipped=0;
  for (const receipt of imported) {
    if (receipt?.status !== 'paid' || receipt.source !== 'pos_csv' || typeof receipt.id !== 'string')
      throw new Error('Expected paid POS receipts');
    const old = indexed.get(receipt.id);
    if (!old) {
      indexed.set(receipt.id, receipt);
      added++;
      continue;
    }
    if (saleLinesSignature(old, false) !== saleLinesSignature(receipt, false))
      throw new Error('Conflicting paid receipt: ' + receipt.id);
    if (old.source === 'staff_manual') {
      // A matching POS receipt is stronger evidence, but still locally imported,
      // not server-verified. Carry forward the original campaign if POS lacks it.
      const meta = Object.fromEntries(['utm_source','utm_medium','utm_campaign','qr']
        .map(key => [key, receipt.attribution?.[key] || old.attribution?.[key] || '']));
      indexed.set(receipt.id, { ...receipt, attribution:meta });
      upgraded++;
    } else if (old.source === 'pos_csv') {
      if (old.paidAt !== receipt.paidAt || saleLinesSignature(old, true) !== saleLinesSignature(receipt, true))
        throw new Error('Conflicting POS receipt version: ' + receipt.id);
      skipped++;
    } else throw new Error('Unknown existing receipt source');
  }
  return { orders:[...indexed.values()], added, upgraded, skipped };
}

export function makeOrderSlip({id,lines,quoteTotal,attribution}) {
  if(!/^[a-z0-9_-]{4,100}$/i.test(id)) throw new Error('Invalid draft id');
  if(!Array.isArray(lines)||!lines.length||lines.length>100 ||
     !lines.every(([sku,q])=>euroSafeId(sku)&&Number.isInteger(q)&&q>=1&&q<=99))
    throw new Error('Invalid draft lines');
  const data={v:1,id,lines,quoteTotal:money(quoteTotal),attribution:attribution??{}};
  return 'PCT1.'+btoa(JSON.stringify(data)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export function parseOrderSlip(code, resolve) {
  const value=String(code??'').trim();
  if(value.length>15000||!/^PCT1\.[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid order slip');
  let data;
  try {data=JSON.parse(atob(value.slice(5).replace(/-/g,'+').replace(/_/g,'/')));} catch {throw new Error('Unreadable order slip');}
  if(data?.v!==1 || !/^[a-z0-9_-]{4,100}$/i.test(data.id) ||
     !Array.isArray(data.lines)||!data.lines.length||data.lines.length>100) throw new Error('Bad order slip');
  let total=0;
  const lines=data.lines.map(([itemId,quantity])=>{
    const item=resolve(itemId);
    if(!euroSafeId(itemId)||!item||!Number.isInteger(quantity)||quantity<1||quantity>99) throw new Error('Unknown order item');
    total+=item.price*quantity;
    return {itemId,quantity,unitGross:item.price,discountGross:0,vatPercent:null};
  });
  if(Math.abs(money(total)-data.quoteTotal)>0.01) throw new Error('Draft total differs from menu');
  return {id:data.id,lines,quoteTotal:money(total),attribution:data.attribution??{}};
}
