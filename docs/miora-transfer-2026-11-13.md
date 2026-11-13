# Miora → Poçitel: selected feature transfer

Reference: https://safal207.github.io/miora-coffee/ and
`safal207/miora-coffee` at `33f27c4332cacf9d115d3c42fce61a1d2cf93813`.
Target baseline: Poçitel `a382c7da9feb78725c8df0602b12a87e711a1492`.
The published Miora menu and its implementation were inspected, including
`docs/category-navigation-2026-11-12.md` and `docs/desire-graph-2026-11-12.md`.

## Adapted features

1. **Photo / compact menu choice.** A remembered display preference changes
   presentation, preserving the exact product IDs, filters, prices, saved items
   and cart. Compact rows retain photo-to-detail access, explicit saving/adding
   and readable illustration provenance. The existing photo presentation remains
   the default. `?view=list` can open the compact mode directly.
2. **Visible category navigation.** Choosing a category clears stale search,
   occasion and saved-only constraints and navigates to its actual first result
   below sticky controls. Keyboard focus stays on the existing category button.
3. **Turkish staff copy and local text QR.** The waiter view can copy the actual
   selected quantities, serving formats, customizations and prices in Turkish.
   QR generation is visitor-initiated and loaded locally on demand. Its payload
   is human-readable order text, with no URL, UTM tags, visitor IDs or payment
   claim. It is separate from the existing unsigned PCT1 owner-import code.
   Clipboard denial reveals selectable text; overly long/unavailable QR falls
   back to the visible order and copying. The QR includes a four-module quiet zone.
4. **Same-browser tab synchronization.** A stored order change refreshes counts,
   an open cart and waiter view in other tabs. Stale configurators are closed;
   any old QR is hidden and the PCT1 slip regenerated. This does not create a paid
   record, emit an add event for another tab or synchronize between devices.

The storage model remains one browser's latest saved snapshot, not conflict-free
collaboration: simultaneous writes are not an order/POS synchronization service.
Browser storage blocking leaves the current tab usable but prevents persistence
and tab synchronization, as before.

## Provenance and scope

Poçitel's catalog, prices, recipes, branding and photos were retained. Miora's
sandwich/breakfast constructors, social videos and menu/photographic claims were
not copied: they rely on that cafe's distinct recipes and approved source assets.
Existing Poçitel pairing discovery, favorites, customization and native sharing
already cover the corresponding Miora capabilities.

The QR vendor bundle was reused from Miora under its included MIT notice, retaining
the Kazuhiko Arase copyright/license in `dist/assets/qr-LICENSE.txt`. The browser global was renamed to `PocitelQRCode` and trailing whitespace normalized. Reference bundle SHA-256:
`7219f6396e569c47f9f2a66221e5aa98b4a73aeca7bc5491d11ff55035f41109`.
The byte encoder receives UTF-8 bytes; a test decodes the resulting raster with
locked dev-only `jsqr@1.4.0` and checks exact Turkish text round-trip.

## Release gates

- Full Node suite, including actual recipe/price text and decoded QR round-trip.
- Chromium/Firefox/WebKit: TR/EN/RU at 320/390/1280 px; search → category,
  keyboard focus, unchanged membership, view persistence, add/save/details,
  clipboard fallback, no unsolicited network calls or paid/opt-in records, and
  two-tab waiter/QR invalidation.
- Existing ingredient, cart-scroll, pairing, sharing and revenue regression.
- Rebuild all 165 share pages from the current shell and bump public asset revisions.
- Merge only after CI passes; validate Pages and run a live smoke check separately.

No SEO permission, margin recommendation, real sales result, POS connection or
physical-device acceptance is implied by this feature transfer. `noindex` and
the separate authenticated local owner-workspace boundary are retained.
