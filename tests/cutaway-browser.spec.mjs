import { test, expect } from '@playwright/test';
import { items, feedOrder, takeawayItems } from '../dist/catalog.js';
import { revealFor } from '../dist/ingredient-reveal.js';

const port = process.env.PORT ?? '8088';
const base = process.env.POCITEL_TEST_BASE_URL ?? `http://127.0.0.1:${port}`;
const eligible = [...feedOrder, ...takeawayItems].filter(entry => revealFor(entry, 2));

const intersection = (a, b) => {
  if (!a || !b) return 0;
  const width = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const height = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return width * height;
};

test.describe('Mobile ingredient reveal / Shorts release gate', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  for (const entry of eligible) {
    test(`${entry.id}: overlay, scroll/touch and social-panel geometry`, async ({ page }) => {
      await page.goto(`${base}/?lang=ru&item=${encodeURIComponent(entry.id)}`, { waitUntil: 'domcontentloaded' });
      const dialog = page.locator('#post-viewer');
      await expect(dialog).toBeVisible();
      const photo = dialog.locator('.cutaway');
      const preview = photo.locator('[data-qa="inside-overlay"]');
      await expect(preview).toBeVisible();
      await expect(preview).toContainText('Внутри');
      await expect(preview).toContainText(revealFor(items.get(entry.id), 2).parts[0]);
      const rail = photo.locator('.post-social-rail');
      const handle = photo.locator('.cutaway-handle');
      await expect(rail).toBeVisible();
      const [p, v, r, h] = await Promise.all([
        preview.boundingBox(), photo.boundingBox(), rail.boundingBox(), handle.boundingBox(),
      ]);
      expect(p, 'Preview bounding box').not.toBeNull();
      expect(v, 'Photo bounding box').not.toBeNull();
      expect(p.x).toBeGreaterThanOrEqual(v.x - 1);
      expect(p.y).toBeGreaterThanOrEqual(v.y - 1);
      expect(p.x + p.width).toBeLessThanOrEqual(v.x + v.width + 1);
      expect(p.y + p.height).toBeLessThanOrEqual(v.y + v.height + 1);
      expect(intersection(p, r), 'Preview must not obscure Shorts controls').toBe(0);
      expect(intersection(p, h), 'Preview must not hide drag handle').toBe(0);
      const slider = photo.locator('[data-cutaway-range]');
      for (const value of ['0', '25', '75', '100']) {
        await slider.evaluate((element, next) => {
          element.value = next;
          element.dispatchEvent(new Event('input', { bubbles: true }));
        }, value);
        await expect(preview).toBeVisible();
        await expect(slider).toHaveAttribute('aria-valuetext', /%/);
      }
    });
  }
});

test.describe('Narrow screens and languages', () => {
  for (const width of [320, 360, 768]) {
    for (const [lang, title] of [['tr', 'İçinde'], ['en', 'Inside'], ['ru', 'Внутри']]) {
      test(`pancake: ${width}px and ${lang}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 740 });
        await page.goto(`${base}/?lang=${lang}&item=sweet-morning`, { waitUntil: 'domcontentloaded' });
        const photo = page.locator('#post-viewer .cutaway');
        const preview = photo.locator('[data-qa="inside-overlay"]');
        await expect(preview).toBeVisible();
        await expect(preview).toContainText(title);
        const [p, v, r, h] = await Promise.all([
          preview.boundingBox(), photo.boundingBox(),
          photo.locator('.post-social-rail').boundingBox(),
          photo.locator('.cutaway-handle').boundingBox(),
        ]);
        expect(p.x).toBeGreaterThanOrEqual(v.x - 1);
        expect(p.x + p.width).toBeLessThanOrEqual(v.x + v.width + 1);
        expect(intersection(p, r)).toBe(0);
        expect(intersection(p, h)).toBe(0);
      });
    }
  }
});
