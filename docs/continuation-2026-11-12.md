# Poçitel continuation audit and release boundary — 12 November 2026

## Sources recovered in this session

- Live repository: https://github.com/safal207/pocitel-coffee-gazipasa
- Starting `main`: `4488cb35d1524d7e12e033dfd2b31d39ce1786fc`.
- PR #16 (Revenue Intelligence pilot) and PR #15 (pairing journey) were already merged.
- GitHub Pages settings reported `gh-pages` as the source, HTTPS enforced, and
  https://safal207.github.io/pocitel-coffee-gazipasa/ returned HTTP 200.
- Existing repository product/QA notes and Revenue Intelligence specification
  were read. No project-specific AGENTS.md was present in this checkout.
- The referenced ChatGPT chat could not be retrieved: no `read_thread` or
  `list_threads` capability is exposed in this session. The supplied preview
  contains no audit text or attachment bytes. The user was asked to attach the
  audit and earlier agreements while repository work continued. This change
  therefore does **not** claim to reconcile the missing audit or all prior chats.

## Current changes

The earlier static pilot already had UTM tags, opt-in on-device events, PCT1
handoffs, POS CSV reconciliation, costs and paid-only reports. Its main gaps
were unprotected browser storage and zero-filled unknown variable expenses.

- Missing cost fields now remain null; explicit verified zeros are required
  before contribution is calculated. Browser cost v1 is retained but excluded
  pending revalidation, with a new v2 cost book. Paid order records are retained.
- Order slip validation rejects missing/non-numeric totals, malformed rows and
  duplicate SKUs. Slips remain unsigned and cannot prove an order or payment.
- CSV row widths/limits and ISO timestamps are checked; all six safe campaign
  tags survive paid receipt normalization. Category events retain their category,
  and one add action no longer also emits a quantity-change event.
- Stored event logs are sanitized and expired records removed at startup;
  recording stops after consent is revoked from another browser tab.
- The optional authenticated Node owner workspace stores private records outside
  the published folder. It distinguishes confirmed-unpaid orders from declared
  payments and supports protected atomic POS/cost imports and JSON backup.
- Visitor-initiated on-site feedback supports keyboard focus, Escape and TR/EN/RU.
  It explicitly sends nothing and collects no free-text personal details.
- Mobile owner forms wrap at 320 px. Existing smooth cart, reduced motion,
  native sharing, ingredient disclosure and no-auto-popup behavior are retained.
- Dependencies are locked; CI adds Chromium/Firefox/WebKit gates for revenue,
  owner, cart and pairing. The complete existing Chromium gate remains required
  before Pages publication. Windows build/test entry points were made portable.
- All 165 share pages were rebuilt from the current application shell. This is
  application consistency, not authorization for SEO: `noindex` remains in place.

## Verification and interpretation

Local checks cover unit/HTTP security boundaries, synthetic receipt import,
idempotency, conflicting import rollback, persistence/restart, unknown costs,
opt-in/retention, unpaid confirmation, payment gating, TR/EN/RU and narrow screens.
Cross-browser E2E runs use Playwright desktop engines and viewport emulation;
they do not prove real iPhone or Android operation. Test receipts and passwords
are synthetic, isolated in temporary directories, and never imported into the
live cafe. GitHub CI and Pages release evidence should be read against the exact
PR/merge SHA, not assumed from these local checks.

## Remaining external dependencies

See [OWNER_WORKSPACE.md](OWNER_WORKSPACE.md). No real POS access, costs, VAT,
receipts or authenticated remote host were provided. Sitewide event collection,
cross-device identity/roles, refunds/void reconciliation and historical cost
snapshots remain launch work. No ROI, uplift, measured revenue or margin result
is claimed. Margin-driven recommendations and SEO promotion remain disabled.
