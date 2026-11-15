import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanPreferences,loadPreferences,savePreferences,preferenceDefaults } from '../dist/customer-preferences.js';
import { validAccountConfig,createAccountClient } from '../dist/customer-auth.js';

test('preferences accept only catalog choices and discard contact, medical and arbitrary payload fields',()=>{
  assert.deepEqual(cleanPreferences({drink:'tea',milk:'oat',syrup:'none',serving:'takeaway',email:'private@example.test',notes:'private',user_id:'other'}),{drink:'tea',milk:'oat',syrup:'none',serving:'takeaway'});
  assert.deepEqual(cleanPreferences({drink:'javascript:alert(1)',milk:'secret',syrup:null,serving:'delivery'}),preferenceDefaults);
  const storage={getItem:()=>'{bad',setItem:()=>{throw Error('quota')}};
  assert.deepEqual(loadPreferences(storage),preferenceDefaults);assert.equal(savePreferences(storage,{drink:'tea'}).persisted,false);
});
test('cloud stays off without a reviewed setup and modern public key; secrets are rejected',async()=>{
  assert.equal(await createAccountClient(null),null);
  for(const config of [null,{}, {url:'http://example.com',publishableKey:'sb_publishable_test',privacyReviewed:true},{url:'https://test.supabase.co',publishableKey:'sb_secret_bad',privacyReviewed:true},{url:'https://test.supabase.co',publishableKey:'eyJlegacy',privacyReviewed:true},{url:'https://test.supabase.co',publishableKey:'sb_publishable_test'}])assert.equal(validAccountConfig(config),false);
});
test('auth adapter uses PKCE, enabled methods only, verified user identity and explicit sanitized sync',async()=>{
  const calls=[];let currentUser={id:'user-a'};
  const query={select(v){calls.push(['select',v]);return this},eq(k,v){calls.push(['eq',k,v]);return this},maybeSingle:async()=>({data:{preferences:{drink:'tea',email:'discard'}}}),upsert:async(v)=>{calls.push(['upsert',v]);return {}},delete(){calls.push(['delete']);return this},then(resolve){resolve({})}};
  const client={auth:{getUser:async()=>({data:{user:currentUser}}),signInWithOAuth:async v=>{calls.push(['oauth',v]);return {}},signInWithOtp:async v=>{calls.push(['otp',v]);return {}},verifyOtp:async v=>{calls.push(['verify',v]);return {}},signOut:async()=>({})},from:()=>query};
  const auth=await createAccountClient({url:'https://test.supabase.co',publishableKey:'sb_publishable_test',privacyReviewed:true,providers:{google:true,email:true}},{locationUrl:'https://example.test/?lang=ru&next=https://evil.test',createClient:(url,key,options)=>{assert.equal(options.auth.flowType,'pkce');return client}});
  assert.deepEqual(calls,[]);await auth.google();assert.equal(calls[0][1].provider,'google');assert.equal(new URL(calls[0][1].options.redirectTo).searchParams.get('next'),null);
  await auth.requestCode('email','person@example.test');assert.equal(calls[1][1].email,'person@example.test');
  await assert.rejects(auth.requestCode('whatsapp','+901234567890'));await assert.rejects(auth.verifyCode('telegram','person','123456'));
  await auth.save({drink:'tea',private:'discard'});const saved=calls.find(call=>call[0]==='upsert')[1];assert.equal(saved.user_id,'user-a');assert.deepEqual(saved.preferences,{...preferenceDefaults,drink:'tea'});
  await auth.load();assert.ok(calls.some(call=>call[0]==='eq'&&call[1]==='user_id'&&call[2]==='user-a'));
  currentUser=null;await assert.rejects(auth.save(preferenceDefaults));
});
