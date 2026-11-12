import { test, expect } from '@playwright/test';
import { parseOrderSlip } from '../dist/revenue-core.js';
import { items } from '../dist/catalog.js';
import { resolveOrderItem } from '../dist/order-options.js';

const base=process.env.POCITEL_TEST_BASE_URL ?? 'http://127.0.0.1:8088';
const resolve=id=>resolveOrderItem(id,items);
async function ready(page,lang='ru'){
  await page.goto(base+'/?lang='+lang+'&utm_source=instagram&utm_medium=social&qr=table_4',{waitUntil:'domcontentloaded'});
  await page.locator('[data-category="coffee"]').click();
  await expect(page.locator('#post-cappuccino [data-add="cappuccino"]')).toBeVisible();
}
test.describe('Revenue Intelligence: no fictitious sales and local-only ordering',()=>{
  for(const [lang,width] of [['tr',320],['en',390],['ru',768]]){
    test(lang+' '+width+'px: menu -> waiter PCT1 draft, without a paid event',async({page})=>{
      await page.setViewportSize({width,height:780});
      await ready(page,lang);
      await page.locator('#post-cappuccino [data-add="cappuccino"]').click();
      await expect(page.locator('#selection-bar [data-count]')).toHaveText('1');
      await page.locator('#selection-bar').click();
      await page.locator('#show-waiter').click();
      await expect(page.locator('#waiter')).toBeVisible();
      const code=await page.locator('#order-slip-value').inputValue();
      const decoded=parseOrderSlip(code,resolve);
      expect(decoded.lines).toHaveLength(1);
      expect(decoded.lines[0].itemId).toBe('cappuccino');
      expect(decoded.lines[0].quantity).toBe(1);
      expect(decoded.quoteTotal).toBe(185);
      expect(decoded.attribution.utm_source).toBe('instagram');
      expect(decoded.attribution.qr).toBe('table_4');
      await page.goto(base+'/admin.html');
      await expect(page.locator('#kpi-orders')).toHaveText('0');
      await expect(page.locator('#kpi-gross')).toHaveText('—');
      await expect(page.locator('#kpi-contribution')).toHaveText('—');
      await expect(page.locator('#data-quality')).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
    });
  }
  test('staff must explicitly confirm real payment; unknown VAT or cost never fakes margin',async({page})=>{
    await page.setViewportSize({width:390,height:820});
    await ready(page,'ru');
    await page.locator('#post-cappuccino [data-add="cappuccino"]').click();
    await page.locator('#selection-bar').click();
    await page.locator('#show-waiter').click();
    const code=await page.locator('#order-slip-value').inputValue();
    await page.goto(base+'/admin.html');
    await page.locator('#admin-lang').selectOption('ru');
    await page.locator('#slip-value').fill(code);
    await page.locator('#decode-slip').click();
    await expect(page.locator('#slip-preview')).toBeVisible();
    await expect(page.locator('#slip-items')).toContainText('185');
    await page.locator('#confirm-paid').click();
    await expect(page.locator('#kpi-orders')).toHaveText('0');
    await expect(page.locator('#manual-status')).toContainText('подтвердить');
    await page.locator('#staff-paid').check();
    await page.locator('#confirm-paid').click();
    await expect(page.locator('#kpi-orders')).toHaveText('1');
    await expect(page.locator('#kpi-gross')).toContainText('185');
    await expect(page.locator('#kpi-contribution')).toHaveText('—');
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('pocitel-admin-paid-orders-v1')));
    expect(saved).toHaveLength(1);
    expect(saved[0].source).toBe('staff_manual');
    await page.locator('#cost-item').selectOption('cappuccino');
    await page.locator('#cost-ingredients').fill('40');
    await page.locator('#cost-packaging').fill('8');
    await page.locator('#cost-form button[type=submit]').click();
    await expect(page.locator('#kpi-contribution')).toHaveText('—');
    // An explicit tax rate is needed; a later POS receipt can have its own rate.
    expect(saved[0].lines[0].vatPercent).toBeNull();
  });
  test('POS import is idempotent, supports nonzero contribution with complete VAT and cost',async({page})=>{
    await page.goto(base+'/admin.html');
    await page.locator('#admin-lang').selectOption('en');
    const recipe={name:'costs.csv',mimeType:'text/csv',buffer:Buffer.from(
      'item_id,ingredients,packaging,variableLabor,paymentFee,waste\n'+
      'cappuccino,40,8,10,4,1\n')};
    await page.locator('#cost-file').setInputFiles(recipe);
    await page.locator('#import-costs').click();
    await expect(page.locator('#cost-status')).toContainText('Imported: 1');
    const importedCost=await page.evaluate(()=>JSON.parse(localStorage.getItem('pocitel-admin-costs-v1')).cappuccino);
    expect(importedCost.variableLabor).toBe(10);
    expect(importedCost.paymentFee).toBe(4);
    expect(importedCost.waste).toBe(1);
    const file={name:'pos.csv',mimeType:'text/csv',buffer:Buffer.from(
      'order_id,paid_at,item_id,quantity,unit_gross_try,vat_percent,discount_gross_try,utm_source\n'+
      'pos_receipt_001,2026-11-01T12:00:00Z,cappuccino,2,185,10,0,instagram\n')};
    await page.locator('#pos-file').setInputFiles(file);
    await page.locator('#import-pos').click();
    await expect(page.locator('#kpi-orders')).toHaveText('1');
    await expect(page.locator('#kpi-source')).toHaveText('1 / 0');
    await expect(page.locator('#kpi-coverage')).toHaveText('1 / 1');
    await expect(page.locator('#kpi-contribution')).not.toHaveText('—');
    await expect(page.locator('#sku-table tr')).toHaveCount(1);
    await expect(page.locator('#sku-table')).toContainText('Cappuccino');
    await expect(page.locator('#source-table tr')).toHaveCount(1);
    await expect(page.locator('#source-table')).toContainText('instagram');
    await page.locator('#import-pos').click();
    await expect(page.locator('#kpi-orders')).toHaveText('1');
    await expect(page.locator('#pos-status')).toContainText('Skipped: 1');
  });
  test('local analytics is opt-in, UTM sanitized and never produces a paid record',async({page})=>{
    await page.goto(base+'/?lang=ru&utm_source=instagram&utm_campaign=test-2026',{waitUntil:'domcontentloaded'});
    await expect(page.locator('#telemetry-optin')).not.toBeChecked();
    const initial=await page.evaluate(()=>localStorage.getItem('pocitel-local-events-v1'));
    expect(initial).toBeNull();
    await page.locator('#open-settings').click();
    await page.locator('#telemetry-optin').check();
    await page.locator('#done-settings').click();
    await page.locator('[data-category="coffee"]').click();
    await page.locator('#post-cappuccino .post-media').click();
    await expect(page.locator('#post-viewer')).toBeVisible();
    const events=await page.evaluate(()=>JSON.parse(localStorage.getItem('pocitel-local-events-v1')));
    expect(events.some(e=>e.event==='menu_view')).toBe(true);
    expect(events.some(e=>e.event==='dish_view'&&e.itemId==='cappuccino')).toBe(true);
    expect(events.every(e=>e.attribution.utm_source==='instagram')).toBe(true);
    expect(events.some(e=>e.event==='order_paid')).toBe(false);
    await page.locator('#close-post').click();
    await page.locator('#open-settings').click();
    await page.locator('#telemetry-optin').uncheck();
    expect(await page.evaluate(()=>localStorage.getItem('pocitel-local-events-v1'))).toBeNull();
  });
  test('takeaway and scrolling cannot trigger unsolicited 8-second promo',async({page})=>{
    await page.goto(base+'/?lang=ru',{waitUntil:'domcontentloaded'});
    await page.locator('[data-mode="takeaway"]').click();
    await expect(page.locator('#focaccia-promo')).not.toBeVisible();
    await page.locator('#result-meta').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await expect(page.locator('#focaccia-promo')).not.toBeVisible();
    await page.locator('#focaccia-teaser').click();
    await expect(page.locator('#focaccia-promo')).toBeVisible();
  });
});
