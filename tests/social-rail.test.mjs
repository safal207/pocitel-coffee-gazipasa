import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/style.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');

test('social controls sit as siblings of the photo button, not nested in it', () => {
  assert.match(app, /<div class="post-media-wrap">[\s\S]*?<button type="button" class="post-media"[\s\S]*?<\/button>\s*\$\{postSocialRail\(entry\)\}/);
  assert.match(app, /function postSocialRail\(entry\)/);
  assert.doesNotMatch(app, /class="engagement-bar"/);
});

test('all dish image viewers expose the same vertical social rail', () => {
  assert.match(app, /cutawayMarkup\(entry, postSocialRail\(entry\)\)/);
  assert.match(app, /illustrationLabel\(entry\)\}\$\{postSocialRail\(entry\)/);
  assert.match(app, /\$\{socialRail\}/);
});

test('actions use the pre-existing like and share handlers', () => {
  assert.match(app, /data-like="\$\{entry\.id\}"/);
  assert.match(app, /data-share="\$\{entry\.id\}"/);
  assert.match(app, /handleLike\(like, button\)/);
  assert.match(app, /sharePost\(button, share\)/);
  const segment = app.slice(app.indexOf('function postSocialRail'), app.indexOf('function postActions'));
  assert.ok(segment.indexOf('social-rail-views') < segment.indexOf('social-rail-like'));
  assert.ok(segment.indexOf('social-rail-like') < segment.indexOf('social-rail-share'));
});

test('right-aligned, accessible controls ship with cache-busted assets', () => {
  assert.match(css, /\.post-social-rail\s*\{[\s\S]*?position: absolute;[\s\S]*?right: 8px/);
  assert.match(css, /social-rail-item:focus-visible/);
  assert.match(html, /app\.js\?v=20261112-photo-reveal-v2/);
  assert.match(html, /style\.css\?v=20261112-photo-reveal-v2/);
});
test('compact cutaway controls show all ingredients under image and an overlay on the photo', () => {
  assert.match(app, /<div class="cutaway-details">/);
  assert.doesNotMatch(app, /cutaway-label-stack/);
  assert.doesNotMatch(app, /shareShort/);
  assert.match(css, /\.cutaway-details\s*\{/);
  assert.match(css, /\.social-rail-share\s*\{/);
});

test('share button is icon-only visually while keeping localized accessible name', () => {
  assert.match(app, /class="social-rail-item social-rail-share"[^>]*aria-label="/);
  assert.match(css, /\.social-rail-share span\s*\{[^}]*white-space: nowrap/);
  assert.match(css, /\.post-social-rail\s*\{[^}]*env\(safe-area-inset-right\)/);
  assert.match(html, /style\.css\?v=20261112-photo-reveal-v2/);
});

test('on-photo caption stays visible and away from the Shorts controls at all slider positions', () => {
  assert.match(app, /cutawayOverlayMarkup\(reveal, t\('insideLabel'\), t\('moreIngredients'\), t\('cutawayAllIngredients'\)\)/);
  assert.match(app, /insideLabel: \['İçinde', 'Inside', 'Внутри'\]/);
  assert.doesNotMatch(app, /dataset\.insideVisible/);
  assert.match(css, /\.cutaway-ingredient-card\s*\{[\s\S]*?top: 9px;[\s\S]*?left: 9px;/);
  assert.match(css, /\.cutaway-ingredient-card\s*\{[\s\S]*?pointer-events: auto/);
  assert.doesNotMatch(css, /cutaway\[data-inside-visible="false"\]/);
  assert.match(html, /cutaway-overlay\.js\?v=20261112-photo-reveal-v2|app\.js\?v=20261112-photo-reveal-v2/);
});
