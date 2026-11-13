import { test,expect } from '@playwright/test';
const base=process.env.POCITEL_TEST_BASE_URL??'http://127.0.0.1:8088';
for(const lang of ['tr','en','ru'])for(const width of [320,390,768])test(`cart merchandising ${lang} ${width}px: explicit addition and exact undo`,async({page},testInfo)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setViewportSize({width,height:844});
 await page.addInitScript(()=>localStorage.setItem('pocitel-selection-v1',JSON.stringify([['cappuccino',1]])));
 await page.goto(base+'/?lang='+lang);await page.locator('#selection-bar').click();
 const card=page.locator('#cart-items .cart-row');await expect(card.locator('.cart-unit-price')).toContainText('185');
 const offer=page.locator('#cart-suggestion');await expect(offer).toBeVisible();
 await expect(offer.locator('h3')).toHaveText(['Pancake','Pancake','Панкейки'][['tr','en','ru'].indexOf(lang)]);
 await expect(offer.locator('img')).toHaveAttribute('src','assets/pancake.webp');
 await expect(offer.locator('.offer-saving')).toContainText('25');
 await expect(offer.locator('.offer-price-preview')).toContainText('185');await expect(offer.locator('.offer-price-preview')).toContainText('460');
 const action=offer.locator('#checkout-offer-toggle');await expect(action).toHaveAttribute('type','button');
 await expect(action).toContainText('275');await expect(page.locator('#total-price')).toContainText('185');
 if(lang==='ru'&&width===390){await offer.scrollIntoViewIfNeeded();await page.screenshot({path:testInfo.outputPath('cart-offer-mobile.png')})}
 await action.click();await expect(page.locator('#total-price')).toContainText('460');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('pocitel-selection-v1')))).toEqual([['sweet-morning',1]]);
 await expect(offer).toHaveClass(/offer-selected/);await action.focus();await page.keyboard.press('Enter');
 await expect(page.locator('#total-price')).toContainText('185');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('pocitel-selection-v1')))).toEqual([['cappuccino',1]]);
 await offer.locator('#skip-extras').click();await expect(offer).not.toBeVisible();
 await page.locator('#cart-items [data-quantity="1"]').click();await expect(offer).not.toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('pocitel-admin-paid-orders-v1'))).toBeNull();
 expect(await page.evaluate(()=>localStorage.getItem('pocitel-local-events-v1'))).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);expect(errors).toEqual([]);
});
test('selected food description and complete drink suppress a further suggestion',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('pocitel-selection-v1',JSON.stringify([['breakfast-plate',1],['tea',1]])));
 await page.goto(base+'/?lang=ru');await page.locator('#selection-bar').click();
 await expect(page.locator('#cart-items .cart-description').first()).toContainText('2 яйца');
 await expect(page.locator('#cart-suggestion')).not.toBeVisible();
});
test('existing pair is combined once with savings and can be restored exactly',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('pocitel-selection-v1',JSON.stringify([['cilbir',1],['tea',1]])));
 await page.goto(base+'/?lang=ru');await page.locator('#selection-bar').click();
 const action=page.locator('#checkout-offer-toggle');await expect(action).toContainText('−15');
 await action.click();await expect(page.locator('#total-price')).toContainText('345');
 await action.click();await expect(page.locator('#total-price')).toContainText('360');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('pocitel-selection-v1')))).toEqual([['cilbir',1],['tea',1]]);
});
