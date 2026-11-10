// Public, pre-rendered item URLs carry Open Graph image/title/price metadata.
// Channel URLs are fallbacks when the browser has no native Web Share API.
export function socialShareTargets({ title, text, url }) {
  const message = [text || title, url].filter(Boolean).join(' ');
  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text || title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text || title)}&url=${encodeURIComponent(url)}`,
  };
}
