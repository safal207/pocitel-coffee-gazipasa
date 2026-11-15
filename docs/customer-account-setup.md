# Poçitel: customer preferences and real sign-in

This release provides a working guest preference panel. It stores four allowlisted
choices in this browser: drink, milk, syrup and serving. The user's explicit
"choose my drink" action opens the existing configurator with those choices;
options, prices and availability must still be reviewed before adding. No contact
details, dietary/medical notes, account, paid order or marketing subscription are
created by saving device preferences. Bookmarked dishes remain on-device in their
existing storage; they are not uploaded by this release.

## Current deployment boundary

`dist/account-config.js` deliberately exports `null`. No Poçitel Auth project was
available among connected projects during implementation. No unrelated project
was reused, no project/paid messaging service was created, and no OAuth credential
or private data is present in the public repository. The published panel clearly
says cross-device sign-in is not available yet and does not collect an email or
phone number. Do not call this a working registration launch.

The official `@supabase/supabase-js` 2.119.0 browser client is copied from the
locked npm dependency into `dist/vendor` by the build. It is loaded locally only
when a reviewed cloud configuration is enabled. Tooling/CI uses Node 22; the
browser client is not a hand-written OAuth/session implementation. There is no
remote CDN, advertising pixel or identity request on the guest path.

## Recommended launch order

1. **Google + email**: use a dedicated Poçitel Supabase Auth project, with Google
   OAuth credentials and production SMTP. Use email codes or the verified email
   link; customize the email template to include `{{ .Token }}` when offering a
   code. Configure rate limits and CAPTCHA/abuse protection appropriate to the
   provider and verify recovery/delivery. Passwords are not collected by this UI.
2. **Telegram**: Telegram supports OIDC Authorization Code + PKCE. It requires a
   Poçitel bot, registered allowed URLs, client credentials and a compatible
   server/broker with verified issuer, audience, signature, expiry and nonce.
   It is not a built-in provider invented by this release. There is no Telegram
   sign-in button until that integration is implemented and tested.
3. **WhatsApp**: the prepared adapter supports Supabase phone OTP using the
   `whatsapp` channel, backed by Twilio/Twilio Verify. Enable only after sender,
   templates, delivery, rate limits and messaging costs have been reviewed. A
   `wa.me` contact link is not identity verification.
4. **Instagram**: retain the actual café profile as a contact channel. Meta's
   Instagram Login API targets professional business/creator accounts and is
   not a general customer sign-in for everyone visiting a café.

## Concrete setup and release gate

1. Choose/create the dedicated project with an approved region and cost. Obtain
   the café operator's reviewed privacy notice, contact/deletion process and
   processing/retention decisions. Do not activate just by changing a boolean.
2. Apply `server/customer-preferences-schema.sql` to that project. It is a schema
   template, not an already-run migration. Record it using the project's normal
   migration workflow and run database security advisors.
3. With two real test users, prove A cannot read, update, replace ownership or
   delete B's row; anonymous access must fail. Prove invalid/extra JSON fields
   are rejected. These database checks have **not** been run against a live
   database in this release.
4. Configure the exact menu root as Site URL and redirect allowlist. Google
   must return to the project's `/auth/v1/callback`; the SDK's PKCE callback
   returns to the menu root with `account=1`. No arbitrary `next=` is honored.
   Publishable keys go in public config; provider secrets stay in Auth settings.
5. Add reviewed public configuration in `dist/account-config.js`:

   ```js
   export const accountConfig = {
     url: 'https://PROJECT_REF.supabase.co',
     publishableKey: 'sb_publishable_REPLACE_WITH_PUBLIC_KEY',
     privacyReviewed: true,
     providers: { google: true, email: true, whatsapp: false },
   };
   ```

   This is an example, not an active project. The runtime rejects secret/legacy
   JWT keys and unreviewed configurations. Only configured methods appear.
6. Verify Google callback and real email/WhatsApp delivery on the public HTTPS
   domain; wrong/expired codes, cancellation, sign-out, provider outage and
   reload must not create an authenticated success state. No real message was
   sent by the implementation tests. In-app browsers may need an external
   browser for Google sign-in; include this in device acceptance.
7. Verify explicit account upload/load/delete, conflict behavior and shared-device
   behavior. Sign-in alone does not upload preferences. Loading account data is
   explicit and overwrites only the four device preferences; it does not change
   the cart. "Delete account preferences" deletes this row, not the Auth identity.
   A full identity-deletion endpoint/operator process remains a release dependency.
8. Keep promotions separate: no implicit marketing opt-in from sign-in or from
   sharing a verified phone/email. Add channels and consent history only when
   the café has an approved operational process.

Use the Auth user UUID as the account identity across providers. Link an extra
provider only from an authenticated session through the Auth provider's verified
identity-link flow; never merge accounts just because a visitor typed the same
email, phone number or Instagram handle. Identity linking and a cloud bookmark
library are subsequent work, not features of the guest preference panel.

## Sources checked for this implementation

- [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
- [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase phone / WhatsApp sign-in](https://supabase.com/docs/guides/auth/phone-login)
- [Telegram Login and OIDC](https://core.telegram.org/bots/telegram-login)
- [Meta Instagram API with Instagram Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login)

No claim of production registration, verified customer accounts, marketing lift
or cross-device preferences is made until the above gate is completed.
