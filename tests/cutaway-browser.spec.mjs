import { test, expect } from '@playwright/test';
import { items, feedOrder, takeawayItems } from '../dist/catalog.js';
import { revealFor } from '../dist/ingredient-reveal.js';

const port = process.env.PORT ?? '8088';
const base = process.env.POCITEL_TEST_BASE_URL ?? `http://127.0.0.1:${port}`;
const eligible = [...feedOrder, ...takeawayItems].filter(entry => revealFor(entry, 2));
const illustratedPairs = new Set(['smoked-turkey', 'beetroot', 'zucchini', 'lunch-favourite', 'to-go-lunch-favourite', 'omelet-plate', 'pancake', 'sweet-morning']);

const intersection = (a, b) => {
  if (!a || !b) return 0;
  const width = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const height = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return width * height;
};

test.describe('Mobile ingredient reveal / Shorts release gate', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  for (const entry of eligible) {
    test(`${entry.id}: readable ingredients and only meaningful image sliders`, async ({ page }) => {
      await page.goto(`${base}/?lang=ru&item=${encodeURIComponent(entry.id)}`, { waitUntil: 'domcontentloaded' });
      const dialog = page.locator('#post-viewer');
      await expect(dialog).toBeVisible();
      if(!illustratedPairs.has(entry.id)){
        await expect(dialog.locator('[data-cutaway-range], [data-cutaway-toggle], .cutaway-divider')).toHaveCount(0);
        await expect(dialog.locator('.cutaway')).toHaveCount(0);
        const ingredients=dialog.locator('.static-ingredients');
        await expect(ingredients).toBeVisible();
        await expect(ingredients.locator('li')).toHaveText(revealFor(entry,2).parts);
        await expect(dialog.locator('.viewer-photo > img')).toHaveCount(1);
        await expect(dialog.locator('.post-social-rail')).toBeVisible();
        expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(392);
        return;
      }
      const photo = dialog.locator('.cutaway');
      const preview = photo.locator('[data-qa="inside-overlay"]');
      const tags = photo.locator('[data-qa="photo-ingredient-tags"]');
      await expect(preview).toBeVisible();
      await expect(preview).toContainText('Внутри');
      await expect(preview).toContainText(revealFor(items.get(entry.id), 2).parts[0]);
      await expect(tags.locator('span')).toHaveText(revealFor(items.get(entry.id), 2).parts);
      await expect(tags).toHaveAttribute('aria-hidden', 'true');
      const images = photo.locator('img');
      await expect.poll(() => images.evaluateAll(nodes => nodes.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
      const sources = await images.evaluateAll(nodes => nodes.map(img => img.getAttribute('src')));
      expect(sources[0] !== sources[1], 'Real image pair when one was prepared').toBe(illustratedPairs.has(entry.id));
      if (illustratedPairs.has(entry.id)) await expect(photo.locator('.cutaway-art-label')).toBeVisible();
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
      for (const value of ['0', '25', '50', '75', '100']) {
        await slider.evaluate((element, next) => {
          element.value = next;
          element.dispatchEvent(new Event('input', { bubbles: true }));
        }, value);
        await expect(preview).toBeVisible();
        await expect(slider).toHaveAttribute('aria-valuetext', /%/);
        const opacity = Number(await tags.evaluate(el => getComputedStyle(el).opacity));
        if (value === '100') expect(opacity).toBe(0);
        else expect(opacity).toBeGreaterThan(0);
        if (opacity > 0) {
          const tagBoxes = await tags.locator('span').all();
          const [railBox, handleBox, captionBox] = await Promise.all([rail.boundingBox(), handle.boundingBox(), preview.boundingBox()]);
          for (const tag of tagBoxes) {
            const box = await tag.boundingBox();
            expect(intersection(box, railBox), 'Ingredient must not cover social actions').toBe(0);
            expect(intersection(box, captionBox), 'Ingredient must not cover summary').toBe(0);
            expect(intersection(box, handleBox), 'Ingredient must not be hidden by the slider handle').toBe(0);
          }
        }
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
