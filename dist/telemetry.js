// First-party local diagnostics. No cookies, ad pixels, network requests,
// customer identifiers, or collection before explicit opt-in.
export const TELEMETRY_KEY='pocitel-local-events-v1';
export const TELEMETRY_CONSENT='pocitel-local-events-optin-v1';
export const EVENTS=new Set([
  'menu_view','category_select','dish_view','add_to_cart','quantity_change',
  'offer_view','offer_accept','offer_decline','waiter_screen_view',
  'share_tap','share_cancel','share_fallback','combo_change','combo_added',
]);
export function safeAttribution(input) {
  const qs=input instanceof URLSearchParams ? input : new URLSearchParams(input??'');
  const keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','qr'];
  return Object.fromEntries(keys.map(key=>{
    const value=String(qs.get(key)??'').toLowerCase().slice(0,48);
    return [key,/^[a-z0-9_.-]{0,48}$/.test(value)?value:''];
  }));
}
export function safeEvent(name, props={}, timestamp=new Date().toISOString()) {
  if(!EVENTS.has(name)) throw new Error('Unknown analytics event');
  const itemId=typeof props.itemId==='string' && /^[a-z0-9~_-]{1,140}$/i.test(props.itemId) ? props.itemId : '';
  const language=['tr','en','ru'].includes(props.language)?props.language:'tr';
  const amount=Number.isFinite(props.amount)&&props.amount>=0&&props.amount<=1000000 ? props.amount : null;
  const quantity=Number.isInteger(props.quantity)&&props.quantity>=0&&props.quantity<=99 ? props.quantity : null;
  const variant=['control','treatment'].includes(props.variant)?props.variant:'';
  const result={event:name,at:timestamp,language,itemId,amount,quantity,variant,
    attribution:safeAttribution(new URLSearchParams(props.attribution??''))};
  return result;
}
export function cleanLog(events,now=Date.now()) {
  if(!Array.isArray(events)) return [];
  const cutoff=now-30*86400000;
  return events.filter(x=>x&&EVENTS.has(x.event)&&Number.isFinite(Date.parse(x.at))&&Date.parse(x.at)>=cutoff&&Date.parse(x.at)<=now+86400000).slice(-1000);
}
export function createLocalTelemetry({storage,session,search}) {
  // Do not throw when Safari private mode or storage policies disable access.
  const get=(key)=>{try{return storage.getItem(key)}catch{return null}};
  const put=(key,value)=>{try{storage.setItem(key,value);return true}catch{return false}};
  let active=get(TELEMETRY_CONSENT)==='yes';
  const attribution=safeAttribution(search);
  let events=[];
  try {events=cleanLog(JSON.parse(get(TELEMETRY_KEY)||'[]'))} catch {events=[]}
  const commit=()=>put(TELEMETRY_KEY,JSON.stringify(events));
  return {
    get enabled(){return active},
    setEnabled(enabled){
      active=Boolean(enabled);
      put(TELEMETRY_CONSENT,active?'yes':'no');
      if(!active){events=[];try{storage.removeItem(TELEMETRY_KEY)}catch{}}
      return active;
    },
    record(name,props={}){
      if(!active) return false;
      const record=safeEvent(name,{...props,attribution:new URLSearchParams(attribution)});
      events=cleanLog([...events,record]);
      return commit();
    },
    export(){return cleanLog(events)},
    clear(){events=[];try{storage.removeItem(TELEMETRY_KEY)}catch{}},
    attribution,
  };
}
export function experimentVariant(sessionKey,experimentKey) {
  // Stable deterministic assignment for opted-in local A/B QA. No production
  // treatment is enabled by default and no "lift" claimed without paid orders.
  const text=String(sessionKey)+'|'+String(experimentKey);
  let hash=2166136261;
  for(const char of text){hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0}
  return hash%2===0?'control':'treatment';
}
