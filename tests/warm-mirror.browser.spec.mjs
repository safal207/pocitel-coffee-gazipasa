import { test, expect } from '@playwright/test';

const base = process.env.POCITEL_TEST_BASE_URL ?? `http://127.0.0.1:${process.env.PORT ?? '8088'}`;

test.describe('Warm mirror and gentle tap rewards, mobile TR/EN/RU', () => {
  for (const [lang, liked, unliked, saved, unsaved] of [
    ['tr', 'Beğendin', 'Beğeni kaldırıldı', 'Kaydedildi', 'Kaydedilenlerden kaldırıldı'],
    ['en', 'Liked', 'Like removed', 'Saved', 'Removed from saved'],
    ['ru', 'Понравилось', 'Лайк убран', 'Сохранено', 'Убрано из сохранённого'],
  ]) {
    for (const width of [320, 390, 768]) {
      test(`${lang} ${width}px: like/unlike, save/unsave and visible modal toast`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`${base}/?lang=${lang}&item=sweet-morning`, { waitUntil: 'domcontentloaded' });
        const dialog = page.locator('#post-viewer');
        await expect(dialog).toBeVisible();
        const feedback = dialog.locator('#micro-feedback');
        const like = dialog.locator('.post-social-rail [data-like="sweet-morning"]');
        const savedButton = dialog.locator('.post-actions [data-save="sweet-morning"]');
        await like.click();
        await expect(like).toHaveAttribute('aria-pressed','true');
        await expect(feedback).toHaveText(liked);
        await expect(feedback).toBeVisible();
        await expect(feedback).toHaveAttribute('role', 'status');
        await like.click();
        await expect(feedback).toHaveText(unliked);
        await expect(like).toHaveAttribute('aria-pressed','false');
        await savedButton.click();
        await expect(savedButton).toHaveAttribute('aria-pressed','true');
        await expect(feedback).toHaveText(saved);
        await savedButton.click();
        await expect(savedButton).toHaveAttribute('aria-pressed','false');
        await expect(feedback).toHaveText(unsaved);
        const photo = await dialog.locator('.viewer-photo').boundingBox();
        expect(photo?.width).toBeGreaterThan(200);
        const likeBox = await like.boundingBox();
        expect(likeBox.x).toBeGreaterThanOrEqual(photo.x);
        expect(likeBox.x+likeBox.width).toBeLessThanOrEqual(photo.x+photo.width+1);
      });
    }
  }

  test('card ambient glow and success notice reuse existing order UI', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/?lang=ru`, { waitUntil: 'domcontentloaded' });
    const card = page.locator('.feed-post').first();
    await expect(card).toBeVisible();
    const glow = await card.evaluate(el => getComputedStyle(el).boxShadow);
    expect(glow).not.toBe('none');
    expect(glow).toContain('rgba');
    await card.locator('[data-add]').click();
    const notice = page.locator('#added-notice');
    await expect(notice).toBeVisible();
    await expect(notice).toContainText('Добавлено');
    await expect(page.locator('#selection-bar [data-count]')).toHaveText('1');
    await expect(notice.locator('#edit-added')).toBeVisible();
  });

  test('reduced motion keeps action result without running animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${base}/?lang=ru&item=sweet-morning`, { waitUntil: 'domcontentloaded' });
    const like = page.locator('#post-viewer .social-rail-like');
    await like.click();
    await expect(page.locator('#micro-feedback')).toHaveText('Понравилось');
    const animation = await like.locator('.icon').evaluate(el => getComputedStyle(el).animationName);
    expect(animation).toBe('none');
  });
});
