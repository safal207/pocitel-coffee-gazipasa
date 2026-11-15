import { cleanPreferences } from './customer-preferences.js';

export function validAccountConfig(config) {
  if(!config||!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(config.url??''))return false;
  // Only modern publishable keys are accepted; no legacy JWT or service-role key.
  return /^sb_publishable_[A-Za-z0-9_-]+$/.test(config.publishableKey??'')&&config.privacyReviewed===true;
}
let sdkPromise;
function loadSdk() {
  return sdkPromise??=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src=new URL('./vendor/supabase.js',import.meta.url).href;
    script.onload=()=>window.supabase?.createClient?resolve(window.supabase.createClient):reject(Error('SDK unavailable'));
    script.onerror=()=>{sdkPromise=null;script.remove();reject(Error('SDK unavailable'))};document.head.append(script);
  });
}
export async function createAccountClient(config,{createClient,locationUrl=globalThis.location?.href}={}) {
  if(!validAccountConfig(config))return null;
  const factory=createClient??await loadSdk();
  const client=factory(config.url,config.publishableKey,{auth:{flowType:'pkce',detectSessionInUrl:true,persistSession:true,storageKey:'pocitel-customer-auth-v1'}});
  // Always return to this menu root, never to an arbitrary next= or redirect URL.
  const callback=new URL('./',new URL(import.meta.url));
  const current=new URL(locationUrl);callback.searchParams.set('lang',['tr','en','ru'].includes(current.searchParams.get('lang'))?current.searchParams.get('lang'):(document.documentElement.lang||'tr'));
  callback.searchParams.set('account','1');
  const providers={google:config.providers?.google===true,email:config.providers?.email===true,whatsapp:config.providers?.whatsapp===true};
  return {
    providers,
    async user(){const {data,error}=await client.auth.getUser();if(error)return null;return data.user},
    async google(){if(!providers.google)throw Error('Unavailable');const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:callback.href}});if(error)throw error},
    async requestCode(channel,value){
      if(!providers[channel]||!['email','whatsapp'].includes(channel))throw Error('Unavailable');
      const input=channel==='email'?{email:value,options:{emailRedirectTo:callback.href}}:{phone:value,options:{channel:'whatsapp'}};
      const {error}=await client.auth.signInWithOtp(input);if(error)throw error;
    },
    async verifyCode(channel,value,token){
      if(!providers[channel]||!['email','whatsapp'].includes(channel))throw Error('Unavailable');
      const input=channel==='email'?{email:value,token,type:'email'}:{phone:value,token,type:'sms'};
      const {error}=await client.auth.verifyOtp(input);if(error)throw error;
    },
    async load(){const {data:{user},error:authError}=await client.auth.getUser();if(authError||!user)throw Error('Sign in required');const {data,error}=await client.from('customer_preferences').select('preferences').eq('user_id',user.id).maybeSingle();if(error)throw error;return data?cleanPreferences(data.preferences):null},
    async save(preferences){const {data:{user},error:authError}=await client.auth.getUser();if(authError||!user)throw Error('Sign in required');const {error}=await client.from('customer_preferences').upsert({user_id:user.id,preferences:cleanPreferences(preferences),updated_at:new Date().toISOString()},{onConflict:'user_id'});if(error)throw error},
    async remove(){const {data:{user},error:authError}=await client.auth.getUser();if(authError||!user)throw Error('Sign in required');const {error}=await client.from('customer_preferences').delete().eq('user_id',user.id);if(error)throw error},
    async signOut(){const {error}=await client.auth.signOut({scope:'local'});if(error)throw error},
  };
}
