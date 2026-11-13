# Private owner workspace — 12 November 2026

This optional Node server is separate from the public GitHub Pages menu. It runs
on **127.0.0.1 only**. The password, costs and receipts must never be committed or
copied into `dist`. Public `/admin.html` remains an explicitly labelled browser-local pilot.

## Start on the owner's computer

Use Node 20.19+ or 22. From the repository directory in PowerShell:

```powershell
$ownerSecret = Read-Host 'Owner password (32 characters minimum)' -AsSecureString
$env:POCITEL_OWNER_PASSWORD = [System.Net.NetworkCredential]::new('', $ownerSecret).Password
try { node server/owner-server.mjs } finally { Remove-Item Env:POCITEL_OWNER_PASSWORD }
```

Open `http://127.0.0.1:8090`, username `owner`, with that password. Stop with Ctrl+C.
Do not pass the password on the command line, in a URL, in screenshots or chat.
The default data directory is `.private`, ignored by Git. A separate private
directory can be set through `POCITEL_PRIVATE_DIR`; it must be outside `dist`.
Use a device account restricted to the owner, disk encryption and secure backups.
HTTP Basic credentials are suitable here only because access is loopback-only;
this server deliberately offers no remote listen mode.

## Workflow and evidence

1. Paste a visitor's unsigned PCT1 code and confirm the **order**. No revenue is counted.
2. Only after checking actual payment, select the confirmed order, enter known
   VAT (or leave unknown), and explicitly confirm receipt of its full quoted amount.
   If the amount differs, import the real POS receipt instead of using this shortcut.
3. Import the POS export using `docs/pos-import-template.csv`. Exact imports are
   idempotent; matching receipt IDs can upgrade manual declarations to POS CSV.
   Conflicting amounts/SKUs/tax or timestamps abort the import without modifying disk.
4. Import validated per-portion costs using `docs/cost-import-template.csv`.
   Every variable expense needs an explicit number, including `0` where verified.
   Blank fields mean **unknown**, so contribution remains unavailable.
   Takeaway SKUs require serving-specific costs; cafe packaging is not reused.
   The protected importer also accepts valid full configured/combo SKU IDs for
   direct recipes when component or packaging costs cannot safely be inferred.
5. Download the private JSON backup and store it securely. Restarting the server
   restores its saved ledger. Do not upload real business backups into this public repo.

The server has one owner role. It does not claim online payment verification,
POS API integration, a staffed cloud service, staff-specific audit trails or
sitewide visitor conversion. `pos_csv` means owner-imported, not POS-authenticated.
Different draft and POS receipt IDs require manual reconciliation outside this
pilot; never merge receipts merely because amounts match. Refunds, voids,
partial payments, amendments and historical cost snapshots are not supported:
reconcile those periods in the POS before using these totals for decisions.
The report is current-cost contribution, not net profit or historical accounting.

## Access and storage boundary

All pages, exports and APIs require owner authentication. Responses are `no-store`
and `noindex`, with framing disabled and a restrictive content policy. Writes
require same-origin requests, JSON and an explicit custom header. Host checks
reject DNS rebinding. Failed sign-in attempts are rate-limited. Imports are
limited to 2 MB, and writes are serialized and replace the ledger atomically.
A process lock prevents two running servers from sharing a ledger. After an
unclean process crash, verify that no server is using the directory before
removing its stale `owner.lock`. This is a single-machine pilot, not an HA database.

## Commercial launch dependencies

- Owner-approved POS provider/export, SKU mapping, receipt ID mapping and reconciliation process.
- Actual ingredient, packaging, labour, fee and waste costs, applicable VAT and period.
- An approved HTTPS host, private persistent storage, identity provider, separate
  staff permissions, recovery/backup policy and operational owner before remote access.
- Verified analytics collection endpoint and consent/retention design before sitewide reporting.
- Named feedback recipient before enabling remote customer messages. Current help
  lets visitors show a selected question to staff and explicitly sends nothing.
- Real Android and iPhone/Safari acceptance. Playwright WebKit is not an iPhone test.
- Owner approval before changing `noindex` or starting SEO promotion.

## Browser-local cost migration

The earlier pilot silently filled blank cost fields with zero. New browser costs
use `pocitel-admin-costs-v2`; old v1 records are retained but excluded from reports.
Re-enter or import actual costs after verifying each expense. No historical
zero is automatically accepted as a verified absence of expense. Orders retain
their existing key and are not discarded. No real receipts or costs were added
by this implementation; all test receipts are synthetic and isolated.
