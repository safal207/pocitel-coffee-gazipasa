import test from 'node:test';
import assert from 'node:assert/strict';
import { makeShareData, directShareTargets } from '../dist/share-direct.js';
import { shareUrl } from '../dist/share-links.js';
import { items } from '../dist/catalog.js';

test('every menu item can be shared with its real public preview page in TR/EN/RU', () => {
  const langs = ['tr', 'en', 'ru'];
  for (const entry of items.values()) {
    for (const [idx,lang] of langs.entries()) {
      const data = makeShareData({
        name: entry.names[idx], description: entry.descriptions[idx],
        price: `${entry.price} ₺`, invitation: ['Menüden keşfet','Explore this dish','Посмотри это блюдо'][idx],
        url: shareUrl(entry.id, lang),
      });
      assert.equal(data.url, shareUrl(entry.id, lang));
      assert.ok(data.title.includes(entry.names[idx]) && data.title.includes('Poçitel'));
      assert.ok(data.text.includes(entry.descriptions[idx]));
      assert.ok(data.text.includes(['Menüden keşfet','Explore this dish','Посмотри это блюдо'][idx]));
      const targets = directShareTargets(data);
      assert.deepEqual(targets.map(t => t.id), ['whatsapp', 'telegram', 'facebook', 'x']);
      assert.ok(targets.every(t => t.url.startsWith('https://')));
      assert.equal(new URL(targets[0].url).searchParams.get('text').includes(data.url), true);
      assert.equal(new URL(targets[1].url).searchParams.get('url'), data.url);
      assert.equal(new URL(targets[2].url).searchParams.get('u'), data.url);
      assert.equal(new URL(targets[3].url).searchParams.get('url'), data.url);
    }
  }
});

test('never offer an unsafe non-HTTPS sharing URL', () => {
  assert.throws(() => makeShareData({name:'X',price:'1 ₺',url:'javascript:alert(1)',invitation:'Try'}));
});

test('public URL and server metadata are preserved: no extra redirect or image upload', () => {
  const data = makeShareData({name:'Pancakes',description:'Fruit',price:'100 ₺',
    url:shareUrl('pancake','en'),invitation:'Explore this dish'});
  assert.ok(data.title.includes('100 ₺'));
  assert.match(data.url, /share-en-pancake\.html$/);
  assert.ok(!data.url.includes('blob:'));
});
