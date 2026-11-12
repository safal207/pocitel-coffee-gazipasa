import http from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, open, unlink, realpath } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { items } from '../dist/catalog.js';
import { resolveOrderItem } from '../dist/order-options.js';
import { COST_FIELDS, normalizedCost, parseCsv, parseOrderSlip, makePaidOrder, importPosCsv, reconcilePosOrders, revenueReport } from '../dist/revenue-core.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const sku=id=>resolveOrderItem(id,items);
const digest=value=>createHash('sha256').update(value).digest();
// Deliberately loopback-only. Remote hosting needs an HTTPS/auth proxy and a
// private volume; the public Pages deployment never contains this workspace.
export async function createOwnerServer({password,dataDir,port=0}={}) {
  if(typeof password!=='string'||password.length<32) throw Error('Owner password must have at least 32 characters');
  let dir=resolve(dataDir??resolve(root,'.private'));
  await mkdir(dir,{recursive:true,mode:0o700});
  dir=await realpath(dir);
  const canonical=value=>process.platform==='win32'?value.toLowerCase():value;
  const publicDir=canonical(await realpath(resolve(root,'dist'))),candidate=canonical(dir);
  if(candidate===publicDir||candidate.startsWith(publicDir+'/')||candidate.startsWith(publicDir+'\\')) throw Error('Private data must be outside dist');
  const lock=await open(resolve(dir,'owner.lock'),'wx',0o600);
  const file=resolve(dir,'ledger.json');
  let state={version:1,orders:[],confirmed:[],costs:{}};
  try { state=JSON.parse(await readFile(file,'utf8')); } catch(error) { if(error.code!=='ENOENT'){await lock.close();await unlink(resolve(dir,'owner.lock'));throw error} }
  if(state.version!==1||!Array.isArray(state.orders)||!Array.isArray(state.confirmed)||!state.costs) {
    await lock.close();await unlink(resolve(dir,'owner.lock'));throw Error('Invalid ledger');
  }
  const secret=digest(password);
  let queue=Promise.resolve();
  const failures=new Map();
  const server=http.createServer(async(req,res)=>{
    const headers={
      'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
      'X-Frame-Options':'DENY','Referrer-Policy':'no-referrer',
      'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
      'X-Robots-Tag':'noindex, nofollow',
    };
    const send=(code,value,type='application/json')=>{
      res.writeHead(code,{...headers,'Content-Type':type+'; charset=utf-8'});
      res.end(type==='application/json'?JSON.stringify(value):value);
    };
    try {
      const authority='127.0.0.1:'+server.address().port;
      if(req.headers.host!==authority) return send(403,{error:'Invalid host'});
      const origin='http://'+authority;
      if((req.headers.origin&&req.headers.origin!==origin)||req.headers['sec-fetch-site']==='cross-site') return send(403,{error:'Cross-origin request refused'});
      const peer=req.socket.remoteAddress;
      const failure=failures.get(peer);
      if(failure&&failure.until>Date.now()&&failure.count>=10) return send(429,{error:'Try again later'});
      const credentials=Buffer.from((req.headers.authorization??'').replace(/^Basic /,''),'base64').toString();
      const valid=(req.headers.authorization??'').startsWith('Basic ')&&credentials.startsWith('owner:')&&timingSafeEqual(secret,digest(credentials.slice(6)));
      if(!valid){
        const old=failure?.until>Date.now()?failure:{count:0,until:Date.now()+60000};
        failures.set(peer,{...old,count:old.count+1});
        res.setHeader('WWW-Authenticate','Basic realm="Pocitel private owner", charset="UTF-8"');
        return send(401,{error:'Owner sign-in required'});
      }
      failures.delete(peer);
      if(req.method==='GET') {
        if(req.url==='/api/report') return send(200,{...revenueReport(state.orders,state.costs,sku),confirmedUnpaid:state.confirmed.filter(x=>!state.orders.some(o=>o.id===x.id)).length});
        if(req.url==='/api/backup') return send(200,state);
        const assets={'/':['owner.html','text/html'],'/owner.js':['owner.js','text/javascript'],'/admin.css':['../dist/admin.css','text/css']};
        if(!assets[req.url]) return send(404,{error:'Not found'});
        const [asset,type]=assets[req.url];
        return send(200,await readFile(resolve(root,'server',asset),'utf8'),type);
      }
      if(req.method!=='POST'||!['/api/pos','/api/costs','/api/confirm','/api/paid'].includes(req.url)) return send(405,{error:'Unsupported operation'});
      if(req.headers['content-type']!=='application/json'||req.headers['x-pocitel-owner']!=='1') return send(403,{error:'Explicit owner request required'});
      const chunks=[];let bytes=0;
      for await(const chunk of req){bytes+=chunk.length;if(bytes>2000000){send(413,{error:'Import too large'});return}chunks.push(chunk)}
      const input=JSON.parse(Buffer.concat(chunks).toString('utf8'));
      // Serialize read-modify-write operations; publish memory only after rename.
      const job=queue.then(async()=>{
        const next=structuredClone(state);
        let result={saved:true};
        if(req.url==='/api/pos') {
          const merged=reconcilePosOrders(next.orders,importPosCsv(input.csv,sku));
          next.orders=merged.orders;result={added:merged.added,upgraded:merged.upgraded,skipped:merged.skipped};
        } else if(req.url==='/api/costs') {
          const rows=parseCsv(input.csv);
          if(!rows.length) throw Error('No cost rows');
          const seen=new Set();
          for(const row of rows){
            if(!items.has(row.item_id)||seen.has(row.item_id)) throw Error('Invalid or duplicate cost SKU');
            seen.add(row.item_id);
            const cost=normalizedCost(Object.fromEntries(COST_FIELDS.map(key=>[key,row[key.toLowerCase()]?.trim()?Number(row[key.toLowerCase()]):null])));
            if(!cost) throw Error('Invalid ingredient cost or variable expense');
            next.costs[row.item_id]=cost;
          }
          result={imported:rows.length};
        } else if(req.url==='/api/confirm') {
          const slip=parseOrderSlip(input.code,sku);
          const existing=next.confirmed.find(x=>x.id===slip.id);
          if(existing&&JSON.stringify(existing.lines)!==JSON.stringify(slip.lines)) throw Error('Conflicting confirmed order');
          if(!existing) next.confirmed.push({...slip,status:'confirmed',confirmedAt:new Date().toISOString()});
        } else {
          if(input.paymentReceived!==true) throw Error('Explicit payment confirmation required');
          const slip=next.confirmed.find(x=>x.id===input.id);
          if(!slip) throw Error('Confirm the order before payment');
          if(next.orders.some(x=>x.id===input.id)) throw Error('Receipt already exists');
          const paid=makePaidOrder({id:slip.id,paidAt:new Date().toISOString(),source:'staff_manual',attribution:slip.attribution,
            lines:slip.lines.map(line=>({...line,vatPercent:input.vatPercent??null}))},sku);
          next.orders.push(paid);
        }
        if(next.orders.length>5000||next.confirmed.length>5000) throw Error('Ledger limit; archive with owner support');
        await writeFile(file+'.tmp',JSON.stringify(next),{mode:0o600});
        await rename(file+'.tmp',file);
        state=next;return result;
      });
      queue=job.catch(()=>{});
      send(200,await job);
    } catch(error) { send(400,{error:error instanceof SyntaxError?'Invalid JSON':error.message}); }
  });
  server.requestTimeout=15000;server.headersTimeout=10000;
  try { await new Promise((ok,no)=>{server.once('error',no);server.listen(port,'127.0.0.1',ok)}); }
  catch(error) {await lock.close();await unlink(resolve(dir,'owner.lock'));throw error}
  return {server,url:'http://127.0.0.1:'+server.address().port,close:async()=>{
    await new Promise(ok=>server.close(ok));await queue;await lock.close();await unlink(resolve(dir,'owner.lock'));
  }};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const app=await createOwnerServer({password:process.env.POCITEL_OWNER_PASSWORD,dataDir:process.env.POCITEL_PRIVATE_DIR,port:Number(process.env.PORT??8090)});
  console.log('Private owner workspace: '+app.url+' (user: owner)');
  for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>app.close().then(()=>process.exit(0)));
}
