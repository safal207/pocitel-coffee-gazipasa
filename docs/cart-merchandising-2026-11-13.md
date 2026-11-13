# Cart merchandising and card quality — 13 November 2026

## Product decisions

The Miora implementation and its desire/journey notes were reviewed alongside
the user's available local discussion of clear food imagery, visible actions
and a natural sequence of choices. Private conversation contents are not bundled
with this public repository. A separate early cart-only conversation was not
available in the exposed chat tools; no claim of full thread recovery is made.

Selected product cards retain the existing large complete-image treatment and
now expose the catalog description for ordinary dishes, serving, exact selected
options, per-portion price × quantity, edit and +/- controls. No new food images,
ingredients, sensory/health promises or popularity labels were invented.

There is one optional companion, not a rotating ad or a preselected addition.
For an upgrade, the large picture and title show the **missing component**:
pancakes alongside cappuccino or iced americano alongside focaccia. The pairing
name/composition, selected portion being included, exact extra charge and
before/after totals explain what happens to the existing order.

An ordinary meal that already contains food and a drink receives no third-drink
upsell. Existing matching food/drink portions can still be combined when their
actual menu price is lower. Unrelated extras are not ranked using unknown costs
or margins. A generic addition has no savings badge.

The former checkbox is now an explicit, keyboard-operable action button with
its charge. Nothing is added before the click. The updated offer has a clear
undo action, backed by the exact existing cart transaction. A refusal hides the
offer for the current cart visit, including subsequent quantity changes.

## Arithmetic and trust

All figures use current catalog prices, not claimed POS measurements. For one
185 ₺ cappuccino, the existing 460 ₺ sweet-morning pairing adds pancakes for
275 ₺. The same two separately priced items total 485 ₺, so the actual menu
difference is 25 ₺. For one 240 ₺ smoked-turkey focaccia, the 395 ₺ pairing adds
iced americano for 155 ₺, versus a 415 ₺ separate total (20 ₺ difference).

The presentation model applies the same validated transaction as the cart to
derive totals. It preserves drink modifiers, other portions and stale-offer
rejection. Preview calculations do not mutate the selected order. Discounts
are differences between actual catalog selections, not fabricated percentages
or contribution-margin claims. Paid-only reporting remains separate.

## Verification boundary

- Unit checks: relevance, exact delta/savings, missing-component identity,
  preserved modifiers/extra portions, no mutation on preview, stale-offer
  rejection and exact undo.
- Browser checks: TR/EN/RU × 320/390/768px; explicit add, undo by keyboard,
  refusal, no unsolicited paid/analytics record and no page overflow.
- Existing card image, long-cart scroll, pairing, ingredients, sharing, owner
  and revenue tests remain required in CI across three engines.
- Public asset revisions and all 165 share shells are rebuilt together.
- Python subprocess I/O is explicitly UTF-8 so image/share regeneration also
  works from the project's Cyrillic Windows directory.

Browser emulation is not physical-device acceptance. No measured conversion,
revenue uplift, stock availability or real POS connection is claimed. Noindex,
the no-auto-popup rule and the private owner-workspace boundary remain intact.
