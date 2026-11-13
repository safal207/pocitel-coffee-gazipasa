import { test,expect } from '@playwright/test';
import { items } from '../dist/catalog.js';
const base=process.env.POCITEL_TEST_BASE_URL??'http://127.0.0.1:8088';
for(const lang of ['tr','en','ru'])for(const width of [320,390,768])test(`large cart pictures ${lang} ${width}px`,async({page},testInfo)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setViewportSize({width,height:844});
 await page.addInitScript(()=>localStorage.setItem('pocitel-selection-v1',JSON.stringify([['smoked-turkey',1],['cappuccino',1]])));
 await page.goto(base+'/?lang='+lang);await page.locator('#selection-bar').click();
 const rows=page.locator('#cart-items .cart-row');await expect(rows).toHaveCount(2);
 for(const row of await rows.all()){
  const image=row.locator('.cart-product-image img');
  await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
  const [card,photo]=await Promise.all([row.boundingBox(),image.boundingBox()]);
  expect(photo.width).toBeGreaterThanOrEqual(card.width-3);expect(photo.height).toBeGreaterThanOrEqual(178);
  expect(await image.evaluate(node=>getComputedStyle(node).objectFit)).toBe('contain');
 }
 if(lang==='ru'&&width===390)await page.screenshot({path:testInfo.outputPath('large-cart-mobile.png')});
 const total=items.get('smoked-turkey').price+items.get('cappuccino').price;
 await expect(page.locator('#total-price')).toContainText(String(total));
 await page.locator('#cart-items [data-item="cappuccino"][data-quantity="1"]').click();
 await expect(page.locator('#selection-bar [data-count]')).toHaveText('3');
 await expect(page.locator('#total-price')).toContainText(String(total+items.get('cappuccino').price));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 await page.locator('#show-waiter').click();await expect(page.locator('#waiter')).toBeVisible();
 await expect(page.locator('#waiter-total')).toContainText(String(total+items.get('cappuccino').price));expect(errors).toEqual([]);
});
for(const lang of ['tr','en','ru'])test(`plain ingredients without fake cutaway ${lang}`,async({page},testInfo)=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'/?lang='+lang+'&item=cilbir');
 const viewer=page.locator('#post-viewer');await expect(viewer).toBeVisible();
 await expect(viewer.locator('[type=range],.cutaway-divider,.cutaway-controls')).toHaveCount(0);
 const list=viewer.locator('.static-ingredients');await expect(list.locator('li')).toHaveCount(4);
 if(lang==='ru')await page.screenshot({path:testInfo.outputPath('plain-ingredients.png')});
 await list.locator('summary').focus();await page.keyboard.press('Enter');await expect(list).not.toHaveAttribute('open','');
 await page.keyboard.press('Enter');await expect(list).toHaveAttribute('open','');
});
