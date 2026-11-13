# Larger cart photos and meaningful cutaways

The cart previously reduced pictures to 80px on narrow phones. Following the
Miora assembled-food cart treatment, each Poçitel row now has a full-width
180–240px image frame. `object-fit: contain` preserves the entire existing image;
title, serving, customization, quantity buttons and price remain below it.
Existing illustration labels and a fixed checkout total remain available.
No new product imagery or recipes were created.

Previously any item with ingredient text qualified for a horizontal cutaway.
Without a dedicated image pair, the same image appeared on both sides. Some
other pairs merely showed another angle of a plate or bowl. Ingredient text
alone is no longer a reason to show a slider.

## Visually reviewed image pairs

Sliders remain for smoked-turkey, beetroot and zucchini focaccia, omelet-plate,
and pancake; the matching sweet-morning, lunch-favourite and to-go-lunch-favourite
pairings use those food images. These are the existing **illustrations**, with
their disclosure retained, not a claim of actual food photography or live stock.

All other food entries show their normal image and a complete translated,
keyboard-operable ingredient list without a slider, handle or reveal button.
This includes çılbır, menemen, granola, takeaway granola, breakfast-plate, fries,
sucuk and food extras. Alternate bowl/plate images were retained as assets but
are not presented as internal cross-sections. Drinks remain plain photographs
or labelled illustrations without invented ingredient lists.

The reviewed media policy is isolated in `dist/cutaway-media.js`. Of 55 catalog
entries, 24 have ingredient text; 8 have a reviewed slider, 16 use plain ingredient
lists, and the other 31 do not acquire an invented composition. Matching combo
views explicitly describe the food component and retain existing prices.

## Verification

- Node suite checks explicit media eligibility, file existence, distinct images
  and preservation of ingredient text for entries without sliders.
- The 55-item inventory / 24-food UI matrix covers both static and slider views.
- Cart tests cover 320/390/768px in TR/EN/RU, full-width images, minimum height,
  complete image fit, quantity totals, staff handoff and keyboard disclosure.
- Existing long-cart quantity tests ensure no jump in scroll or focus after +/-.
- CI runs the cart suite in Chromium, Firefox and WebKit, plus the full existing
  ingredient/menu/revenue regression before Pages publication.
- Public revisions and all 165 share pages are rebuilt together. Noindex,
  analytics consent and the separate private owner-workspace boundary remain.

Older cutaway notes describe the earlier broad slider policy; this request
supersedes that UI policy without removing valid menu composition information.
Desktop browser emulation is distinct from real-phone acceptance.
