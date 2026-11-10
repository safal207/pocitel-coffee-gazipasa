// One-tap native share, with brand-safe links for browsers without Web Share API.
export function makeShareData({ name, description = '', price, url, invitation }) {
  const target = new URL(url);
  if (target.protocol !== 'https:') throw new TypeError('Only HTTPS public share URLs are permitted');
  return {
    title: `${name} · ${price} · Poçitel`,
    text: [description.trim(), `${invitation} · Poçitel Coffee & Brunch`].filter(Boolean).join('\n'),
    url: target.href,
  };
}

export function directShareTargets(data) {
  const message = [data.title, data.text, data.url].filter(Boolean).join('\n');
  return [
    { id: 'whatsapp', label: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(message)}` },
    { id: 'telegram', label: 'Telegram', url: `https://t.me/share/url?${new URLSearchParams({ url: data.url, text: [data.title, data.text].join('\n') })}` },
    { id: 'facebook', label: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: data.url })}` },
    { id: 'x', label: 'X', url: `https://twitter.com/intent/tweet?${new URLSearchParams({ text: data.title, url: data.url })}` },
  ];
}
