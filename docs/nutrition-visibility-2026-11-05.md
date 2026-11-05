# Visible calories and direct nutrition access

The menu now shows an estimated calorie range for each of its 46 menu entries and 8 takeaway variants. Each range is a button labelled with ingredients, nutritional benefits and vitamins. Activating it opens the existing nutrition panel, moves focus to its disclosure and scrolls it into view. The viewer keeps the item name and close control visible in a sticky header. Pairings are explicitly labelled as the whole pairing; individual items as one assumed serving.

The recipe, portion, vitamin and ingredient data remain the editorial assumptions documented in `nutrition-2026-11-04.md`. They are not café-approved measured values. The feed includes a short estimate notice in Turkish, English and Russian; the full panel retains recipe uncertainty, portion assumptions, ingredient provenance, references and customization notices. No new therapeutic claims or quantitative vitamin amounts were introduced.

`dist/nutrition-summary.js` is a generated 1,287-byte table derived from the detailed calculations. Run `node scripts/build-nutrition-summary.mjs` after recipe edits; the existing nutrition coverage test now checks feed/detail parity for all 54 entries. Detailed ingredient and vitamin modules still load only when an item opens.

Validation: all 9 existing nutrition and sharing tests passed, including all 54 entries in three languages. All 162 static sharing pages were regenerated to use the new application and CSS versions. JavaScript syntax and whitespace checks passed. Browser inspection confirmed visible calories and direct expanded nutrition access on desktop; Russian çılbır and English takeaway iced latte in 390 px and 320 px iframe viewports. No horizontal overflow was observed in those views (320 px iframe has 305 px content width with its scrollbar). No site-origin error was observed; browser extension metadata errors were present. A saved screenshot accompanies this note.

These are browser-based responsive checks, not native iOS/Android device tests. Exact café recipes, serving sizes and nutrient measurements remain unavailable.
