import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { socialShareTargets } from '../dist/social-share.js';
import { shareUrl } from '../dist/share-links.js';

const app = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');

test('native share is invoked on the first tap before fallback modal or image decoding', () => {
  const start = app.indexOf('function sharePost(button, id) {');
  const end = app.indexOf('function openQuickShareFallback(', start);
  const share = app.slice(start, end);
  assert.ok(start >= 0 && end > start);
  assert.match(share, /navigator\.share\(payload\)/);
  assert.ok(share.indexOf('navigator.share(payload)') < share.indexOf('openQuickShareFallback(button, id, payload)'));
  assert.doesNotMatch(share, /await|shareDialog\.showModal|prepareSharePhoto|import\(/);
  assert.match(share, /error\?\.name === 'AbortError'/);
});

test('fallback is compact and does not contain the original photo preview or second native share button', () => {
  assert.match(html, /class="share-quick-grid"/);
  for (const channel of ['whatsapp', 'telegram', 'facebook', 'x']) {
    assert.match(html, new RegExp(`id="share-${channel}" target="_blank" rel="noopener noreferrer"`));
  }
  assert.doesNotMatch(html, /class="share-preview"|id="share-link-button"/);
  assert.match(html, /id="copy-link"/);
  assert.match(html, /id="share-extras"/);
  assert.match(html, /id="share-photo-button"/);
  assert.match(html, /id="save-photo"/);
  assert.match(html, /20261113-miora/);
});

test('four direct channel URLs encode a public per-dish URL and localized invitation', () => {
  for (const [language, title, text] of [
    ['ru', 'Сладкое утро', 'Посмотри: Сладкое утро · 460 ₺ · Poçitel'],
    ['en', 'Sweet Morning', 'Check this out: Sweet Morning · 460 ₺ · Poçitel'],
    ['tr', 'Tatlı Sabah', 'Şuna bak: Tatlı Sabah · 460 ₺ · Poçitel'],
  ]) {
    const url = shareUrl('sweet-morning', language);
    const dest = socialShareTargets({ title, text, url });
    assert.equal(Object.keys(dest).length, 4);
    for (const target of Object.values(dest)) assert.equal(new URL(target).protocol, 'https:');
    assert.ok(new URL(dest.whatsapp).searchParams.get('text').includes(url));
    assert.equal(new URL(dest.telegram).searchParams.get('url'), url);
    assert.equal(new URL(dest.facebook).searchParams.get('u'), url);
    assert.equal(new URL(dest.x).searchParams.get('url'), url);
    assert.ok(new URL(dest.x).searchParams.get('text').includes(title));
  }
});
