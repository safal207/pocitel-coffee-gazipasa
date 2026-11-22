// Read-only post-deploy release smoke. No orders, payments or private APIs.
// Verify the actual public bytes, not just HTTP 200 or a plausible Content-Type.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC_URL = 'https://safal207.github.io/pocitel-coffee-gazipasa/';
const DIST = new URL('../dist/', import.meta.url);

export async function checkPublishedSite({
  baseUrl = PUBLIC_URL,
  sourceHtml,
  request = fetch,
  localFile = path => readFile(new URL(path, DIST)),
} = {}) {
  if (typeof sourceHtml !== 'string' || !sourceHtml.length) {
    throw Error('Expected local dist/index.html is required');
  }
  const base = new URL(baseUrl);
  if (base.protocol !== 'https:' && !(base.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(base.hostname))) {
    throw Error('Smoke checks require HTTPS (except local test servers)');
  }
  if (!base.pathname.endsWith('/')) throw Error('Public base URL must end in /');

  const resolveResource = relative => {
    const url = new URL(relative, base);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
      throw Error('Resource must stay on the published menu origin and path: ' + relative);
    }
    const path = decodeURIComponent(url.pathname.slice(base.pathname.length));
    if (path && !/^[a-z0-9][a-z0-9/_-]*\.(?:js|css|webp|jpe?g|html)$/i.test(path)) {
      throw Error('Unsafe or unsupported published resource path: ' + relative);
    }
    return { url, path };
  };

  async function read(relative, mime) {
    const { url, path } = resolveResource(relative);
    url.searchParams.set('_pocitel_smoke', Date.now().toString());
    const response = await request(url.href, {
      headers: { 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw Error(url.pathname + ': HTTP ' + response.status);
    const actualType = response.headers.get('content-type') ?? '';
    if (!mime.test(actualType)) throw Error(url.pathname + ': unexpected content type ' + actualType);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) throw Error(url.pathname + ': empty response');
    return { path, bytes };
  }

  const htmlResponse = await read('', /text\/html/i);
  const expectedHtml = Buffer.from(sourceHtml, 'utf8');
  if (!htmlResponse.bytes.equals(expectedHtml)) {
    throw Error('Published index.html differs from checked-out dist/index.html (stale or mismatched deploy)');
  }
  const html = sourceHtml;
  for (const marker of ['id="menu"', 'id="results"', 'id="selection-bar"']) {
    if (!html.includes(marker)) throw Error('Missing critical menu marker: ' + marker);
  }

  const required = (regex, name) => {
    const value = html.match(regex)?.[1];
    if (!value) throw Error('Critical resource missing from index.html: ' + name);
    return value;
  };
  const resources = [
    [required(/<script[^>]*src="([^"]*app\.js[^"]*)"/i, 'app.js'), /javascript|ecmascript/i],
    [required(/<link[^>]*rel="modulepreload"[^>]*href="([^"]*menu\.js[^"]*)"/i, 'menu.js'), /javascript|ecmascript/i],
    [required(/<link[^>]*rel="modulepreload"[^>]*href="([^"]*order-options\.js[^"]*)"/i, 'order-options.js'), /javascript|ecmascript/i],
    [required(/<link[^>]*rel="modulepreload"[^>]*href="([^"]*checkout-offers\.js[^"]*)"/i, 'checkout-offers.js'), /javascript|ecmascript/i],
    [required(/<link[^>]*rel="stylesheet"[^>]*href="([^"]*style\.css[^"]*)"/i, 'style.css'), /text\/css/i],
    [required(/<link[^>]*rel="stylesheet"[^>]*href="([^"]*appearance\.css[^"]*)"/i, 'appearance.css'), /text\/css/i],
    [required(/<div id="home-showcase">[\s\S]*?<img[^>]*src="([^"]+)"/i, 'main product image'), /image\/(?:webp|jpe?g|png)/i],
    [required(/<meta property="og:image" content="([^"]+)"/i, 'social preview'), /image\/(?:webp|jpe?g|png)/i],
    ['share-tr-cappuccino.html', /text\/html/i],
    ['share-en-cappuccino.html', /text\/html/i],
    ['share-ru-cappuccino.html', /text\/html/i],
  ];
  for (const [file, mime] of resources) {
    const { bytes, path } = await read(file, mime);
    const expected = Buffer.from(await localFile(path));
    if (!bytes.equals(expected)) {
      throw Error('Published ' + path + ' differs from checked-out dist/' + path + ' (stale or mismatched deploy)');
    }
  }
  return { status: 'PASS', checked: ['index.html', ...resources.map(([file]) => resolveResource(file).path)] };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const sourceHtml = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  try {
    const result = await checkPublishedSite({ sourceHtml, baseUrl: process.env.POCITEL_PUBLIC_URL || PUBLIC_URL });
    console.log('Published Poçitel smoke:', result.status, result.checked.length, 'byte-identical resources verified');
    result.checked.forEach(file => console.log('PASS', file));
  } catch (error) {
    console.error('Published Poçitel smoke: FAIL:', error.message);
    process.exitCode = 1;
  }
}
