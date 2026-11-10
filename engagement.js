// Only records interactions performed in this browser. No simulated social proof.
const MAX_VIEWS = 9999999;

export function restoreEngagement(raw, availableIds) {
  const validIds = new Set(availableIds);
  let data = {};
  try {
    const candidate = JSON.parse(raw || '{}');
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) data = candidate;
  } catch { /* Malformed or blocked browser storage starts empty. */ }

  const likes = new Set(
    (Array.isArray(data.likes) ? data.likes : []).filter(id => typeof id === 'string' && validIds.has(id))
  );
  const views = new Map(
    Object.entries(data.views && typeof data.views === 'object' && !Array.isArray(data.views) ? data.views : {})
      .filter(([id, count]) => validIds.has(id) && Number.isSafeInteger(count) && count >= 0 && count <= MAX_VIEWS)
  );
  return { likes, views };
}

export function toggleLike(engagement, id) {
  if (engagement.likes.has(id)) engagement.likes.delete(id);
  else engagement.likes.add(id);
  return engagement.likes.has(id);
}

export function recordView(engagement, id) {
  // Count intentional openings, not scrolling through thumbnails or re-rendering.
  const next = Math.min(MAX_VIEWS, (engagement.views.get(id) ?? 0) + 1);
  engagement.views.set(id, next);
  return next;
}

export function serializeEngagement(engagement) {
  return JSON.stringify({
    likes: [...engagement.likes],
    views: Object.fromEntries(engagement.views),
  });
}
