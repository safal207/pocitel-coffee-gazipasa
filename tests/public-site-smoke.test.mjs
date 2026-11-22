import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPublishedSite } from '../scripts/public-site-smoke.mjs';

const origin = 'https://safal207.github.io/pocitel-coffee-gazipasa/';
const sourceHtml = [
  '<!doctype html><html><head><title>Poçitel Coffee</title>',
  '<link rel="stylesheet" href="style.css?v=1">',
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
  'style.css': ['.menu{display:block}', 'text/css'],
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

test('public smoke validates exact published HTML and critical assets without writes', async () => {
  const result = await checkPublishedSite({ sourceHtml, request: fakeRequest() });
  assert.equal(result.status, 'PASS');
  assert.equal(result.checked.length, 8);
});

test('public smoke rejects missing or stale deployed HTML', async () => {
  const files = { ...cleanFiles, '': ['<html>old release</html>', 'text/html'] };
  await assert.rejects(checkPublishedSite({ sourceHtml, request: fakeRequest(files) }), /stale or mismatched deploy/);
});

test('public smoke rejects missing image and wrong MIME type', async () => {
  const missing = { ...cleanFiles };
  delete missing['assets/illustrations/branded/smoked-turkey.webp'];
  await assert.rejects(checkPublishedSite({ sourceHtml, request: fakeRequest(missing) }), /HTTP 404/);
  const wrongMime = { ...cleanFiles, 'app.js': ['code', 'text/html'] };
  await assert.rejects(checkPublishedSite({ sourceHtml, request: fakeRequest(wrongMime) }), /unexpected content type/);
});

test('public smoke blocks third-party preview URL and insecure remote targets', async () => {
  const external = sourceHtml.replace(origin + 'assets/social/menu.jpg', 'https://example.org/unknown.jpg');
  await assert.rejects(checkPublishedSite({ sourceHtml: external, request: fakeRequest({ ...cleanFiles, '': [external, 'text/html'] }) }), /stay on the published menu origin/);
  await assert.rejects(checkPublishedSite({ baseUrl: 'http://example.com/menu/', sourceHtml, request: fakeRequest() }), /require HTTPS/);
});
