# Poçitel Revenue Intelligence v0.1

**Status:** local-first pilot; public menu on GitHub Pages. No authenticated cloud database, POS API, payment processor or centralized analytics has been connected.

## Complete usable local pilot workflow

1. Visitor arrives via a QR or UTM link, chooses real menu items, and may opt into 30-day on-device interaction logging. No events are sent to a server.
2. Visitor opens Show Waiter and may copy a PCT1. order code. It contains an unsigned draft ID, item IDs, quantities, quote and safe attribution tags. The code is **not payment evidence**.
3. Cafe staff opens /admin.html on their own device, pastes the code, checks the actual payment and marks it as staff_manual. Duplicate order IDs are not counted twice.
4. Alternatively import paid receipts from the POS CSV. Each line belongs to order_id; duplicates are skipped. Provenance is pos_csv, not remotely verified by the website.
5. Manager enters cost per SKU or imports a cost CSV. Dashboard computes paid-only gross, ticket average, contribution and quality coverage. Unknown VAT and ingredients are explicitly missing, never zero by assumption.
6. Export all orders, costs and local event log into separate JSON backups. This local data does not synchronize across staff devices.

## Financial definitions

Gross line = quantity × actual gross unit selling price − gross line discount.
Revenue excluding VAT = gross / (1 + applicable VAT percent / 100).
Variable costs = quantity × (ingredients + packaging + variable labor + payment fee + waste).
Contribution = revenue excluding VAT − variable costs. Only complete input allows the contribution calculation.

Contribution is **not net profit**: rent, fixed salary, corporate taxes, depreciation and other shared overhead are outside this metric. Cart additions, visits, likes, shares and Show Waiter screens are NOT sales. An unsigned customer PCT1 code is not a payment confirmation. The two declared-paid evidence sources (staff_manual and pos_csv) are displayed separately.

## POS import format

Mandatory UTF-8 columns:
order_id,paid_at,item_id,quantity,unit_gross_try,vat_percent

Optional: discount_gross_try,utm_source,utm_medium,utm_campaign,qr.

One row for each line item. Group with order_id; paid_at is ISO-8601 with offset, e.g. 2026-11-12T12:00:00+03:00. Use numeric TRY prices without currency symbols. Blank VAT is permitted, but contribution becomes unknown. Do not include cardholder/customer PII.

## Cost import

Columns: item_id,ingredients,packaging,variableLabor,paymentFee,waste.

Enter actual variable costs per serving in TRY, including takeaway packaging where relevant. Ingredient cost must be entered. Blank non-ingredient fields are treated as zero for the manual pilot; review incomplete information. For fixed combos the sum of component costs is used if there is no direct combo cost. Customized drinks add real plant-milk / syrup cost records.

Both CSV examples in docs are empty header templates; there are **no sample/fake paid sales** in the app.

## Attribution, experimentation and privacy

Example URL: ?utm_source=instagram&utm_medium=social&utm_campaign=brunch&qr=table_04

Values are bounded to short alphanumeric slugs, underscores, dots, or hyphens; avoid names, phone numbers and customer IDs. Attribution reaches staff via the order slip only if copied. Event logging starts **off** and is only stored in the visitor's current device when opted in. Logs are capped to 1000 events, expire at 30 days and are cleared when disabled. Event logging does not imply backend analytics. The deterministic A/B variant helper is present for QA but no experiment/treatment runs on customers without reliable paid-outcome attribution.

## Security and essential production blockers

The public /admin.html page is **not an authenticated owner portal**. Its localStorage belongs to each browser; no company account or cloud sync exists. Do not store confidential costs on shared browsers and back up local records. Cross-device business analytics requires a secure server and owner login, role-based staff permissions, protected cost storage, retention/deletion, and server-validated receipts.

Actual POS connectivity requires the provider/export contract and access granted by the cafe owner. No actual revenue, ingredient cost, tax rate or successful remote payment has been asserted. Evaluate Turkish KVKK obligations and consent before collecting sitewide analytics. Server-side margin-based upsells must not disclose private SKU costs in public browser code. The current noindex SEO restriction should remain until owner approval.

## Release and QA

Node unit tests, Chromium Playwright mobile TR/EN/RU, cart stability, cutaway, share, pairing, profit calculations, opt-in and paid-only controls must pass before merge and GitHub Pages publish. Real-device Android/Safari acceptance plus reconciliation against a sample of POS statements remain required before commercial go-live.

Metric definitions: AOV = declared gross receipts / unique declared-paid order IDs; margin coverage = orders with complete known VAT and variable cost / declared-paid orders. True incremental profit per visitor and A/B lift require server-side paid order reconciliation and cannot be calculated from this browser-local pilot.
