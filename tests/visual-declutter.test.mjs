import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { categories } from '../dist/menu.js';
import { items, feedOrder, takeawayItems } from '../dist/catalog.js';
import { revealFor } from '../dist/ingredient-reveal.js';

const app = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/style.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');

test('detail view removes repeated combo caption, retains in-photo ingredient preview', () => {
  const cut = app.slice(app.indexOf('function cutawayMarkup('), app.indexOf('function renderViewer('));
  assert.ok(cut.includes("cutawayOverlayMarkup(reveal"));
  assert.doesNotMatch(cut, /\$\{caption\}|const caption =/);
  assert.match(cut, /class="cutaway-guide" id="cutaway-help"[^>]*>\$\{t\('cutawayHelpShort'\)\}/);
  assert.match(cut, /class="cutaway-ingredients" data-qa="ingredient-disclosure"/);
  assert.match(cut, /class="cutaway-legend"/);
  assert.ok(cut.includes('data-cutaway-range') && cut.includes('data-cutaway-toggle'));
});

test('translations have concise text for short hints, full ingredients and slider', () => {
  assert.ok(app.includes("cutawayHelpShort: ['Kaydır, içini gör', 'Swipe to reveal', 'Проведи, чтобы раскрыть']"));
  assert.ok(app.includes("cutawayAllIngredients: ['Tüm malzemeler', 'All ingredients', 'Весь состав']"));
  assert.ok(app.includes("cutawayShow: ['Tam aç', 'Reveal fully', 'Раскрыть целиком']"));
  assert.ok(app.includes("cutawayHide: ['Fotoğrafı göster', 'Show photo', 'Вернуть фото']"));
  assert.ok(html.includes('app.js?v=20261112-combo-journey'));
  assert.ok(html.includes('style.css?v=20261112-combo-journey'));
});

test('all menu-derived ingredients remain available in the collapsed disclosure', () => {
  const entries = [...feedOrder, ...takeawayItems].filter(entry => revealFor(entry, 2));
  assert.equal(entries.length, 24);
  for (const entry of entries) for (const lang of [0, 1, 2]) {
    assert.ok(revealFor(entry, lang).parts.every(Boolean), `${entry.id} language ${lang}`);
  }
  assert.match(app, /\$\{reveal\.parts\.map\(part => `<span>\$\{part\}<\/span>`\)\.join\(''\)\}/);
  assert.ok(categories.length >= 8 && items.size === 55);
});

test('visual declutter preserves add, save, like, views, share and nutrition logic', () => {
  const viewer = app.slice(app.indexOf('function renderViewer('), app.indexOf('function openPost('));
  assert.match(viewer, /\$\{postActions\(entry\)\}/);
  assert.match(viewer, /fillNutrition\(\$\('#viewer-nutrition'\)/);
  assert.match(viewer, /cutawayMarkup\(entry, postSocialRail\(entry\)\)/);
  assert.match(app, /data-like="\$\{entry\.id\}"/);
  assert.match(app, /data-share="\$\{entry\.id\}"/);
  assert.match(app, /data-view-count="\$\{entry\.id\}"/);
  assert.match(app, /data-save="\$\{entry\.id\}"/);
  assert.match(app, /\$\{addButton\(entry\)\}/);
});

test('UI uses slim header, transparent social rail, subtle bookmark and nutrition disclosure', () => {
  assert.match(css, /#post-viewer \.viewer-header\s*\{[\s\S]*?min-height: 52px;/);
  assert.match(css, /#post-viewer \.viewer-header #close-post\s*\{[\s\S]*?min-width: 44px;/);
  assert.match(css, /\.post-social-rail \.social-rail-item\s*\{[\s\S]*?background: rgba\(17, 25, 23, \.24\);/);
  assert.match(css, /#post-viewer \.viewer-body > \.post-actions \.save-post\s*\{[\s\S]*?background: transparent;/);
  assert.match(css, /#post-viewer #viewer-nutrition \.nutrition-panel\s*\{[\s\S]*?border-top: 1px solid var\(--line\);/);
  assert.match(css, /#post-viewer \.cutaway-ingredients > summary/);
});
