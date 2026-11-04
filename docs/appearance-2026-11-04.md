# Four appearance modes

Added Light, Dark, Romantic and Kids buttons immediately below the brand header, translated into TR/EN/RU. The choice is stored locally and applied by a small blocking script before styles load. The default remains the existing light brand palette. Dark mode updates the browser color scheme and theme-color metadata; it uses separate text and button-fill tokens. Product images remain unchanged. Romantic adds rose accents, rounded cards and hearts; Kids adds teal/gold, rounded sans-serif headings and star decorations.

All menu, configurator, cart, optional offer, handoff and share surfaces use the selected palette. Header height is measured so category navigation aligns below both header rows.

## Validation

- JavaScript syntax and git whitespace checks passed.
- Browser: four 320px frames (305px content with desktop scrollbars) had no horizontal document overflow; each reported the expected root theme and color scheme.
- Desktop: native page dark-mode selection survived reload. Keyboard activation selected Romantic.
- A 330 ₺ çılbır selection stayed at 330 ₺ through Romantic, Kids and Light switches. Dark cart, optional +15 ₺ tea pairing and checkout button were inspected.
- Header bottom and sticky filter top aligned at 130 / 130.25px after navigation.
- English, Turkish and Russian appearance labels verified.
- Calculated contrast minima across main text tokens on paper/card/offer surfaces and button states: Light 5.21, Dark 5.28, Romantic 4.87, Kids 4.86.
- The comparison screenshot uses separate in-memory storage per frame to display four themes at once. These QA pages were removed from the deployment.
- The shared preview server was subsequently switched to another project by concurrent work; no other project's source or hosting was changed. The screenshot was captured from the already-loaded Poçitel comparison page.

Screenshot: `four-styles-mobile.jpg`.
