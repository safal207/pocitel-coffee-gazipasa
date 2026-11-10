import { test, expect } from '@playwright/test';

const base = process.env.POCITEL_TEST_BASE_URL ?? `http://127.0.0.1:${process.env.PORT ?? '8088'}`;

test('native system chooser is requested immediately from the first card tap', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: data => {
      window.__shared = { data, activation: navigator.userActivation?.isActive };
      return Promise.resolve();
    }});
  });
  await page.goto(`${base}/?lang=ru&item=sweet-morning`, { waitUntil:'domcontentloaded' });
  await page.locator('#post-viewer .social-rail-share').click();
  const native = await page.evaluate(() => window.__shared);
  expect(native.data.title).toContain('Poçitel');
  expect(native.data.title).toContain('₺');
  expect(native.data.text).toContain('Посмотри это блюдо');
  expect(native.data.url).toMatch(/share-ru-sweet-morning\.html$/);
  if (native.activation !== undefined) expect(native.activation).toBe(true);
  await expect(page.locator('#post-viewer')).toBeVisible();
  await expect(page.locator('#quick-share')).toHaveCount(0);
  await expect(page.locator('#share-dialog')).toHaveCount(0);
});

test('cancelling native share never opens another menu', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'share', {
    configurable: true,
    value: () => Promise.reject(Object.assign(new Error('User cancelled'), {name:'AbortError'})),
  }));
  await page.goto(`${base}/?lang=ru&item=sweet-morning`, { waitUntil:'domcontentloaded' });
  await page.locator('#post-viewer .social-rail-share').click();
  await expect(page.locator('#quick-share')).toHaveCount(0);
  await expect(page.locator('#post-viewer')).toBeVisible();
});

test('native sharing permission failure falls back to direct social choices', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'share', {
    configurable: true,
    value: () => Promise.reject(Object.assign(new Error('blocked'), {name:'NotAllowedError'})),
  }));
  await page.goto(`${base}/?lang=en&item=sweet-morning`, { waitUntil:'domcontentloaded' });
  await page.locator('#post-viewer .social-rail-share').click();
  const tray = page.locator('#quick-share');
  await expect(tray).toBeVisible();
  await expect(tray.locator('[data-quick-target]')).toHaveCount(4);
  await expect(tray.locator('[data-quick-target="telegram"]')).toHaveAttribute('href', /t\.me\/share\/url/);
  await tray.locator('#close-quick-share').click();
  await expect(tray).toHaveCount(0);
});

test('no Web Share API: quick dock works inside modal without extra dialog', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'share', {
    configurable:true, value: undefined,
  }));
  await page.setViewportSize({width:320,height:700});
  await page.goto(`${base}/?lang=ru&item=sweet-morning`, { waitUntil:'domcontentloaded' });
  await page.locator('#post-viewer .social-rail-share').click();
  const tray = page.locator('#post-viewer #quick-share');
  await expect(tray).toBeVisible();
  await expect(tray.locator('[data-quick-target="whatsapp"]')).toHaveAttribute('href', /wa\.me/);
  const box=await tray.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.x+box.width).toBeLessThanOrEqual(321);
  await expect(tray.locator('[data-quick-target]')).toHaveCount(4);
  const whatsapp=await tray.locator('[data-quick-target="whatsapp"]').getAttribute('href');
  expect(new URL(whatsapp).searchParams.get('text')).toContain('share-ru-sweet-morning.html');
  await tray.locator('.quick-share-copy').click();
  const manual=tray.locator('.quick-share-manual');
  if (await manual.count()) await expect(manual).toHaveValue(/share-ru-sweet-morning\.html$/);
  else await expect(tray).toHaveCount(0);
});

for (const [lang,title] of [['tr','Türkçe'], ['en','English'], ['ru','Русский']]) {
  test(`fallback ${title} direct links share same dish and work in feed`, async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, 'share', {
      configurable:true,value:undefined,
    }));
    await page.goto(`${base}/?lang=${lang}`, { waitUntil:'domcontentloaded' });
    await page.locator('#results [data-share]').first().click();
    const tray=page.locator('body > #quick-share');
    await expect(tray).toBeVisible();
    const href=await tray.locator('[data-quick-target="facebook"]').getAttribute('href');
    expect(new URL(href).searchParams.get('u')).toContain(`share-${lang}-`);
    await page.keyboard.press('Escape');
    await expect(tray).toHaveCount(0);
  });
}
