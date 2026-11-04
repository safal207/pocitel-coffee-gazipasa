// Messenger crawlers need a public HTML page; never share a private preview URL.
export const publicSiteUrl = 'https://safal207.github.io/pocitel-coffee-gazipasa/';
export const shareLanguages = ['tr', 'en', 'ru'];

export function sharePageName(id, language) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error('Invalid menu item');
  if (!shareLanguages.includes(language)) throw new Error('Invalid menu language');
  return `share-${language}-${id}.html`;
}

export function shareUrl(id, language) {
  return new URL(sharePageName(id, language), publicSiteUrl).href;
}
