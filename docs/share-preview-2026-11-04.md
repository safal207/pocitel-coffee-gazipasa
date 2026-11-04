# Product link previews

Sharing a menu item now returns a public, item-specific HTML address. It exposes the chosen image, localized name, price, café name and description in the initial response. This fixes the old query-string links, which all exposed one generic homepage image from an owner-private host.

## Behavior

- 46 menu items and 8 takeaway variants, each in Turkish, English and Russian: 162 static pages.
- Takeaway links use their own cup artwork and open the menu in takeaway mode.
- Opening a shared page opens that product viewer directly, preserving language. Existing `?item=…&lang=…` links still work in the browser.
- The share dialog emphasizes sending/copying the link. Sending or downloading a separate JPEG remains under “Photo separately”.
- Public links use `https://safal207.github.io/pocitel-coffee-gazipasa/`, including when initiated from the private Sites copy. No access, preview, tracking or local-session query parameters are included.
- The homepage has a public brand preview as well.

## Regeneration

The live menu and publisher use `dist/catalog.js`, so names, prices and takeaway images share one source. Run these commands after editing catalog content, images, or the application HTML:

```sh
node scripts/build-share-pages.mjs
node --test tests/share-pages.test.mjs
```

The generator needs Node.js 22+ and Python 3 with Pillow (13.0.0 used for this build). It converts existing artwork to JPEG without cropping or creative modification; maximum dimension is 1200 px. Content-hashed image paths prevent old image bytes from being reused after replacement. The 55 social images are only referenced by metadata; they are not added to the homepage image download path.

Publish the generated pages and images with the source. GitHub Pages serves the contents of `dist/` from the root of `gh-pages`; `.nojekyll` is preserved.

## Validation

- Four automated contracts check all 162 pages without executing browser JavaScript: unique canonical URLs, one set of complete localized metadata, correct prices, correct JPEGs, unchanged application body, and separate takeaway pictures.
- Checked the direct Russian iced-latte page and English takeaway page in the browser. Both opened the correct product and image. Re-sharing retained the correct public address and language.
- Share dialog has no horizontal overflow at 320 and 390 px. Main menu and product viewer still load with the shared catalog module.
- Plain HTTP local preview correctly falls back to selecting the URL when the Clipboard API is unavailable. Native OS share-sheet behavior is not emulated.

Metadata follows the [Open Graph protocol](https://ogp.me/) and includes a large-image Twitter Card declaration. Third-party applications choose their final layout, whether to unfurl, and cache lifetime. No real messages were sent to Telegram, WhatsApp or other recipients as part of validation; cross-messenger rendering is therefore not claimed as tested.
