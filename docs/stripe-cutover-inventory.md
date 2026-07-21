# Stripe Cutover Inventory

**Repository:** `southu/amplifyannarbor` (Next.js on Cloudflare Pages, live at https://amplifyannarbor.com)
**Generated:** 2026-07-21
**Purpose:** Complete, checked-in inventory of every Stripe touchpoint in the repo, produced as a read-and-document step ahead of a planned test-mode → live-mode Stripe cutover. **No donation behavior, payment link, key, or checkout code was modified by this step** — the only repo change is this document.

> **Secret-handling note:** No full secret values appear in this document. Any `sk_*` or `whsec_*` reference is recorded only in redacted form. The repo itself contains **no real secret values** — only placeholder templates (e.g. `sk_test_...`); real keys live in Cloudflare Pages / Supabase environment variables, not in source.

---

## 1. Pattern grep results (all nine required patterns)

Search scope: entire repo (source, config, content, `public/` assets, scripts, SQL, docs), excluding `node_modules`, `.git`, `.next`, and `package-lock.json`.

| Pattern | Hits | Summary |
|---|---|---|
| `pk_test` | 1 | Placeholder in README env template (test mode) |
| `pk_live` | 0 | **none found** |
| `sk_test` | 1 | Redacted placeholder in README env template (test mode) |
| `buy.stripe.com` | 0 | **none found** |
| `checkout.stripe.com` | 0 | **none found** |
| `price_` | 4 | Stripe API `price_data` form field keys (dynamic pricing, not a Stripe Price ID) |
| `prod_` | 0 | **none found** |
| `whsec_` | 1 | Redacted placeholder in README env template |
| `STRIPE_` | 12 | Env-var references in code + config templates |

---

## 2. Full reference table (file:line)

Every Stripe reference in the repo, with matched pattern, surface type, and test / live / unknown classification.

| # | File:Line | Matched pattern(s) | Surface type | Value (redacted) | Classification | Notes |
|---|---|---|---|---|---|---|
| 1 | `README.md:62` | `pk_test`, `STRIPE_` | config (env template) | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` | **test** | Placeholder only; `pk_test` prefix ⇒ test mode |
| 2 | `README.md:63` | `sk_test`, `STRIPE_` | config (env template) | `STRIPE_SECRET_KEY=sk_test_...` (redacted) | **test** | Placeholder only; `sk_test` prefix ⇒ test mode. No real secret present |
| 3 | `README.md:64` | `whsec_`, `STRIPE_` | config (env template) | `STRIPE_WEBHOOK_SECRET=whsec_...` (redacted) | **unknown** | `whsec_` prefix is mode-agnostic; placeholder only. No real secret present |
| 4 | `CURSOR_HANDOFF.md:67` | `STRIPE_` | config (env template) | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=` (empty) | **unknown** | Handoff doc env checklist; no value assigned |
| 5 | `CURSOR_HANDOFF.md:68` | `STRIPE_` | config (env template) | `STRIPE_SECRET_KEY=` (empty) | **unknown** | Handoff doc env checklist; no value assigned |
| 6 | `CURSOR_HANDOFF.md:69` | `STRIPE_` | config (env template) | `STRIPE_WEBHOOK_SECRET=` (empty) | **unknown** | Handoff doc env checklist; no value assigned |
| 7 | `lib/stripe.ts:8` | `STRIPE_` | code | `process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!` | **unknown** | Reads client key from env at runtime; mode determined by deployed env value |
| 8 | `lib/stripe.ts:15` | `STRIPE_` | code | `process.env.STRIPE_SECRET_KEY!` | **unknown** | Reads server secret from env at runtime; mode determined by deployed env value |
| 9 | `app/api/create-checkout/route.ts:24` | `STRIPE_` | code | `const stripeSecretKey = process.env.STRIPE_SECRET_KEY` | **unknown** | Reads server secret from env; used to call Stripe API |
| 10 | `app/api/create-checkout/route.ts:26` | `STRIPE_` | code | `console.error("STRIPE_SECRET_KEY is not configured")` | n/a | Log string only (references the env var name) |
| 11 | `app/api/create-checkout/route.ts:50` | `price_` | code | `"line_items[0][price_data][currency]": "usd"` | n/a | Stripe API form-field key `price_data` — **not** a Stripe Price ID (`price_...`) |
| 12 | `app/api/create-checkout/route.ts:51` | `price_` | code | `"line_items[0][price_data][unit_amount]": ...` | n/a | Dynamic per-donation amount; `price_data` field key |
| 13 | `app/api/create-checkout/route.ts:52` | `price_` | code | `"line_items[0][price_data][product_data][name]": ...` | n/a | Inline product name; `price_data` field key |
| 14 | `app/api/create-checkout/route.ts:53` | `price_` | code | `"line_items[0][price_data][product_data][description]": ...` | n/a | Inline product description; `price_data` field key |
| 15 | `app/api/webhooks/stripe/route.ts:18` | `STRIPE_` | code | `new Stripe(process.env.STRIPE_SECRET_KEY!, ...)` | **unknown** | Instantiates Stripe SDK from env secret; mode follows deployed env value |
| 16 | `app/api/webhooks/stripe/route.ts:21` | `STRIPE_` | code | `process.env.STRIPE_WEBHOOK_SECRET!` (redacted) | **unknown** | Reads webhook signing secret from env |

### Additional Stripe touchpoints not captured by the nine literal patterns

These are real Stripe surfaces that do not match any of the nine grep strings but are relevant to the cutover:

| File:Line | Surface type | Detail | Classification |
|---|---|---|---|
| `app/api/create-checkout/route.ts:39` | code | `fetch("https://api.stripe.com/v1/checkout/sessions", ...)` — the live Checkout Session creation call (edge-runtime, raw REST) | **unknown** (mode = whichever `STRIPE_SECRET_KEY` is deployed) |
| `lib/stripe.ts:1-2` | code | Imports `@stripe/stripe-js` (`loadStripe`) and server `stripe` SDK | n/a |
| `lib/stripe.ts:16`, `app/api/webhooks/stripe/route.ts:19` | code | Stripe API version pinned to `2025-12-15.clover` | n/a |
| `package.json:16-17,30` | config | Dependencies: `@stripe/react-stripe-js ^5.4.1`, `@stripe/stripe-js ^8.6.1`, `stripe ^20.1.2` | n/a |

> Note: `lib/stripe.ts` exports `getStripe()` / `getStripeServer()` helpers, but they are **not imported anywhere** in the current codebase. The live donate flow uses the raw `fetch` in `create-checkout/route.ts` instead. These helpers are latent/unused code.

---

## 3. Mode classification summary

- **Live-mode references (`pk_live` / live payment links):** **none found.** No `pk_live`, `buy.stripe.com`, or `checkout.stripe.com` string exists anywhere in the repo.
- **Test-mode references:** the README env template (rows 1–2) documents `pk_test_...` / `sk_test_...`, indicating the project's documented/reference configuration is **test mode**.
- **Unknown-mode references:** all runtime code reads keys from environment variables (`process.env.*`), so the *actual* live/test mode is determined entirely by the values configured in the Cloudflare Pages (and Supabase, for the webhook) environment — **not** by anything in source. These cannot be classified from the repo strings alone and are marked **unknown**.

**Implication for cutover:** because keys are 100% env-driven, the test→live cutover is an environment-variable change in the deployment platform (swap `pk_test_*`/`sk_test_*`/test `whsec_*` for `pk_live_*`/`sk_live_*`/live `whsec_*`). **No source code edit is required** to change modes.

---

## 4. Donate-flow architecture

**Architecture: server-side Checkout Session creation (dynamic), via a Next.js edge API route.**

- **NOT** static Stripe Payment Links (`buy.stripe.com` / `checkout.stripe.com`): none found.
- **NOT** embedded Stripe Buy Buttons: none found.
- **IS** server-side Checkout Session creation: **yes.**

### Flow

1. **UI:** `components/donate/DonationForm.tsx` renders the donation form (amount presets, custom amount, name/email/message).
2. **Submit:** on submit it `POST`s JSON `{ amount, name, email, message }` to the internal route `/api/create-checkout` (`DonationForm.tsx:58`).
3. **Session creation:** `app/api/create-checkout/route.ts` (edge runtime) reads `STRIPE_SECRET_KEY` from env and calls `POST https://api.stripe.com/v1/checkout/sessions` with `mode=payment`, dynamic `price_data` (currency `usd`, `unit_amount = amount × 100`), product name *"Donation to Ann Arbor Meals on Wheels"*, and donor metadata. Returns the Stripe-hosted `session.url`.
4. **Redirect:** the client redirects the browser to `session.url` (`DonationForm.tsx:75`) — the Stripe-hosted Checkout page.
5. **Success:** `success_url` → `/donate/success?session_id={CHECKOUT_SESSION_ID}`; `cancel_url` → `/donate`.
6. **Fulfillment:** `app/api/webhooks/stripe/route.ts` (edge runtime) verifies the `stripe-signature` using `STRIPE_WEBHOOK_SECRET`, and on `checkout.session.completed` inserts the donation into Supabase (`donations` table); if `metadata.type === "ticket"`, also creates a `tickets` row. Handles `payment_intent.payment_failed` (logs only).

### Donation tiers offered

| Tier type | Values | Source |
|---|---|---|
| **One-time preset amounts** | **$10, $25, $50, $100, $250, $500** | `DonationForm.tsx:23` (`presetAmounts`) — default selected: **$50** (`DonationForm.tsx:27`) |
| **Custom amount** | **Yes** — free-entry, minimum **$1** | `DonationForm.tsx:129-145`; validated `amount ≥ 1` in both the form schema (`DonationForm.tsx:15`) and the API route (`create-checkout/route.ts:10`) |
| **Recurring / subscription** | **None** — one-time only | Session created with `mode=payment` (`create-checkout/route.ts:46`); no `mode=subscription`, no recurring prices anywhere |

> "Impact" copy on the donate page (`app/donate/page.tsx:12-33`, $10/$50/$100/$500) and event-admission copy (donate-at-the-door on July 30th at The Blind Pig) are informational only — not separate Stripe products.

---

## 5. Lesser-known surfaces audit

| Surface | Present? | Detail |
|---|---|---|
| **Embedded Stripe Buy Buttons** (`stripe-buy-button` / `buy-button` script tags) | **Not present** | Grep for `buy-button` / `stripe-buy` / `buy_button` returns zero hits. |
| **Donation QR codes** (image targets / encoded URLs) | **Not present as a live donation surface** | No QR image files exist in `public/` (only `favicon.svg`). The `qrcode` npm package (`package.json:24`) and `@types/qrcode` (`package.json:19`) are dependencies but are **not imported or used** anywhere in `app/`, `components/`, `lib/`, or `scripts/`. A `qr_code TEXT` column exists in the `tickets` table (`supabase/schema.sql:90`) and its TypeScript type (`types/index.ts:70`), intended for *event ticket* QR codes — **not** donation/payment QR codes — and `CURSOR_HANDOFF.md:56` explicitly lists ticket-QR email as **not yet built**. No QR encodes a Stripe URL. |
| **Footer links** | **Present, internal only** | `components/Footer.tsx:12` links **"Donate" → `/donate`** (internal route). No footer link points to a Stripe URL. |
| **Nav / header links** | **Present, internal only** | `components/Header.tsx:58` and `:105` link **"Donate" → `/donate`** (desktop + mobile). Other internal "Donate" CTAs: `app/page.tsx:67,232`, `app/about/page.tsx:224`, `app/events/page.tsx:123,269`, `app/merch/page.tsx:200`. None point to a Stripe URL — all route to the internal `/donate` page. |
| **Email templates / transactional mail** | **Not present** | No email/transactional-mail code exists: grep for `resend` / `sendgrid` / `nodemailer` / `mailgun` returns zero hits. `CURSOR_HANDOFF.md:56` confirms *"Email notifications — Ticket QR codes, donation receipts not set up."* Stripe Checkout's own hosted receipt emails (if enabled in the Stripe Dashboard) are the only email path, and are not represented in the repo. The one external link found — `app/donate/success/page.tsx:77` — is a Twitter/X share intent, not an email and not a payment link. |

---

## 6. Cutover-relevant summary

- **Static Payment Links / Buy Buttons / hardcoded `pk_live`/`price_`/`prod_` IDs:** none — nothing to swap in source.
- **What controls test vs live:** three environment variables only — `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (plus the webhook endpoint registration in the Stripe Dashboard). Cutover = update these env values in Cloudflare Pages and re-point/re-create the live webhook signing secret.
- **Code paths that must work post-cutover:** `app/api/create-checkout/route.ts` (session creation), `app/api/webhooks/stripe/route.ts` (fulfillment + Supabase write), `components/donate/DonationForm.tsx` (UI/redirect).
- **Stripe CLI reference for inspecting resources:** https://docs.stripe.com/projects

---

*End of inventory. This document is the only change introduced by this step; no donation behavior was modified.*
