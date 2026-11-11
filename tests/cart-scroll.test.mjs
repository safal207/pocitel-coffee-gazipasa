import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/style.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');

test('cart captures scroll position before replacing rows and restores it afterwards', () => {
  const render = app.slice(app.indexOf('function renderCart()'), app.indexOf('function renderWaiter()'));
  assert.match(render, /const scrollPane = cart\.querySelector\('\.cart-scroll'\)/);
  assert.match(render, /const previousScrollTop = cart\.open \? scrollPane\?\.scrollTop : null/);
  assert.match(render, /cartItems\.innerHTML = rows/);
  assert.match(render, /if \(previousScrollTop != null && scrollPane\) scrollPane\.scrollTop = previousScrollTop/);
  assert.ok(render.indexOf('cartItems.innerHTML') < render.indexOf('scrollPane.scrollTop = previousScrollTop'));
});

test('quantity buttons restore focus without scrolling after replacing the clicked DOM element', () => {
  const handler = app.slice(app.indexOf("document.addEventListener('click'"), app.indexOf("settings.addEventListener('close'"));
  assert.match(handler, /else if \(quantity\) \{[\s\S]*?changeSelection\(item, Number\(quantity\)\)/);
  assert.match(handler, /\(replacement \?\? cartItems\.querySelector\('button'\) \?\? \$\('#close-cart'\)\)\.focus\(\{ preventScroll: true \}\)/);
  assert.doesNotMatch(handler, /else if \(quantity\) \{[\s\S]{0,270}\.focus\(\);/);
});

test('scroll anchoring is disabled only inside the cart, not for menu or viewer', () => {
  assert.match(css, /#cart \.cart-scroll \{ overflow-anchor: none; \}/);
  assert.ok(!css.includes('body { overflow-anchor: none; }'));
  assert.ok(!css.includes('html { overflow-anchor: none; }'));
});

test('current asset revisions keep cart behavior consistent with share previews', () => {
  assert.match(html, /style\.css\?v=20261111-inside-regression-v2/);
  assert.match(html, /app\.js\?v=20261111-inside-regression-v2/);
  assert.match(app, /function renderCartSuggestion\(/);
  assert.match(app, /function addToSelection\(/);
  assert.match(app, /function sharePost\(/);
});
