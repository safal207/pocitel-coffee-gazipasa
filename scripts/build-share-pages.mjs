import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { items } from '../dist/catalog.js';
import { publicSiteUrl, shareLanguages, sharePageName, shareUrl } from '../dist/share-links.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const social = resolve(dist, 'assets/social');
await mkdir(social, { recursive: true });
const jobs = [];
for (const [id, entry] of [['menu', { image: 'hero-wide-960' }], ...items]) {
  const source = resolve(dist, `assets/${entry.image}.webp`);
  const hash = createHash('sha256').update(await readFile(source)).digest('hex').slice(0, 12);
  const path = `assets/social/${id}-${hash}.jpg`;
  jobs.push({ id, source, target: resolve(dist, path), path });
}
const conversion = spawnSync('python3', [resolve(root, 'scripts/encode-share-images.py')], {
  input: JSON.stringify(jobs), encoding: 'utf8', maxBuffer: 1024 * 1024,
});
if (conversion.status !== 0) throw new Error(conversion.stderr || conversion.error || 'JPEG encoding failed');
const images = new Map(JSON.parse(conversion.stdout).map((image, i) => [jobs[i].id, image]));
const usedImages = new Set([...images.values()].map(image => image.path.split('/').at(-1)));
for (const file of await readdir(social)) {
  if (/^[a-z0-9-]+-[a-f0-9]{12}\.jpg$/.test(file) && !usedImages.has(file)) await unlink(resolve(social, file));
}

const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const locales = ['tr_TR', 'en_GB', 'ru_RU'];
const priceLocales = ['tr-TR', 'en-GB', 'ru-RU'];
const toGo = ['Al götür', 'To go', 'С собой'];
const invitation = ['Menüyü keşfedin.', 'Explore the menu.', 'Откройте меню.'];
const siteName = 'Poçitel Coffee & Brunch';
const marker = /<!-- social-meta:start -->[\s\S]*?<!-- social-meta:end -->/;
let template = await readFile(resolve(dist, 'index.html'), 'utf8');
if (!marker.test(template)) throw new Error('Missing social metadata slot');

function meta({ title, description, image, url, languageIndex, alt }) {
  const imageUrl = new URL(image.path, publicSiteUrl).href;
  const tags = [
    ['property', 'og:type', 'website'],
    ['property', 'og:site_name', siteName],
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:url', url],
    ['property', 'og:locale', locales[languageIndex]],
    ['property', 'og:image', imageUrl],
    ['property', 'og:image:secure_url', imageUrl],
    ['property', 'og:image:type', 'image/jpeg'],
    ['property', 'og:image:width', image.width],
    ['property', 'og:image:height', image.height],
    ['property', 'og:image:alt', alt],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
    ['name', 'twitter:image', imageUrl],
    ['name', 'twitter:image:alt', alt],
    ['name', 'description', description],
  ];
  return `<!-- social-meta:start -->\n  <title>${escape(title)}</title>\n  <link rel="canonical" href="${escape(url)}">\n` +
    tags.map(([attr, key, value]) => `  <meta ${attr}="${key}" content="${escape(value)}">`).join('\n') +
    '\n  <!-- social-meta:end -->';
}

template = template.replace(marker, meta({
  title: `${siteName} · Gazipaşa`,
  description: 'İyi kahve, güzel anlar. Kahvaltı, focaccia, kahve ve favori eşleşmeler. Menüyü keşfedin.',
  image: images.get('menu'), url: publicSiteUrl, languageIndex: 0,
  alt: 'Poçitel Coffee & Brunch · Çılbır',
}));
await writeFile(resolve(dist, 'index.html'), template);
const pages = [];
for (const entry of items.values()) {
  for (const [languageIndex, language] of shareLanguages.entries()) {
    const name = `${entry.names[languageIndex]}${entry.sourceId ? ` · ${toGo[languageIndex]}` : ''}`;
    const amount = `${entry.price.toLocaleString(priceLocales[languageIndex])} ₺`;
    const title = `${name} · ${amount} · Poçitel`;
    const description = [entry.descriptions[languageIndex], 'Poçitel Coffee & Brunch · Gazipaşa', invitation[languageIndex]].filter(Boolean).join('. ');
    const url = shareUrl(entry.id, language);
    const image = images.get(entry.id);
    const html = template.replace(marker, meta({ title, description, image, url, languageIndex, alt: name }))
      .replace('<html lang="tr">', `<html lang="${language}" data-share-item="${entry.id}" data-share-lang="${language}">`);
    const path = sharePageName(entry.id, language);
    await writeFile(resolve(dist, path), html);
    pages.push({ id: entry.id, language, path, url, title, description, image: image.path });
  }
}
const pageNames = new Set(pages.map(page => page.path));
for (const file of await readdir(dist)) {
  if (/^share-(tr|en|ru)-[a-z0-9-]+\.html$/.test(file) && !pageNames.has(file)) await unlink(resolve(dist, file));
}
await writeFile(resolve(dist, 'share-manifest.json'), JSON.stringify({ publicSiteUrl, images: Object.fromEntries(images), pages }, null, 2) + '\n');
console.log(`Built ${pages.length} static share pages and ${images.size} JPEG previews.`);
