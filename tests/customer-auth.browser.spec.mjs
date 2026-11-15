import { test,expect } from '@playwright/test';
// Provider contract tests use intercepted synthetic responses, never live users/messages.
const project='https://pocitel-test.supabase.co';
async function setup(page,{signed=false}={}){
  await page.route('**/account-config.js',route=>route.fulfill({contentType:'text/javascript',body:`export const accountConfig={url:'${project}',publishableKey:'sb_publishable_test_fixture',privacyReviewed:true,providers:{google:true,email:true,whatsapp:true}};`}));
  const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated',email:'synthetic@example.test',app_metadata:{provider:'email'},user_metadata:{},identities:[],created_at:'2026-11-15T00:00:00Z'};
  if(signed){
    const token=[{alg:'HS256',typ:'JWT'},{sub:user.id,aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+3600},'synthetic-signature'].map((part,i)=>i===2?part:Buffer.from(JSON.stringify(part)).toString('base64url')).join('.');
    await page.addInitScript(session=>localStorage.setItem('pocitel-customer-auth-v1',JSON.stringify(session)),{access_token:token,refresh_token:'synthetic-test-only',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user});
  }
  const requests=[];
  await page.route(project+'/**',async route=>{
    const request=route.request(),url=new URL(request.url());requests.push({method:request.method(),url,body:request.postDataJSON()});
    const headers={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,DELETE,OPTIONS'};
    if(request.method()==='OPTIONS')return route.fulfill({status:204,headers});
    if(url.pathname==='/auth/v1/user')return route.fulfill({contentType:'application/json',headers,body:JSON.stringify(user)});
    if(url.pathname==='/auth/v1/verify')return route.fulfill({status:403,contentType:'application/json',headers,body:JSON.stringify({code:'otp_expired',msg:'Synthetic expired code'})});
    if(url.pathname==='/rest/v1/customer_preferences')return route.fulfill({status:200,contentType:'application/json',headers,body:request.method()==='GET'?JSON.stringify({preferences:{drink:'tea',milk:'standard',syrup:'none',serving:'cafe'}}):'[]'});
    if(url.pathname==='/auth/v1/authorize')return route.fulfill({contentType:'text/html',body:'<p>Synthetic provider page</p>'});
    return route.fulfill({status:200,contentType:'application/json',headers,body:'{}'});
  });
  await page.goto('/?lang=ru');await page.locator('[data-open-profile]').click();await expect(page.locator('.profile-cloud [data-profile]')).not.toHaveCount(0);
  return requests;
}
test('configured email and WhatsApp use real SDK requests; an invalid code never signs a guest in',async({page})=>{
  const requests=await setup(page);await page.locator('#profile-login [name="address"]').fill('synthetic@example.test');await page.locator('#profile-login [type="submit"]').click();await expect(page.locator('#profile-verify')).toBeVisible();
  expect(requests.find(r=>r.url.pathname==='/auth/v1/otp').body.email).toBe('synthetic@example.test');
  await page.locator('#profile-verify [name="code"]').fill('123456');await page.locator('#profile-verify [type="submit"]').click();await expect(page.locator('#profile-status')).toContainText('Не удалось');await expect(page.locator('[data-profile="upload"]')).toHaveCount(0);
  await page.locator('#profile-channel').selectOption('whatsapp');await page.locator('#profile-login [name="address"]').fill('+901234567890');await page.locator('#profile-login [type="submit"]').click();await expect(page.locator('#profile-verify')).toBeVisible();
  expect(requests.filter(r=>r.url.pathname==='/auth/v1/otp').at(-1).body.channel).toBe('whatsapp');
});
test('configured session sync is explicit and scoped to the verified user, with no cart mutation',async({page})=>{
  const requests=await setup(page,{signed:true});await expect(page.locator('[data-profile="upload"]')).toBeVisible();expect(requests.filter(r=>r.url.pathname.includes('customer_preferences'))).toHaveLength(0);
  await page.locator('#profile-milk').selectOption('oat');await page.locator('[data-profile="upload"]').click();await expect(page.locator('#profile-status')).toContainText('сохранены в аккаунте');
  const upload=requests.find(r=>r.method==='POST'&&r.url.pathname.includes('customer_preferences'));expect(upload.body.user_id).toBe('11111111-1111-4111-8111-111111111111');expect(upload.body.preferences.milk).toBe('oat');expect(Object.keys(upload.body).sort()).toEqual(['preferences','updated_at','user_id']);
  await page.locator('[data-profile="download"]').click();await expect(page.locator('#profile-drink')).toHaveValue('tea');
  await page.locator('[data-profile="remove"]').click();await expect(page.locator('#profile-status')).toContainText('удалены');
  const deletion=requests.find(r=>r.method==='DELETE');expect(deletion.url.searchParams.get('user_id')).toBe('eq.11111111-1111-4111-8111-111111111111');
  expect(await page.evaluate(()=>localStorage.getItem('pocitel-selection-v1'))).toBeNull();await page.locator('[data-profile="out"]').click();await expect(page.locator('[data-profile="upload"]')).toHaveCount(0);
});
test('Google redirect uses PKCE and returns to this menu root',async({page})=>{
  await setup(page);const request=page.waitForRequest(url=>url.url().startsWith(project+'/auth/v1/authorize'));await page.locator('[data-profile="google"]').click();const url=new URL((await request).url());expect(url.searchParams.get('provider')).toBe('google');expect(url.searchParams.get('code_challenge')).toBeTruthy();expect(url.searchParams.get('code_challenge_method')).toBe('s256');expect(new URL(url.searchParams.get('redirect_to')).pathname).toBe('/');
});
