# Look inside: complete food coverage

Extends the existing ingredient reveal to every food item in the current menu:

- 11 breakfast, snack and focaccia dishes;
- 6 food extras: tomatoes and cucumber, olives, sliced cheese, egg, Nutella and Belgian chocolate sauce;
- food in all 4 fixed pairings, plus the existing 3 takeaway food/pairing entries.

All 24 catalog entries have Turkish, English and Russian labels. Extras use only the component named by the menu; no unlisted recipe, cheese variety or egg preparation is implied. Drinks retain their nutrition view.

Every eligible card now has an explicit “Look inside” button below its description as well as the photo badge. The viewer retains the comparison slider and adds a button to reveal all ingredient labels without dragging. The button and slider share the same percentage and accessible state. Focaccias compare illustrated views; open plates and extras reveal menu labels over their existing image. AI images remain labelled.

Cache versions are updated in the entry document and ingredient module. Static share entry pages are regenerated with `node scripts/build-share-pages.mjs`.

Validation before publication: `node --test tests/*.test.mjs` — 26 passed; JavaScript syntax and `git diff --check` passed. Live rendering and interaction are checked after the GitHub Pages deployment.
