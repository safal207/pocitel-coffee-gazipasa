import { accountConfig } from './account-config.js';
import { createAccountClient, validAccountConfig } from './customer-auth.js';
import { loadPreferences, savePreferences, preferenceDefaults, preferenceKey } from './customer-preferences.js';
import { milkOptions, syrupOptions } from './order-options.js?v=20261106-builder';

const copy={
  title:['Benim Poçitel’im','My Poçitel','Мой Poçitel'],
  close:['Kapat','Close','Закрыть'],
  intro:['Bir dahaki sefere sevdiğin seçimler elinin altında.','Keep your favourites close for your next visit.','Любимые настройки — под рукой к следующему визиту.'],
  local:['Tercihlerin bu tarayıcıda saklanır. Kayıt gerekmez.','Preferences stay in this browser. No account needed.','Предпочтения сохраняются в этом браузере. Регистрация не нужна.'],
  drink:['Sevdiğin içecek','Your go-to drink','Любимый напиток'],
  milk:['Süt tercihi','Milk preference','Молоко'],
  syrup:['Şurup tercihi','Syrup preference','Сироп'],
  serving:['Servis','Serving','Подача'],
  cafe:['Kafede','At the café','В кафе'],
  takeaway:['Al götür','To go','С собой'],
  save:['Bu cihazda kaydet','Save on this device','Сохранить на устройстве'],
  saved:['Bu cihazda kaydedildi.','Saved on this device.','Сохранено на этом устройстве.'],
  session:['Tarayıcı kaydetmeye izin vermedi. Yalnızca bu oturumda geçerli.','Storage unavailable. Available for this session only.','Браузер не разрешил сохранение. Настройки действуют только в этой сессии.'],
  choose:['İçeceğimi seç','Choose my drink','Выбрать мой напиток'],
  price:['Seçenekler ve güncel toplam eklemeden önce gösterilir.','Review options and the total before adding.','Настройки и итоговую цену увидите перед добавлением.'],
  clear:['Bu cihazdaki tercihlerimi sil','Clear my preferences on this device','Стереть мои настройки на устройстве'],
  cleared:['Tercihler sıfırlandı.','Preferences reset.','Настройки сброшены.'],
  devices:['Diğer cihazlarda da hatırla','Remember across devices','Сохранять между устройствами'],
  unavailable:['Hesapla giriş henüz açık değil. Şimdilik tercihlerini bu cihazda kaydedebilirsin.','Account sign-in is not available yet. You can save preferences on this device.','Вход в аккаунт пока недоступен. Сейчас можно сохранить предпочтения на этом устройстве.'],
  syncHelp:['Giriş yapmak tercihlerini otomatik yüklemez. Kaydetmeyi veya yüklemeyi sen seçersin. Pazarlama mesajlarına abone olmazsın.','Signing in does not upload preferences automatically. Choose whether to save or load them. No marketing subscription.','Вход сам по себе не передаёт предпочтения. Вы сами выбираете, сохранить их в аккаунт или загрузить. Подписка на рекламу не включается.'],
  google:['Google ile devam et','Continue with Google','Продолжить с Google'],
  channel:['Giriş yöntemi','Sign-in method','Способ входа'],
  email:['E-posta','Email','Почта'],
  address:['E-posta adresi','Email address','Адрес почты'],
  phone:['Ülke koduyla WhatsApp numarası','WhatsApp number with country code','Номер WhatsApp с кодом страны'],
  send:['Giriş kodu gönder','Send sign-in code','Получить код входа'],
  code:['Giriş kodu','Sign-in code','Код входа'],
  verify:['Kodu doğrula','Verify code','Подтвердить код'],
  sent:['Kodu kontrol et. E-postada giriş bağlantısı da olabilir.','Check for your code. An email may also contain a sign-in link.','Проверьте код. В письме также может быть ссылка для входа.'],
  signed:['Hesabına giriş yaptın.','You are signed in.','Вы вошли в аккаунт.'],
  upload:['Hesabıma kaydet','Save to my account','Сохранить в аккаунт'],
  download:['Hesabımdan yükle','Load from my account','Загрузить из аккаунта'],
  remove:['Hesaptaki tercihleri sil','Delete account preferences','Удалить предпочтения из аккаунта'],
  cloudSaved:['Tercihler hesabına kaydedildi.','Preferences saved to your account.','Предпочтения сохранены в аккаунте.'],
  noCloud:['Hesabında henüz kayıtlı tercih yok.','No preferences saved to your account yet.','В аккаунте пока нет сохранённых предпочтений.'],
  cloudDeleted:['Hesaptaki tercihler silindi. Giriş hesabın korundu.','Account preferences deleted. Your sign-in account remains.','Предпочтения из аккаунта удалены. Сам аккаунт входа сохранён.'],
  out:['Çıkış yap','Sign out','Выйти'],
  error:['İşlem tamamlanamadı. Tercihlerin bu cihazda kullanılabilir. Tekrar dene.','Could not complete this action. Device preferences are still available. Try again.','Не удалось завершить действие. Настройки на устройстве доступны. Попробуйте ещё раз.'],
};
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function setupCustomerAccount({catalog,getLanguage,onChooseDrink}) {
  const dialog=document.querySelector('#customer-account');
  const storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)};
  let opener,client,user,pending,initializing,preferences=loadPreferences(storage);
  const t=key=>copy[key][getLanguage()];
  const status=message=>{dialog.querySelector('#profile-status').textContent=message};
  function formValues(){return Object.fromEntries(new FormData(dialog.querySelector('#preference-form')))}
  function render(){
    const lang=getLanguage();
    const select=(field,label,options)=>`<label>${t(label)}<select name="${field}" id="profile-${field}">${options.map(option=>`<option value="${option.id}" ${preferences[field]===option.id?'selected':''}>${escape(option.labels[lang])}</option>`).join('')}</select></label>`;
    dialog.innerHTML=`<div class="cart-header"><h2 id="profile-title">${t('title')}</h2><button type="button" class="icon-button" data-profile="close" aria-label="${t('close')}">×</button></div>
      <p class="profile-intro">${t('intro')}</p><p class="profile-scope">${t('local')}</p>
      <form id="preference-form" class="profile-form">
        ${select('drink','drink',['cappuccino','latte','americano','iced-latte','iced-americano','tea'].map(id=>({id,labels:catalog.get(id).names})))}
        <div class="profile-options">${select('milk','milk',milkOptions)}${select('syrup','syrup',syrupOptions)}</div>
        ${select('serving','serving',[{id:'cafe',labels:copy.cafe},{id:'takeaway',labels:copy.takeaway}])}
        <button type="submit" class="button primary">${t('save')}</button>
        <button type="button" class="button quiet" data-profile="choose">${t('choose')} ↗</button><p class="profile-fine">${t('price')}</p>
      </form><button type="button" class="profile-reset" data-profile="clear">${t('clear')}</button>
      <section class="profile-cloud"><h3>${t('devices')}</h3><p class="profile-fine">${client?t('syncHelp'):t('unavailable')}</p>
        ${client?(user?`<p>${t('signed')}</p><div class="profile-cloud-actions"><button type="button" class="button primary" data-profile="upload">${t('upload')}</button><button type="button" class="button quiet" data-profile="download">${t('download')}</button><button type="button" class="button quiet" data-profile="out">${t('out')}</button></div><button type="button" class="profile-reset" data-profile="remove">${t('remove')}</button>`:`${client.providers.google?`<button type="button" class="button quiet" data-profile="google">${t('google')}</button>`:''}
        ${client.providers.email||client.providers.whatsapp?`<form id="profile-login" class="profile-form"><label>${t('channel')}<select name="channel" id="profile-channel">${client.providers.email?`<option value="email">${t('email')}</option>`:''}${client.providers.whatsapp?'<option value="whatsapp">WhatsApp</option>':''}</select></label><label><span id="profile-address-label">${client.providers.email?t('address'):t('phone')}</span><input name="address" type="${client.providers.email?'email':'tel'}" autocomplete="${client.providers.email?'email':'tel'}" required maxlength="254" ${client.providers.email?'':'pattern="\\+[1-9][0-9]{6,14}"'}></label><button type="submit" class="button primary">${t('send')}</button></form><form id="profile-verify" class="profile-form" hidden><label>${t('code')}<input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" maxlength="10" required></label><button type="submit" class="button primary">${t('verify')}</button></form>`:''}`):''}
      </section><p id="profile-status" role="status" aria-live="polite"></p>`;
  }
  async function initialize(){
    if(!validAccountConfig(accountConfig))return;
    if(!initializing)initializing=createAccountClient(accountConfig).then(value=>{client=value});
    await initializing;
    // Await the SDK's callback/session initialization before removing a PKCE code.
    user=await client.user();
    const url=new URL(location.href);
    if(url.searchParams.has('account')){for(const key of ['account','code','error','error_code','error_description'])url.searchParams.delete(key);history.replaceState(null,'',url)}
  }
  function persist(values){const result=savePreferences(storage,values);preferences=result.data;window.dispatchEvent(new CustomEvent('pocitel:preferences',{detail:preferences}));return result}
  async function open(button){opener=button;render();dialog.showModal();try{await initialize();if(client){render();if(new URL(location.href).searchParams.has('account'))dialog.querySelector('[data-profile="close"]').focus()}}catch{initializing=null;status(t('error'))}}
  document.querySelectorAll('[data-open-profile]').forEach(button=>button.addEventListener('click',()=>open(button)));
  dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))opener?.focus({preventScroll:true})});
  dialog.addEventListener('submit',async event=>{
    event.preventDefault();const form=event.target;
    if(form.id==='preference-form'){const result=persist(formValues());status(t(result.persisted?'saved':'session'));return}
    const submit=form.querySelector('button[type="submit"]');submit.disabled=true;
    try{
      if(form.id==='profile-login'){
        const data=new FormData(form);pending={channel:data.get('channel'),value:String(data.get('address')).trim()};
        await client.requestCode(pending.channel,pending.value);dialog.querySelector('#profile-verify').hidden=false;status(t('sent'));dialog.querySelector('[name="code"]').focus();
      }else if(form.id==='profile-verify'&&pending){await client.verifyCode(pending.channel,pending.value,new FormData(form).get('code'));user=await client.user();pending=null;render();status(t('signed'))}
    }catch{status(t('error'))}finally{if(submit.isConnected)submit.disabled=false}
  });
  dialog.addEventListener('change',event=>{
    if(event.target.id!=='profile-channel')return;
    const email=event.target.value==='email',input=dialog.querySelector('[name="address"]');input.type=email?'email':'tel';input.autocomplete=email?'email':'tel';input.value='';if(email)input.removeAttribute('pattern');else input.pattern='\\+[1-9][0-9]{6,14}';dialog.querySelector('#profile-address-label').textContent=t(email?'address':'phone');pending=null;dialog.querySelector('#profile-verify').hidden=true;
  });
  dialog.addEventListener('click',async event=>{
    const button=event.target.closest('[data-profile]');if(!button)return;
    const action=button.dataset.profile;
    if(action==='close'){dialog.close();return}
    if(action==='choose'){persist(formValues());dialog.close();onChooseDrink(preferences,opener);return}
    if(action==='clear'){try{localStorage.removeItem(preferenceKey)}catch{}preferences={...preferenceDefaults};window.dispatchEvent(new CustomEvent('pocitel:preferences',{detail:preferences}));render();status(t('cleared'));return}
    if(!client)return;button.disabled=true;
    try{
      if(action==='google')await client.google();
      else if(action==='out'){await client.signOut();user=null;pending=null;render()}
      else if(action==='upload'){await client.save(formValues());status(t('cloudSaved'))}
      else if(action==='download'){const remote=await client.load();if(remote){persist(remote);render();status(t('saved'))}else status(t('noCloud'))}
      else if(action==='remove'){await client.remove();status(t('cloudDeleted'))}
    }catch{status(t('error'))}finally{if(button.isConnected)button.disabled=false}
  });
  if(validAccountConfig(accountConfig)&&new URL(location.href).searchParams.get('account')==='1')open(document.querySelector('[data-open-profile]'));
  return {get preferences(){return preferences}};
}
