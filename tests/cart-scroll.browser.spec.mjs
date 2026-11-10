import { test, expect } from '@playwright/test';

const base = process.env.POCITEL_TEST_BASE_URL ?? `http://127.0.0.1:${process.env.PORT ?? '8088'}`;

// Several real catalog entries make the cart taller than a phone viewport.
const coffeeOrder = [
  ['espresso', 1], ['americano', 1], ['flat-white', 1],
  ['cappuccino', 1], ['latte', 1], ['cortado', 1], ['mocha', 1],
  ['turkish-coffee', 1],
];

async function openLongCart(page, lang) {
  await page.addInitScript(order => {
    localStorage.setItem('pocitel-selection-v1', JSON.stringify(order));
  }, coffeeOrder);
  await page.goto(`${base}/?lang=${lang}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#selection-bar [data-count]')).toHaveText('8');
  await page.locator('#selection-bar').click();
  await expect(page.locator('#cart')).toBeVisible();
  const pane = page.locator('#cart .cart-scroll');
  await expect(pane).toBeVisible();
  expect(await pane.evaluate(el => el.scrollHeight - el.clientHeight), 'cart must actually scroll').toBeGreaterThan(120);
  return pane;
}

test.describe('Cart quantity: no scroll jump when ordering a second coffee', () => {
  for (const [lang, width] of [['tr', 320], ['ru', 390], ['en', 768]]) {
    test(`${lang} ${width}px: repeated + stays in place and prices/counts update`, async ({ page }) => {
      await page.setViewportSize({ width, height: 690 });
      const pane = await openLongCart(page, lang);
      const plus = page.locator('#cart-items [data-item="cappuccino"][data-quantity="1"]');
      await plus.scrollIntoViewIfNeeded();
      const before = await page.evaluate(() => ({
        pageY: window.scrollY,
        cartY: document.querySelector('#cart .cart-scroll').scrollTop,
      }));
      const initialTotal = await page.locator('#total-price').textContent();
      await plus.click();
      await expect(page.locator('#selection-bar [data-count]')).toHaveText('9');
      await expect(page.locator('#cart-items [data-item="cappuccino"][data-quantity="1"]').locator('xpath=..').locator('span')).toHaveText('2');
      await expect(page.locator('#cart-items [data-item="cappuccino"][data-quantity="1"]')).toBeFocused();
      const after = await page.evaluate(() => ({
        pageY: window.scrollY,
        cartY: document.querySelector('#cart .cart-scroll').scrollTop,
      }));
      expect(Math.abs(after.cartY - before.cartY), 'cart should not jump after +').toBeLessThanOrEqual(2);
      expect(Math.abs(after.pageY - before.pageY), 'background page should not jump').toBeLessThanOrEqual(2);
      expect(await page.locator('#total-price').textContent()).not.toBe(initialTotal);
      await page.locator('#cart-items [data-item="cappuccino"][data-quantity="1"]').click();
      await expect(page.locator('#selection-bar [data-count]')).toHaveText('10');
      const again = await pane.evaluate(el => el.scrollTop);
      expect(Math.abs(again - before.cartY)).toBeLessThanOrEqual(2);
      await page.locator('#cart-items [data-item="cappuccino"][data-quantity="-1"]').click();
      await expect(page.locator('#selection-bar [data-count]')).toHaveText('9');
      expect(Math.abs((await pane.evaluate(el => el.scrollTop)) - before.cartY)).toBeLessThanOrEqual(2);
    });
  }

  test('scroll position is preserved from deeper in a long cart', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 640 });
    const pane = await openLongCart(page, 'ru');
    const plus = page.locator('#cart-items [data-item="mocha"][data-quantity="1"]');
    await plus.scrollIntoViewIfNeeded();
    const before = await pane.evaluate(el => el.scrollTop);
    await plus.click();
    await expect(page.locator('#cart-items [data-item="mocha"][data-quantity="1"]').locator('xpath=..').locator('span')).toHaveText('2');
    const after = await pane.evaluate(el => el.scrollTop);
    expect(Math.abs(after - before), 'deeper cart item must remain in same position').toBeLessThanOrEqual(2);
  });

  test('second coffee from menu does not jump page position or open an extra dialog', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 760 });
    await page.goto(`${base}/?lang=ru`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-category="coffee"]').click();
    const card = page.locator('#post-cappuccino');
    const add = card.locator('[data-add="cappuccino"]');
    await expect(add).toBeVisible();
    await add.click();
    await expect(page.locator('#selection-bar [data-count]')).toHaveText('1');
    await add.scrollIntoViewIfNeeded();
    const previousY = await page.evaluate(() => window.scrollY);
    await add.click();
    await expect(page.locator('#selection-bar [data-count]')).toHaveText('2');
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - previousY)).toBeLessThanOrEqual(2);
    await expect(page.locator('#cart')).not.toBeVisible();
  });
});
