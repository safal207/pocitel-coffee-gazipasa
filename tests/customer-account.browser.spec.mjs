import { test,expect } from '@playwright/test';
const base=process.env.POCITEL_TEST_BASE_URL??'http://127.0.0.1:8088';
for(const lang of ['tr','en','ru'])test(`guest preferences ${lang}: persist, review before adding, reset and no outbound identity requests`,async({page},testInfo)=>{
  await page.setViewportSize({width:320,height:844});const external=[];page.on('request',request=>{if(new URL(request.url()).origin!==new URL(base).origin)external.push(request.url())});
  await page.goto(base+'/?lang='+lang);const opener=page.locator('[data-open-profile]');await opener.click();const dialog=page.locator('#customer-account');await expect(dialog).toBeVisible();
  await expect(dialog.locator('#profile-login')).toHaveCount(0);await expect(dialog.locator('[name="email"]')).toHaveCount(0);
  await dialog.locator('#profile-drink').selectOption('cappuccino');await dialog.locator('#profile-milk').selectOption('oat');await dialog.locator('#profile-syrup').selectOption('vanilla');
  await dialog.locator('#preference-form [type="submit"]').click();await expect(dialog.locator('#profile-status')).not.toBeEmpty();
  if(lang==='ru')await page.screenshot({path:testInfo.outputPath('guest-preferences.png')});
  await dialog.locator('[data-profile="close"]').click();await expect(opener).toBeFocused();await page.reload();await opener.click();await expect(dialog.locator('#profile-milk')).toHaveValue('oat');
  await dialog.locator('[data-profile="choose"]').click();await expect(page.locator('#configure')).toBeVisible();await expect(page.locator('#configure input[name="milk"][value="oat"]')).toBeChecked();await expect(page.locator('#configure input[name="syrup"][value="vanilla"]')).toBeChecked();
  expect(await page.evaluate(()=>localStorage.getItem('pocitel-selection-v1'))).toBeNull();await page.locator('#close-configure').click();await opener.click();await dialog.locator('[data-profile="clear"]').click();
  await expect(dialog.locator('#profile-milk')).toHaveValue('standard');expect(await page.evaluate(()=>localStorage.getItem('pocitel-preferences-v1'))).toBeNull();expect(external).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(322);
});
test('blocked browser storage preserves a usable session and reports the limit',async({page})=>{
  await page.addInitScript(()=>{Storage.prototype.setItem=function(){throw Error('blocked')}});await page.goto(base+'/?lang=ru');await page.locator('[data-open-profile]').click();await page.locator('#preference-form [type="submit"]').click();await expect(page.locator('#profile-status')).toContainText('сессии');
});
