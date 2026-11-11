import { test, expect } from '@playwright/test';

const base = process.env.POCITEL_TEST_BASE_URL ?? `http://127.0.0.1:${process.env.PORT ?? '8088'}`;

test.describe('Poçitel visually quiet dish detail on mobile', () => {
  for (const width of [320, 360, 390, 768]) for (const [lang, hint, all] of [
    ['tr', 'Kaydır, içini gör', 'Tüm malzemeler'],
    ['en', 'Swipe to reveal', 'All ingredients'],
    ['ru', 'Проведи, чтобы раскрыть', 'Весь состав'],
  ]) {
    test(`sweet-morning at ${width}px / ${lang}: minimalist UI, accessible content, slider`, async ({ page }) => {
      await page.setViewportSize({ width, height: 780 });
      await page.goto(`${base}/?lang=${lang}&item=sweet-morning`, { waitUntil: 'domcontentloaded' });
      const viewer = page.locator('#post-viewer');
      await expect(viewer).toBeVisible();
      const photo = viewer.locator('.cutaway');
      await expect(photo.locator('[data-qa="inside-overlay"]')).toBeVisible();
      const detail = viewer.locator('.cutaway-details');
      await expect(detail.locator('#cutaway-help')).toHaveText(hint);
      await expect(detail.locator('.cutaway-guide strong')).toHaveCount(0);
      const disclosure = detail.locator('[data-qa="ingredient-disclosure"]');
      await expect(disclosure.locator('summary')).toHaveText(all);
      await expect(disclosure).not.toHaveAttribute('open', '');
      await expect(disclosure.locator('.cutaway-legend')).toBeHidden();
      const header = viewer.locator('.viewer-header');
      const headerBox = await header.boundingBox();
      expect(headerBox.height, 'Header should not crowd photo').toBeLessThanOrEqual(65);
      const close = viewer.locator('#close-post');
      const hit = await close.boundingBox();
      expect(hit.width).toBeGreaterThanOrEqual(42);
      expect(hit.height).toBeGreaterThanOrEqual(42);
      const rail = photo.locator('.post-social-rail');
      await expect(rail).toBeVisible();
      const socialBg = await rail.locator('.social-rail-views').evaluate(el => getComputedStyle(el).backgroundColor);
      const alpha = Number(socialBg.match(/,\s*([\d.]+)\)$/)?.[1]);
      expect(alpha, 'Shorts background opacity').toBeLessThanOrEqual(.5);
      const bookmark = viewer.locator('.viewer-body .post-actions .save-post');
      await expect(bookmark).toBeVisible();
      const bookmarkBg = await bookmark.evaluate(el => getComputedStyle(el).backgroundColor);
      expect(bookmarkBg, 'Bookmark should be unfilled').toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
      await expect(viewer.locator('.viewer-body .post-actions .post-add')).toBeVisible();
      await expect(viewer.locator('#viewer-nutrition .nutrition-panel')).toBeVisible();
      await disclosure.locator('summary').click();
      await expect(disclosure).toHaveAttribute('open', '');
      await expect(disclosure.locator('.cutaway-legend span')).toHaveCount(3);
      const slider = photo.locator('[data-cutaway-range]');
      const toggle = detail.locator('[data-cutaway-toggle]');
      await toggle.click();
      await expect(slider).toHaveValue('0');
      await toggle.click();
      await expect(slider).toHaveValue('100');
      const panel = viewer.locator('#viewer-nutrition .nutrition-panel');
      await panel.locator(':scope > summary').click();
      await expect(panel).toHaveAttribute('open', '');
    });
  }
});

test('Shorts interactions remain independent from photo and order actions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/?lang=ru&item=sweet-morning`, { waitUntil: 'domcontentloaded' });
  const viewer = page.locator('#post-viewer');
  const like = viewer.locator('.post-social-rail [data-like="sweet-morning"]');
  await expect(like).toHaveAttribute('aria-pressed', 'false');
  await like.click();
  await expect(like).toHaveAttribute('aria-pressed', 'true');
  await like.click();
  await expect(like).toHaveAttribute('aria-pressed', 'false');
  const share = viewer.locator('.post-social-rail [data-share="sweet-morning"]');
  await share.click();
  await expect(page.locator('#share-dialog')).toBeVisible();
});

for (const [lang, label, missing] of [
  ['tr', 'Tüm malzemeler', 'daha'],
  ['en', 'All ingredients', 'more'],
  ['ru', 'Весь состав', 'ещё'],
]) {
  test(`the on-photo ingredients open and close without moving the slider / ${lang}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`${base}/?lang=${lang}&item=zucchini`, { waitUntil: 'domcontentloaded' });
    const viewer = page.locator('#post-viewer');
    const caption = viewer.locator('[data-cutaway-ingredients-toggle]');
    const disclosure = viewer.locator('#cutaway-ingredients');
    const slider = viewer.locator('[data-cutaway-range]');
    await expect(caption).toBeVisible();
    await expect(caption).toContainText(missing);
    await expect(caption).toHaveAccessibleName(new RegExp(label));
    await expect(caption).toHaveAttribute('aria-expanded', 'false');
    const originalValue = await slider.inputValue();
    await caption.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(caption).toHaveAttribute('aria-expanded', 'true');
    await expect(slider).toHaveValue(originalValue);
    await disclosure.locator('summary').click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect(caption).toHaveAttribute('aria-expanded', 'false');
    await caption.focus();
    await page.keyboard.press('Enter');
    await expect(disclosure).toHaveAttribute('open', '');
  });
}

test('Add-to-order remains the primary functional CTA', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/?lang=ru&item=sweet-morning`, { waitUntil: 'domcontentloaded' });
  const add = page.locator('#post-viewer .viewer-body .post-actions [data-add="sweet-morning"]');
  await expect(add).toBeVisible();
  await add.click();
  await expect(page.locator('#post-viewer')).not.toBeVisible();
  await expect(page.locator('#selection-bar')).toBeVisible();
  await expect(page.locator('#selection-bar [data-count]')).toHaveText('1');
});
