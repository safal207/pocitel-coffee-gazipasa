import { test,expect } from '@playwright/test';
const base=process.env.POCITEL_TEST_BASE_URL??'http://127.0.0.1:8088';
for(const lang of ['tr','en','ru'])for(const width of [320,360,390,430,768])test(`product-led home ${lang} ${width}px`,async({page},testInfo)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height:844});await page.goto(base+'/?lang='+lang);
  const card=page.locator('.signature-product');await expect(card).toBeVisible();await expect(card.locator('h2')).toContainText(['Hindi','Smoked Turkey','Фокачча'][['tr','en','ru'].indexOf(lang)]);
  await expect(card.locator('.signature-title-row strong')).toContainText('240');await expect(card.locator('.signature-art-note')).toBeVisible();
  const image=card.locator('img');await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
  const bounds=await card.locator('.signature-action').boundingBox();if(width<=430)expect(bounds.y+bounds.height).toBeLessThan(844);
  const photoFrame=await card.locator('.signature-photo').boundingBox();
  expect(Math.abs(photoFrame.width/photoFrame.height-1.5)).toBeLessThan(.02);
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  if(lang==='ru'&&width===390)await page.screenshot({path:testInfo.outputPath('mobile-home.png')});
  await card.locator('.signature-action').click();await expect(page.locator('#post-viewer')).toBeVisible();await expect(page.locator('#viewer-content h2')).toContainText(['Hindi','Smoked Turkey','Фокачча'][['tr','en','ru'].indexOf(lang)]);await page.locator('#close-post').click();
  await page.locator('[data-hero-choice="brunch"]').click();await expect(card.locator('.signature-title-row strong')).toContainText('330');
  const coffee=page.locator('[data-hero-choice="coffee"]');await coffee.focus();await page.keyboard.press('Enter');await expect(coffee).toHaveAttribute('aria-pressed','true');await expect(card.locator('h2')).toHaveText(lang==='ru'?'Капучино':'Cappuccino');
  for(const choice of ['focaccia','brunch','coffee']){
    await page.locator(`[data-hero-choice="${choice}"]`).click();
    await image.evaluate(img=>img.decode());
    const geometry=await image.evaluate(img=>{const frame=img.parentElement.getBoundingClientRect(),rect=img.getBoundingClientRect();return {fit:getComputedStyle(img).objectFit,naturalRatio:img.naturalWidth/img.naturalHeight,width:rect.width,height:rect.height,frameWidth:frame.width,frameHeight:frame.height}});
    expect(geometry.naturalRatio).toBeGreaterThan(1.3);expect(geometry.fit).toBe('cover');
    expect(Math.abs(geometry.width-geometry.frameWidth)).toBeLessThan(1);expect(Math.abs(geometry.height-geometry.frameHeight)).toBeLessThan(1);
    expect(Math.abs(geometry.frameHeight-photoFrame.height)).toBeLessThan(1);
    if(lang==='ru'&&width===390)await page.screenshot({path:testInfo.outputPath(`mobile-${choice}.png`),animations:'disabled'});
  }
  expect(await page.evaluate(()=>localStorage.getItem('pocitel-selection-v1'))).toBeNull();
  await page.locator('[data-home-pairing]').click();await expect(page.locator('#focaccia-promo')).toBeVisible();await page.locator('#close-focaccia').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);expect(errors).toEqual([]);
});
test('reduced-motion home is stable and menu jump remains direct',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/?lang=ru');await expect(page.locator('[data-hero-choice="focaccia"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('.skip').focus();await page.keyboard.press('Enter');await expect(page.locator('#menu')).toBeFocused();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});
test('short mobile viewport keeps product action reachable without clipping',async({page})=>{
  await page.setViewportSize({width:360,height:640});await page.goto(base+'/?lang=ru');
  const action=page.locator('.signature-action');await action.scrollIntoViewIfNeeded();await action.click();await expect(page.locator('#post-viewer')).toBeVisible();await page.locator('#close-post').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(362);
});
