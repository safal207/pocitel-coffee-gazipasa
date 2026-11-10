import { test, expect } from '@playwright/test';

const base = process.env.POCITEL_TEST_BASE_URL ?? `http://127.0.0.1:${process.env.PORT ?? '8088'}`;

test.describe('One-tap native share first, compact social fallback second', () => {
  for (const [lang, invitation] of [['ru', 'Посмотри:'], ['en', 'Check this out:'], ['tr', 'Şuna bak:']]) {
    test(`native share on first click, ${lang}, without photo modal`, async ({ page }) => {
      await page.addInitScript(() => {
        window.__shareCalls = [];
        Object.defineProperty(navigator, 'share', {
          configurable: true,
          value: payload => {
            window.__shareCalls.push({ ...payload, activated: navigator.userActivation?.isActive ?? null });
            return Promise.resolve();
          },
        });
      });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${base}/?lang=${lang}&item=sweet-morning`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#post-viewer')).toBeVisible();
      await page.locator('#post-viewer .social-rail-share').click();
      await expect.poll(() => page.evaluate(() => window.__shareCalls.length)).toBe(1);
      const data = await page.evaluate(() => window.__shareCalls[0]);
      expect(data.url).toContain(`share-${lang}-sweet-morning.html`);
      expect(data.text).toContain(invitation);
      expect(data.activated, 'navigator.share must run in live click activation').toBe(true);
      await expect(page.locator('#share-dialog')).not.toBeVisible();
    });
  }

  test('unsupported browser gets a small direct channel picker with valid per-dish URLs', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    });
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(`${base}/?lang=ru&item=sweet-morning`, { waitUntil: 'domcontentloaded' });
    await page.locator('#post-viewer .social-rail-share').click();
    const dialog = page.locator('#share-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.share-preview')).toHaveCount(0);
    await expect(dialog.locator('#share-caption')).toContainText('460');
    const picker = dialog.locator('.share-quick-grid');
    for (const channel of ['whatsapp','telegram','facebook','x']) {
      const link = picker.locator(`#share-${channel}`);
      await expect(link).toBeVisible();
      const href = new URL(await link.getAttribute('href'));
      const q = href.searchParams;
      const shared = q.get('url') || q.get('u') || q.get('text') || '';
      expect(shared).toContain('share-ru-sweet-morning.html');
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    await expect(dialog.locator('#copy-link')).toBeVisible();
    await expect(dialog.locator('#share-extras')).not.toHaveAttribute('open', '');
    await expect(dialog.locator('#save-photo')).toBeHidden();
  });

  test('cancel native sharing does not open a second dialog', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', {
        configurable: true, value: () => Promise.reject(new DOMException('User cancelled', 'AbortError')),
      });
    });
    await page.goto(`${base}/?lang=ru&item=sweet-morning`, { waitUntil: 'domcontentloaded' });
    await page.locator('#post-viewer .social-rail-share').click();
    await expect(page.locator('#share-dialog')).not.toBeVisible();
  });

  test('native share failure degrades into compact social choices', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', {
        configurable: true, value: () => Promise.reject(new DOMException('Blocked', 'NotAllowedError')),
      });
    });
    await page.goto(`${base}/?lang=ru&item=sweet-morning`, { waitUntil: 'domcontentloaded' });
    await page.locator('#post-viewer .social-rail-share').click();
    await expect(page.locator('#share-dialog')).toBeVisible();
    await expect(page.locator('#share-whatsapp')).toBeVisible();
  });
});
