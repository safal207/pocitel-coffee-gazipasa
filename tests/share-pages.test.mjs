import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { items, takeawayItems } from '../dist/catalog.js';
import { publicSiteUrl, shareLanguages, shareUrl } from '../dist/share-links.js';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const manifest = JSON.parse(await readFile(resolve(dist, 'share-manifest.json'), 'utf8'));
const decode = s => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const metadata = html => new Map([...html.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)">/g)].map(match => [match[1], decode(match[2])]));

test('every menu and takeaway item has a unique static page in all three languages', async () => {
  const appShell = (await readFile(resolve(dist, 'index.html'), 'utf8')).split('<body>')[1];
  assert.equal(manifest.pages.length, items.size * shareLanguages.length);
  assert.equal(new Set(manifest.pages.map(page => page.url)).size, manifest.pages.length);
  for (const entry of items.values()) for (const language of shareLanguages) {
    const page = manifest.pages.find(page => page.id === entry.id && page.language === language);
    assert.ok(page, `${entry.id}/${language}`);
    const html = await readFile(resolve(dist, page.path), 'utf8');
    const head = html.split('</head>')[0];
    assert.equal(html.split('<body>')[1], appShell, `Stale application shell: ${page.path}`);
    const tags = metadata(head);
    assert.equal(tags.get('og:url'), shareUrl(entry.id, language));
    assert.equal(tags.get('og:title'), page.title);
    assert.equal(tags.get('og:description'), page.description);
    assert.ok(tags.get('og:title').includes(String(entry.price)));
    assert.equal(tags.get('og:image'), new URL(page.image, publicSiteUrl).href);
    assert.equal(tags.get('og:image:type'), 'image/jpeg');
    assert.equal(tags.get('twitter:card'), 'summary_large_image');
    assert.equal(tags.get('twitter:image'), tags.get('og:image'));
    assert.match(html, new RegExp(`data-share-item="${entry.id}" data-share-lang="${language}"`));
    assert.equal((head.match(/property="og:image"/g) || []).length, 1);
    assert.equal((head.match(/<title>/g) || []).length, 1);
    assert.ok(!head.includes('http-equiv="refresh"'));
    assert.ok(!head.includes('chatgpt.site'));
  }
});

test('preview JPEGs are real, bounded files with declared dimensions', async () => {
  for (const image of Object.values(manifest.images)) {
    const bytes = await readFile(resolve(dist, image.path));
    assert.equal(bytes[0], 0xff);
    assert.equal(bytes[1], 0xd8);
    assert.equal(bytes.length, image.bytes);
    assert.ok(bytes.length < 500_000, image.path);
    assert.ok(image.width >= 300 && image.height >= 157, image.path);
  }
});

test('takeaway links preserve the source price and declare their presentation', () => {
  for (const entry of takeawayItems) {
    assert.equal(entry.price, items.get(entry.sourceId).price);
    assert.notEqual(manifest.images[entry.id].path, manifest.images[entry.sourceId].path);
    if (entry.id === 'to-go-lunch-favourite') assert.equal(entry.image, items.get(entry.sourceId).image); // Menu pairing photo; packaging is not asserted.
    else assert.ok(entry.image.startsWith('takeaway/'));
    assert.ok(manifest.pages.find(p => p.id === entry.id && p.language === 'ru').title.includes('С собой'));
  }
});

test('homepage has one public brand preview, while unsafe share inputs are rejected', async () => {
  const html = await readFile(resolve(dist, 'index.html'), 'utf8');
  const tags = metadata(html.split('</head>')[0]);
  assert.equal(tags.get('og:url'), publicSiteUrl);
  assert.equal(tags.get('og:image'), new URL(manifest.images.menu.path, publicSiteUrl).href);
  assert.throws(() => shareUrl('../secret?token=x', 'ru'));
  assert.throws(() => shareUrl('iced-latte', 'ru&access=secret'));
  assert.equal(new URL(shareUrl('iced-latte', 'ru')).search, '');
});
