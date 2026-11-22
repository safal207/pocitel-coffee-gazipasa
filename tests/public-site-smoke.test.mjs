import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { checkPublishedSite } from '../scripts/public-site-smoke.mjs';

const origin = 'https://safal207.github.io/pocitel-coffee-gazipasa/';
const sourceHtml = [
  '<!doctype html><html><head><title>Poçitel Coffee</title>',
  '<link rel="stylesheet" href="style.css?v=1">',
  '<link rel="stylesheet" href="appearance.css?v=1">',
  '<link rel="modulepreload" href="menu.js?v=1">',
  '<link rel="modulepreload" href="order-options.js?v=1">',
  '<link rel="modulepreload" href="checkout-offers.js?v=1">',
  '<script src="app.js?v=1"></script>',
  '<meta property="og:image" content="' + origin + 'assets/social/menu.jpg">',
  '</head><body><div id="menu"></div><div id="results"></div>',
  '<button id="selection-bar"></button>',
  '<div id="home-showcase"><img src="assets/illustrations/branded/smoked-turkey.webp"></div>',
  '</body></html>',
].join('');

const cleanFiles = {
  '': [sourceHtml, 'text/html'],
  'app.js': ['export const ready = true;', 'text/javascript'],
  'menu.js': ['export const menu = [];', 'text/javascript'],
  'order-options.js': ['export const options = [];', 'text/javascript'],
  'checkout-offers.js': ['export const offers = [];', 'text/javascript'],
  'style.css': ['.menu{display:block}', 'text/css'],
  'appearance.css': ['.theme{display:block}', 'text/css'],
  'assets/illustrations/branded/smoked-turkey.webp': ['fake-image-bytes', 'image/webp'],
  'assets/social/menu.jpg': ['fake-preview-bytes', 'image/jpeg'],
  'share-tr-cappuccino.html': ['<html lang="tr">menu</html>', 'text/html'],
  'share-en-cappuccino.html': ['<html lang="en">menu</html>', 'text/html'],
  'share-ru-cappuccino.html': ['<html lang="ru">menu</html>', 'text/html'],
};
function fakeRequest(files = cleanFiles) {
  return async url => {
    const path = new URL(url).pathname.replace('/pocitel-coffee-gazipasa/', '');
    const file = files[path];
    return file
      ? new Response(file[0], { status: 200, headers: { 'Content-Type': file[1] } })
      : new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  };
}
const localFile = async path => Buffer.from(cleanFiles[path][0]);
const run = (files = cleanFiles, html = sourceHtml) =>
  checkPublishedSite({ sourceHtml: html, request: fakeRequest(files), localFile });

test('public smoke checks exact published HTML and 11 byte-identical resources', async () => {
  const result = await run();
  assert.equal(result.status, 'PASS');
  assert.equal(result.checked.length, 12);
});

test('public smoke detects stale published index.html', async () => {
  const files = { ...cleanFiles, '': ['<html>old release</html>', 'text/html'] };
  await assert.rejects(run(files), /stale or mismatched deploy/);
});

test('public smoke rejects missing images and misleading MIME types', async () => {
  const files = { ...cleanFiles };
  delete files['assets/illustrations/branded/smoked-turkey.webp'];
  await assert.rejects(run(files), /HTTP 404/);
  await assert.rejects(run({ ...cleanFiles, 'app.js': ['script text', 'text/html'] }), /unexpected content type/);
});

test('public smoke detects stale JS and stale images even when HTTP 200 and MIME are valid', async () => {
  await assert.rejects(
    run({ ...cleanFiles, 'app.js': ['old valid JS', 'text/javascript'] }),
    /Published app\.js differs from checked-out dist\/app\.js/,
  );
  await assert.rejects(
    run({ ...cleanFiles, 'assets/illustrations/branded/smoked-turkey.webp': ['old image', 'image/webp'] }),
    /Published assets\/illustrations\/branded\/smoked-turkey\.webp differs/,
  );
});

test('public smoke rejects untrusted origins and insecure remote targets', async () => {
  const external = sourceHtml.replace(origin + 'assets/social/menu.jpg', 'https://example.org/unknown.jpg');
  await assert.rejects(
    checkPublishedSite({ sourceHtml: external, request: fakeRequest({ ...cleanFiles, '': [external, 'text/html'] }), localFile }),
    /stay on the published menu origin/,
  );
  await assert.rejects(
    checkPublishedSite({ baseUrl: 'http://example.com/menu/', sourceHtml, request: fakeRequest(), localFile }),
    /require HTTPS/,
  );
});

test('real dist/index.html references all critical release assets and the exact bytes pass', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const local = async path => readFile(new URL('../dist/' + path, import.meta.url));
  const request = async url => {
    const path = new URL(url).pathname.replace('/pocitel-coffee-gazipasa/', '') || 'index.html';
    const mime = path.endsWith('.html') ? 'text/html' : path.endsWith('.css') ? 'text/css'
      : path.endsWith('.js') ? 'text/javascript' : path.endsWith('.webp') ? 'image/webp'
      : 'image/jpeg';
    return new Response(await local(path), { status: 200, headers: { 'Content-Type': mime } });
  };
  const result = await checkPublishedSite({ sourceHtml: html, request, localFile: local });
  assert.equal(result.status, 'PASS');
  assert.equal(result.checked.length, 12);
});
