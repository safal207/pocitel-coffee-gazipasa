import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/style.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');

test('warm mirror card glow is subtle and respects reduced motion', () => {
  assert.match(css, /\.feed-post\s*\{[\s\S]*?box-shadow:/);
  assert.match(css, /\.feed-post::after\s*\{[\s\S]*?pointer-events: none;/);
  assert.match(css, /\.feed-post:hover,\s*\.feed-post:focus-within,\s*\.feed-post\.is-joy-tapped/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.micro-feedback\.is-visible\s*\{ animation: none !important; \}/);
  assert.doesNotMatch(css, /filter:\s*brightness\([2-9]/);
});

test('feedback for likes and saved items is real state dependent in all 3 languages', () => {
  for (const key of ['likedFeedback','unlikedFeedback','savedFeedback','unsavedFeedback']) {
    const match = app.match(new RegExp(`\\b${key}: \\[([^\\]]+)\\]`));
    assert.ok(match, key);
    assert.equal((match[1].match(/'/g) || []).length, 6, key + ' must have TR/EN/RU');
  }
  assert.match(app, /showMicroFeedback\(t\(engagement\.likes\.has\(id\) \? 'likedFeedback' : 'unlikedFeedback'\)\)/);
  assert.match(app, /showMicroFeedback\(t\(saved\.has\(id\) \? 'savedFeedback' : 'unsavedFeedback'\)\)/);
  assert.match(html, /role="status" aria-live="polite"/);
});

test('toasts enter dialog top layer and never block taps', () => {
  assert.match(app, /const host = viewer\.open \? viewer : document\.body;/);
  assert.match(app, /if \(toast\.parentElement !== host\) host\.appendChild\(toast\);/);
  assert.match(css, /\.micro-feedback\s*\{[\s\S]*?pointer-events: none;/);
  assert.match(html, /id="micro-feedback"[^>]*role="status"/);
  assert.match(css, /\.micro-feedback\.is-visible\s*\{ animation:/);
});

test('order success reuses existing editable notice and real selection bar', () => {
  assert.match(app, /pulseTap\(addedNotice\);\s*pulseTap\(\$\('#selection-bar'\)\);/);
  assert.match(app, /\$\('#added-message'\)\.textContent =/);
  assert.match(html, /id="added-notice"/);
  assert.match(css, /\.added-notice::before\s*\{/);
  assert.doesNotMatch(app, /Math\.random\(\)/);
});

test('new versions do not replace existing photographs or sharing flow', () => {
  assert.match(html, /style\.css\?v=20261113-miora/);
  assert.match(html, /app\.js\?v=20261113-miora/);
  assert.match(app, /navigator\.share\(payload\)/);
  assert.match(app, /function itemImage\(entry/);
  assert.match(app, /function postSocialRail\(entry\)/);
});
