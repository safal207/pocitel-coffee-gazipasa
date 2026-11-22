// Read-only post-deploy release smoke. No orders, payments or private APIs.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC_URL = 'https://safal207.github.io/pocitel-coffee-gazipasa/';

export async function checkPublishedSite({ baseUrl = PUBLIC_URL, sourceHtml, request = fetch } = {}) {
  if (typeof sourceHtml !== 'string' || !sourceHtml.length) throw Error('Expected local dist/index.html is required');
  const base = new URL(baseUrl);
  if (base.protocol !== 'https:' && !(base.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(base.hostname))) {
    throw Error('Smoke checks require HTTPS (except local test servers)');
  }
  if (!base.pathname.endsWith('/')) throw Error('Public base URL must end in /');

  async function read(relative, mime) {
    const url = new URL(relative, base);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
      throw Error('Resource must stay on the published menu origin and path: ' + relative);
    }
    // Avoid accidentally accepting a previously cached release.
    url.searchParams.set('_pocitel_smoke', Date.now().toString());
    const response = await request(url.href, { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw Error(url.pathname + ': HTTP ' + response.status);
    const actualType = response.headers.get('content-type') ?? '';
    if (!mime.test(actualType)) throw Error(url.pathname + ': unexpected content type ' + actualType);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) throw Error(url.pathname + ': empty response');
    return bytes.toString('utf8');
  }

  const html = await read('', /text\/html/i);
  if (html !== sourceHtml) throw Error('Published index.html differs from checked-out dist/index.html (stale or mismatched deploy)');
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
    [required(/<link[^>]*rel="stylesheet"[^>]*href="([^"]*style\.css[^"]*)"/i, 'style.css'), /text\/css/i],
    [required(/<div id="home-showcase">[\s\S]*?<img[^>]*src="([^"]+)"/i, 'main product image'), /image\/(?:webp|jpe?g|png)/i],
    [required(/<meta property="og:image" content="([^"]+)"/i, 'social preview'), /image\/(?:webp|jpe?g|png)/i],
    ['share-tr-cappuccino.html', /text\/html/i],
    ['share-en-cappuccino.html', /text\/html/i],
    ['share-ru-cappuccino.html', /text\/html/i],
  ];
  for (const [file, type] of resources) await read(file, type);
  return { status: 'PASS', checked: ['index.html', ...resources.map(([file]) => file)] };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const sourceHtml = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  try {
    const result = await checkPublishedSite({ sourceHtml, baseUrl: process.env.POCITEL_PUBLIC_URL || PUBLIC_URL });
    console.log('Published Poçitel smoke:', result.status, result.checked.length, 'resources verified');
    result.checked.forEach(file => console.log('PASS', file));
  } catch (error) {
    console.error('Published Poçitel smoke: FAIL:', error.message);
    process.exitCode = 1;
  }
}
