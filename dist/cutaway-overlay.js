// Stable, compact on-photo caption. The full menu-derived list remains below the photo.
const escapeLabel = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

export function previewFor(reveal) {
  if (!reveal || !Array.isArray(reveal.parts) || !reveal.parts.length) return null;
  return {
    preview: reveal.parts.slice(0, 3),
    remaining: Math.max(0, reveal.parts.length - 3),
    full: reveal.parts,
  };
}

export function cutawayOverlayMarkup(reveal, title, moreLabel, allLabel) {
  const data = previewFor(reveal);
  if (!data) return '';
  // Cached older app.js versions call this module with only three arguments.
  // Keep their noninteractive caption until they receive the matching app code.
  if (allLabel === undefined) {
    return `<div class="cutaway-ingredient-card" data-qa="inside-overlay" role="note" aria-label="${escapeLabel(title)}: ${escapeLabel(data.full.join(', '))}">
    <span class="cutaway-inside-kicker">${escapeLabel(title)}</span>
    <span class="cutaway-inside-preview">${data.preview.map(escapeLabel).join(' · ')}</span>
    ${data.remaining ? `<span class="cutaway-inside-more">+${data.remaining} ${escapeLabel(moreLabel)}</span>` : ''}
  </div>`;
  }
  return `<button type="button" class="cutaway-ingredient-card" data-qa="inside-overlay" data-cutaway-ingredients-toggle aria-controls="cutaway-ingredients" aria-expanded="false" aria-label="${escapeLabel(allLabel)}: ${escapeLabel(data.full.join(', '))}">
    <span class="cutaway-inside-kicker">${escapeLabel(title)}</span>
    <span class="cutaway-inside-preview">${data.preview.map(escapeLabel).join(' · ')}</span>
    ${data.remaining ? `<span class="cutaway-inside-more">+${data.remaining} ${escapeLabel(moreLabel)}</span>` : ''}
  </button>`;
}
