export const preferenceKey='pocitel-preferences-v1';
export const preferenceDefaults=Object.freeze({drink:'cappuccino',milk:'standard',syrup:'none',serving:'cafe'});
const values={drink:['cappuccino','latte','americano','iced-latte','iced-americano','tea'],milk:['standard','oat','almond'],syrup:['none','vanilla','caramel','hazelnut','coconut'],serving:['cafe','takeaway']};
export function cleanPreferences(input={}) {
  return Object.fromEntries(Object.entries(preferenceDefaults).map(([key,fallback])=>[key,values[key].includes(input?.[key])?input[key]:fallback]));
}
export function loadPreferences(storage) {
  try { return cleanPreferences(JSON.parse(storage.getItem(preferenceKey))); } catch { return {...preferenceDefaults}; }
}
export function savePreferences(storage,input) {
  const data=cleanPreferences(input);
  try { storage.setItem(preferenceKey,JSON.stringify(data)); return {data,persisted:true}; }
  catch { return {data,persisted:false}; }
}
