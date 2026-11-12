import { test, expect } from '@playwright/test';
import { items } from '../dist/catalog.js';
import { builtComboId, resolveOrderItem } from '../dist/order-options.js';

const base = process.env.POCITEL_TEST_BASE_URL ?? `http://127.0.0.1:${process.env.PORT ?? '8088'}`;

async function openBuilder(page, lang) {
  await page.addInitScript(() => sessionStorage.setItem('pocitel-focaccia-offer-v1', 'seen'));
  await page.goto(`${base}/?lang=${lang}`, {waitUntil:'domcontentloaded'});
  const teaser = page.locator('#focaccia-teaser');
  await expect(teaser).toBeVisible();
  await teaser.click();
  const dialog = page.locator('#focaccia-promo');
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe('Real pairing progress without invented streaks or extra steps', () => {
  for (const [lang, food, drink, last, ready] of [
    ['tr','Focaccia','İçecek','Siparişe ekle','Eşleşmen hazır'],
    ['en','Focaccia','Drink','Add to order','Your pairing is ready'],
    ['ru','Фокачча','Напиток','В заказ','Сочетание готово'],
  ]) for (const width of [320,390,768]) {
    test(`${lang} ${width}px: real preselected steps, edits, prices and scroll stability`, async ({page}) => {
      await page.setViewportSize({width,height:740});
      const dialog = await openBuilder(page,lang);
      const journey = dialog.locator('[data-qa="combo-journey"]');
      await expect(journey).toBeVisible();
      await expect(journey.locator('[data-qa="combo-journey-count"]')).toHaveText('2/3');
      await expect(journey.locator('progress')).toHaveAttribute('value','2');
      await expect(journey.locator('progress')).toHaveAttribute('max','3');
      await expect(journey.locator('[data-qa="combo-step-foodId"]')).toContainText(food);
      await expect(journey.locator('[data-qa="combo-step-drinkId"]')).toContainText(drink);
      await expect(journey.locator('[data-qa="combo-step-order"]')).toContainText(last);
      await expect(journey.locator('[data-qa="combo-step-foodId"]')).toHaveClass(/is-complete/);
      await expect(journey.locator('[data-qa="combo-step-drinkId"]')).toHaveClass(/is-complete/);
      await expect(journey.locator('[data-qa="combo-step-order"]')).toHaveClass(/is-next/);
      await expect(journey.locator('.combo-journey-meta')).toContainText(ready);
      const bbox = await journey.boundingBox();
      const dialogBox = await dialog.boundingBox();
      expect(bbox.x).toBeGreaterThanOrEqual(dialogBox.x-1);
      expect(bbox.x+bbox.width).toBeLessThanOrEqual(dialogBox.x+dialogBox.width+1);
      const scrollPane = dialog.locator('#focaccia-content');
      const foodChoice=dialog.locator('#combo-foodId');
      await foodChoice.scrollIntoViewIfNeeded();
      const before=await scrollPane.evaluate(el=>el.scrollTop);
      await foodChoice.selectOption('zucchini');
      await expect(dialog.locator('[data-qa="combo-step-foodId"]')).toHaveClass(/is-just-chosen/);
      expect(Math.abs(await scrollPane.evaluate(el=>el.scrollTop)-before)).toBeLessThanOrEqual(2);
      const drinkChoice=dialog.locator('#combo-drinkId');
      await drinkChoice.selectOption('latte');
      await expect(dialog.locator('[data-qa="combo-step-drinkId"]')).toHaveClass(/is-just-chosen/);
      await expect(dialog.locator('[data-qa="combo-journey-count"]')).toHaveText('2/3');
      await expect(drinkChoice).toHaveValue('latte');
      const chosen={foodId:'zucchini',drinkId:'latte',milk:'standard',syrup:'none',serving:'takeaway'};
      const exactPrice=resolveOrderItem(builtComboId(chosen),items).price;
      await expect(dialog.locator('.focaccia-price strong').first()).toContainText(String(exactPrice));
      await expect(dialog.locator('#accept-focaccia')).toBeEnabled();
    });
  }

  test('3/3 is shown only AFTER actual order, removed on undo', async ({page}) => {
    await page.setViewportSize({width:390,height:760});
    const dialog=await openBuilder(page,'ru');
    await expect(dialog.locator('[data-qa="combo-journey-count"]')).toHaveText('2/3');
    await dialog.locator('#combo-foodId').selectOption('zucchini');
    await dialog.locator('#combo-drinkId').selectOption('latte');
    await dialog.locator('#accept-focaccia').click();
    await expect(dialog).not.toBeVisible();
    const cart=page.locator('#cart');
    await expect(cart).toBeVisible();
    const completed=cart.locator('#focaccia-undo');
    await expect(completed).toBeVisible();
    await expect(completed.locator('.combo-done-check')).toHaveText('3/3');
    await expect(page.locator('#selection-bar [data-count]')).toHaveText('1');
    await cart.locator('#undo-focaccia').click();
    await expect(completed).toBeHidden();
    await expect(page.locator('#selection-bar [data-count]')).toHaveText('0');
  });

  test('reduced motion disables step pulse without losing selection state', async ({page}) => {
    await page.setViewportSize({width:320,height:740});
    await page.emulateMedia({reducedMotion:'reduce'});
    const dialog=await openBuilder(page,'ru');
    await dialog.locator('#combo-foodId').selectOption('zucchini');
    const step=dialog.locator('[data-qa="combo-step-foodId"] .combo-journey-symbol');
    await expect(step).toBeVisible();
    const animation=await step.evaluate(el=>getComputedStyle(el).animationName);
    expect(animation).toBe('none');
    await expect(dialog.locator('[data-qa="combo-journey-count"]')).toHaveText('2/3');
  });
});
