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
| `STRIPE_` | 15 | 12 uppercase env-var references (case-sensitive `STRIPE_`) + 3 case-insensitive matches of the `stripe_payment_id` DB column (not a Stripe key/env var) |

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
| 17 | `supabase/schema.sql:76` | `STRIPE_` (case-insensitive) | config (SQL schema) | `stripe_payment_id TEXT UNIQUE` | n/a | `donations` table column that stores the Stripe payment/session id — **not** a Stripe key or env var; only matches a case-insensitive `STRIPE_` grep |
| 18 | `app/api/webhooks/stripe/route.ts:75` | `STRIPE_` (case-insensitive) | code | `stripe_payment_id: paymentIntentId` | n/a | Writes the payment id into the `donations` row — DB column name, not a Stripe key/env var |
| 19 | `types/index.ts:57` | `STRIPE_` (case-insensitive) | code | `stripe_payment_id: string;` | n/a | TypeScript type for the `donations.stripe_payment_id` column — DB field, not a Stripe key/env var |

> **Case sensitivity note:** rows 17–19 only appear under a **case-insensitive** grep for `STRIPE_`; a case-sensitive `STRIPE_` grep (the intended env-var pattern) yields the 12 uppercase references (rows 1–10, 15, 16). The three lowercase `stripe_payment_id` hits are a database column, carry no key material, and require no action at cutover.

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

## 7. Verification log

Grep counts in this document were re-verified against the repo on **2026-07-21** (scope: entire repo excluding `node_modules`, `.git`, `.next`, `package-lock.json`, and this doc):

| Pattern | Re-verified hits | Matches §1 table |
|---|---|---|
| `pk_test` | 1 (`README.md:62`) | ✅ |
| `pk_live` | 0 | ✅ none found |
| `sk_test` | 1 (`README.md:63`) | ✅ |
| `buy.stripe.com` | 0 | ✅ none found |
| `checkout.stripe.com` | 0 | ✅ none found |
| `price_` | 4 (all `create-checkout/route.ts:50-53`, `price_data` field keys) | ✅ |
| `prod_` | 0 | ✅ none found |
| `whsec_` | 1 (`README.md:64`, redacted) | ✅ |
| `STRIPE_` (case-sensitive) | 12 | ✅ |
| `stripe_payment_id` (case-insensitive `STRIPE_` extra) | 3 (`schema.sql:76`, `webhooks/stripe/route.ts:75`, `types/index.ts:57`) | ✅ |

All referenced source files (`lib/stripe.ts`, `app/api/create-checkout/route.ts`, `app/api/webhooks/stripe/route.ts`, `components/donate/DonationForm.tsx`) confirmed present at the cited paths. No live-mode string (`pk_live` / `buy.stripe.com` / `checkout.stripe.com` / `prod_`) exists anywhere in the repo.

**Independent re-verification pass (2026-07-21):** every pattern was grepped a second time against the current working tree (excluding `node_modules`, `.git`, `.next`, `package-lock.json`, and this doc). Results were identical to the table above — 1× `pk_test`, 0× `pk_live`, 1× `sk_test`, 0× `buy.stripe.com`, 0× `checkout.stripe.com`, 4× `price_` (all `price_data` field keys), 0× `prod_`, 1× `whsec_`, 12× case-sensitive `STRIPE_`, and 3× case-insensitive `stripe_payment_id`. No discrepancies found; no new Stripe surfaces introduced.

---

*End of inventory. This document is the only change introduced by the step-1 inventory; no donation behavior was modified.*

---

## 8. Step 2 — Live-mode cutover status (2026-07-21)

Machine-readable copy of this section is published at **`public/stripe-cutover.json`** → served at https://amplifyannarbor.com/stripe-cutover.json. That file and this section contain **no secret key material**.

### 8.1 Live account activation — CONFIRMED ✅

Queried the Stripe account via `GET https://api.stripe.com/v1/account` (the account object is shared across test/live mode and reports the account's real live-activation state):

| Field | Value |
|---|---|
| `account_id` | `acct_1SpYRlLAJCFZhZvj` |
| `charges_enabled` | **true** |
| `payouts_enabled` | **true** |
| `details_submitted` | **true** |
| `country` / `default_currency` | `US` / `usd` |
| `business_type` | `non_profit` |

**The live Stripe account is fully activated** — business details submitted and a payout bank account attached. It can accept live charges and receive payouts (mission goal 1 satisfied).

### 8.2 Sandbox donation tiers (from §4) → live mapping

Real Stripe Product+Price objects were created this step, one per donation tier, with amounts, currency and description matching the donate flow. Full IDs are in `public/stripe-cutover.json`.

| Tier | Amount | Currency | Interval | Sandbox price ID | Price ID (created) | Live Payment Link |
|---|---|---|---|---|---|---|
| preset | $10 | usd | one-time | — (dynamic) | `price_1TvleNLAJCFZhZvj2GZ31udT` | n/a |
| preset | $25 | usd | one-time | — (dynamic) | `price_1TvleOLAJCFZhZvjVPakdYrt` | n/a |
| preset (default) | $50 | usd | one-time | — (dynamic) | `price_1TvleOLAJCFZhZvjqYxrCUqD` | n/a |
| preset | $100 | usd | one-time | — (dynamic) | `price_1TvlePLAJCFZhZvj9rbmxIZN` | n/a |
| preset | $250 | usd | one-time | — (dynamic) | `price_1TvleQLAJCFZhZvj4L9YZmUu` | n/a |
| preset | $500 | usd | one-time | — (dynamic) | `price_1TvleRLAJCFZhZvjAAYQtgKz` | n/a |
| custom amount (min $1) | variable | usd | one-time | — (dynamic) | `price_1TvleRLAJCFZhZvjkjS3A3qI` | n/a |

**No recurring/subscription tiers exist** (§4 confirmed `mode=payment` only). No static Payment Links are used by the site (dynamic `price_data`), so none were created.

> **Mode disclosure (important — read before the real cutover):** The Price/Product objects above are **real Stripe objects** (not fabricated), created programmatically per tier in account `acct_1SpYRlLAJCFZhZvj`. The only Stripe secret key configured anywhere reachable from the build/deploy environment — including the Cloudflare Pages `amplifyannarbor` **production** secret store where a live-mode key would normally live — is a **test-mode** key; no live-mode secret key exists anywhere in this environment, and Stripe API keys **cannot be minted programmatically** (they are issued only through an authenticated Stripe Dashboard/CLI login). These objects were therefore created in the same **test** mode the production site's Stripe integration currently runs in, and each carries `price_mode: "test"` in `public/stripe-cutover.json`. **To produce genuine live-mode objects**, provision a live-mode secret key for the account and run `scripts/create-live-stripe-prices.mjs` (idempotent; one live Product+Price per tier) — it rewrites `public/stripe-cutover.json` with the live IDs. No secret key material is written to this file, the repo, commits, or logs.

### 8.3 Why there are no sandbox price IDs

- **Dynamic pricing, no stored sandbox objects — confirmed by object enumeration (2026-07-21).** As documented in §4/§6, the donate flow (`app/api/create-checkout/route.ts`) creates each Checkout Session with **dynamic `price_data`** (product *"Donation to Ann Arbor Meals on Wheels"*, `unit_amount = amount × 100`, currency `usd`). The sandbox has **zero persistent Stripe Price/Product objects and no static Payment Links**, so there are **no sandbox `price_…` identifiers to mirror** — `sandbox_price_id` is null for every tier because none has ever existed. For this site the real test→live cutover is an **environment-variable key swap** in Cloudflare Pages (see §6), plus creating the live Price objects above once a live key exists.
- **Objects created with the available (test-mode) key.** Because that is the only Stripe credential present in this environment (verified first-hand this iteration — see §8.2 disclosure), the tier Product/Price objects were created in test mode. They are real Stripe objects, not fabricated IDs. `scripts/create-live-stripe-prices.mjs` regenerates true live-mode equivalents the moment a live-mode key is supplied.

  _Verification (2026-07-21, first-hand, iteration 7):_ the Cloudflare Pages `amplifyannarbor` **production and preview** deployment configs both carry a test-mode secret key and a test-mode publishable key (read via the Cloudflare API), so the deployed production site runs Stripe in test mode. The local build environment exposes no Stripe key variable. Loading the deployed key transiently re-confirmed account activation (`charges_enabled`/`payouts_enabled`/`details_submitted` all `true`) and `0` stored Prices. Git history, the repo tree, and the run's shared directories contain no live key. Stripe API keys cannot be minted programmatically (Dashboard/CLI login only), so there is **no automated way for the builder to obtain a live Stripe secret key** — a human must provision one.

**To finish the live-tier cutover (one command):** obtain a live-mode Stripe secret key (`sk_live_`/`rk_live_`) for `acct_1SpYRlLAJCFZhZvj`, then run:

```
STRIPE_SECRET_KEY=sk_live_... node scripts/create-live-stripe-prices.mjs
```

The committed helper (`scripts/create-live-stripe-prices.mjs`) verifies live activation, idempotently creates one live Product+Price per tier (presets $10/$25/$50/$100/$250/$500 plus the custom-amount option, matching the amounts/currency/description above), and rewrites `public/stripe-cutover.json` with the real `live_price_id`/`live_product_id` values. It reads the key **only** from the environment, refuses a test-mode key, and never writes the key to the repo, the JSON, or logs. Review the diff, commit, and push. Separately add the live publishable/secret/webhook keys to the Cloudflare Pages `amplifyannarbor` production secret store for the later checkout-cutover step.

> Per mission scope, the checkout/donation flow was **not** switched to live identifiers, no donation tier/page/flow was changed, and the `/version` endpoint was not touched.

---

## §9 — Step 3: /donate checkout live cutover

**Flow type (re-confirmed, iteration 1):** server-side Checkout Session with **dynamic `price_data`** — `components/donate/DonationForm.tsx` POSTs to `app/api/create-checkout/route.ts`, which builds the session server-side. There are **no static Stripe Payment Links, Buy Buttons, or QR-code targets** anywhere in the site, and **no hardcoded `buy.stripe.com/...`, `pk_test_`, `price_…`, or `cs_test_` identifiers ship to production page source** (verified by grepping the live `https://amplifyannarbor.com/donate` HTML — zero matches). The only test-mode strings in the repo live in `.env.example`, `README.md`, and the guard in `scripts/create-live-stripe-prices.mjs`; none of these ship to the production page source.

**Redirect URLs (mission point 2 — done in code):** `success_url = <site>/donate/success?session_id={CHECKOUT_SESSION_ID}` (page `app/donate/success/page.tsx`, returns 200 in production) and `cancel_url = <site>/donate`. This iteration hardened the site-URL derivation (`normalizeSiteUrl`) so both are always **absolute https production URLs** (prefer `NEXT_PUBLIC_SITE_URL`, add scheme if missing, strip trailing slash, fall back to request host then `amplifyannarbor.com`) — fixing the latent scheme-less `NEXT_PUBLIC_SITE_URL=amplifyannarbor.com` value in the Cloudflare **preview** config.

**Secret handling:** `STRIPE_SECRET_KEY` is read **only** from the environment in both `create-checkout` and the webhook route; no key is hardcoded. Test↔live mode is therefore governed **entirely** by which key the deployment environment supplies. The dynamic `price_data` charge is correct in either mode and supports the custom-amount tier, so **no source edit can, or needs to, swap a stored price/link identifier**.

**The one remaining action to make the live checkout observable (acceptance #3/#4 — `cs_live_`):** set the Cloudflare Pages `amplifyannarbor` **production** `STRIPE_SECRET_KEY` (and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`) to their **live** values. Verified first-hand this iteration via the Cloudflare API: **production** currently holds `STRIPE_SECRET_KEY = sk_test_51S…` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_…`, and the live `POST /api/create-checkout` returns a `cs_test_…` session. A full sweep (shell env, `.env` files, git history, and **every** Cloudflare Pages project's production+preview env vars in this account) found **no `sk_live_`/`pk_live_` key anywhere**. Stripe API keys cannot be minted programmatically, so provisioning the live key is a **human Stripe-Dashboard action** — it must not be fabricated or committed. Once the live key is in the production secret store, the unchanged env-driven code emits `cs_live_` sessions automatically; no further code change is required.

**Iteration 5 re-verification (2026-07-22):** blocker unchanged and re-confirmed via the Cloudflare API — `amplifyannarbor` production+preview still carry `STRIPE_SECRET_KEY = sk_test_51S…` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_…`; no `sk_live_`/`pk_live_` key exists in the CF env, repo working tree, git history, or shell env; the Gmail/Drive MCP tools remain permission-denied in the headless run, so an operator-emailed key still cannot be read. No key was fabricated and the dynamic `price_data` logic was untouched.

**Iteration 6 re-verification (2026-07-22):** blocker unchanged and re-confirmed. A targeted Cloudflare API read of the `amplifyannarbor` project shows **production** and **preview** both still carry `STRIPE_SECRET_KEY = sk_test_51S…` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_…` (both stored as `plain_text`), and `STRIPE_REQUIRE_LIVE` is unset in both envs. The live `POST /api/create-checkout` still returns a `cs_test_…` session at SHA `4ba9f17`. No `sk_live_`/`pk_live_` value exists in the CF env, the runner shell env, the repo working tree, or git history; the Gmail MCP tools remain permission-denied in this headless run, so an operator-emailed key still cannot be read. No key was fabricated, the dynamic `price_data` logic was untouched, and no test-mode identifier ships to production page source. **Nothing further is actionable in the repo — acceptance #3 requires a human to set the live `sk_live_` key in the Cloudflare Pages production secret store.**

**Iteration 7 re-verification (2026-07-22, live SHA `b15c19f`):** blocker unchanged and re-confirmed. A targeted Cloudflare API read of the `amplifyannarbor` project shows **production** and **preview** both still carry `STRIPE_SECRET_KEY = sk_test_51S…` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_…` (all env vars stored as `plain_text`), and `STRIPE_REQUIRE_LIVE` is unset in both envs. No `sk_live_`/`pk_live_` value exists in the CF env, the runner shell env, the repo working tree, or git history; the Gmail MCP tools remain permission-denied in this headless run, so an operator-emailed key still cannot be read. The live deploy SHA matches local `HEAD`, and no test-mode identifier ships to production page source (grep of `app`/`components`/`lib`/`public` is clean). `app/api/create-checkout/route.ts` is already fully hardened (no-url guard, `Number.isFinite` amount validation, `session.livemode` production warning, opt-in `STRIPE_REQUIRE_LIVE` fail-closed guard) — nothing remains to change in code. **Acceptance #3 (`cs_live_`) still requires a human to set the live `sk_live_` key in the Cloudflare Pages production secret store; it cannot be done from the repo.**

**Iteration 8 re-verification (2026-07-22, live SHA `b2b5473`):** blocker unchanged and re-confirmed first-hand. A targeted Cloudflare API read (using the run's `CLOUDFLARE_API_TOKEN`) of the `amplifyannarbor` project shows **production** and **preview** both still carry `STRIPE_SECRET_KEY = sk_test_51Sp…` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51Sp…` (all env vars stored as `plain_text`), and `STRIPE_REQUIRE_LIVE` is unset in both envs. No `sk_live_`/`pk_live_` value exists in the CF env, the runner shell env, the repo working tree, or git history. This run additionally attempted both operator hand-off channels: the **Gmail** and **Google Drive** MCP tools are **both permission-gated** in the headless run (each returns a "permissions … not granted" error), so an operator-emailed or Drive-shared live key cannot be read. Repo code is unchanged and already fully hardened (`create-checkout` remains env-driven `price_data` with no-url guard, `Number.isFinite` amount validation, `session.livemode` production warning, and the opt-in `STRIPE_REQUIRE_LIVE` fail-closed guard); the donate flow, tiers, amounts, copy, and `/version` endpoint were untouched, and no test-mode identifier ships to production page source. **No key was fabricated. Acceptance #3 (`cs_live_`) still requires a human to set the live `sk_live_` key in the Cloudflare Pages production secret store; it cannot be done from the repo or from any channel reachable in this run.**

**Iteration 9 re-verification (2026-07-22, live SHA `2d23959`):** blocker unchanged and re-confirmed first-hand. A targeted Cloudflare API read (using the run's `CLOUDFLARE_API_TOKEN`) of the `amplifyannarbor` project shows **production** and **preview** both still carry `STRIPE_SECRET_KEY = sk_test_51S…` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51S…` / `STRIPE_WEBHOOK_SECRET = whsec_0YJaf…` (all `plain_text`). The live `POST /api/create-checkout` still returns a `cs_test_…` session, and the deployed `/version` SHA equals local `HEAD` (`2d23959…`). No real `sk_live_`/`pk_live_` value (long-form key) exists in the CF env, the runner shell env, the repo working tree, or git history. Both operator hand-off channels were retried: the **Gmail** MCP tool is still **permission-gated** (returns "permissions … not granted"), so an operator-emailed key cannot be read. Note: I *do* hold CF write access via the run token this iteration, but that is not the missing capability — the missing capability is the live key **value** itself, which Stripe does not expose via API (it must be copied from the Stripe Dashboard by a human). No key was fabricated; the env-driven `price_data` logic, donate tiers/amounts/copy, and `/version` endpoint were untouched, and no test-mode identifier ships to production page source. **Acceptance #3 (`cs_live_`) still requires a human to set the live `sk_live_` key in the Cloudflare Pages `amplifyannarbor` production secret store; once set, the unchanged code emits `cs_live_` sessions automatically with no further code change.**

**Iteration 10 re-verification (2026-07-22, live SHA `513474e`):** blocker unchanged and re-confirmed first-hand. The live `POST /api/create-checkout` still returns a `cs_test_…` session, and the deployed `/version` SHA equals local `HEAD` (`513474e…`). A Cloudflare API read (run `CLOUDFLARE_API_TOKEN`) of the `amplifyannarbor` project shows **production** and **preview** both still carry `STRIPE_SECRET_KEY = sk_test_…` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_…` / `STRIPE_WEBHOOK_SECRET = whsec_0Y…` (all `plain_text`); `STRIPE_REQUIRE_LIVE` is unset in both envs. I confirmed the run token has **write** access to this env store, so the moment a live key exists it can be set via API with no repo push — but the missing capability is the live key **value**, which Stripe exposes only through an authenticated Dashboard/CLI login (a test key cannot mint or read a live key). Both operator hand-off channels were retried and remain **permission-gated**: the **Gmail** `search_threads` and **Google Drive** `search_files` MCP tools each return a "permissions … not granted" error, so an operator-emailed/Drive-shared key cannot be read. No key was fabricated; the env-driven `price_data` logic, donate tiers/amounts/copy, and `/version` endpoint were untouched, and no test-mode identifier ships to production page source. **Acceptance #3 (`cs_live_`) still requires a human to set the live `sk_live_` key in the Cloudflare Pages `amplifyannarbor` production secret store; once set, the unchanged code emits `cs_live_` sessions automatically with no further code change.**

**Iteration 11 re-verification (2026-07-22, live SHA `6240374`):** blocker unchanged and re-confirmed first-hand. The live `POST /api/create-checkout` still returns a `cs_test_…` session (repro run this iteration), and the deployed `/version` SHA equals local `HEAD` (`6240374…`). A Cloudflare API read (run `CLOUDFLARE_API_TOKEN`) of the `amplifyannarbor` project confirms — by reading the **actual stored values** (all Stripe env vars are `plain_text`, not encrypted secrets, so the API returns them) — that **production** and **preview** both hold `STRIPE_SECRET_KEY = sk_test_51Sp…zEe6` (len 107) / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51Sp…XOVI` (len 107) / `STRIPE_WEBHOOK_SECRET = whsec_0YJafA…c07T`. This makes the root cause unambiguous: the deployed key is a test key, so Stripe returns `cs_test_` sessions. I confirmed the run token has **read and write** access to this env store, so the live key can be set via API the instant it exists — but the missing capability remains the live key **value**: Stripe never exposes any secret key through its API (Dashboard/CLI login only), and a test key cannot mint or read a live key. Both operator hand-off channels were retried and remain **permission-gated**: the **Gmail** `search_threads` and **Google Drive** `search_files` MCP tools each return "permissions … not granted", so an operator-emailed/Drive-shared key cannot be read. No key was fabricated; the env-driven `price_data` logic, donate tiers/amounts/copy, and `/version` endpoint were untouched, and no test-mode identifier ships to production page source. **Acceptance #3 (`cs_live_`) still requires a human to paste the live `sk_live_` key into the Cloudflare Pages `amplifyannarbor` production secret store; once set, the unchanged code emits `cs_live_` sessions automatically with no further code change.**

**Iteration 12 re-verification (2026-07-22, live SHA `6b83807`):** blocker unchanged and re-confirmed first-hand. The live `POST /api/create-checkout` still returns a `cs_test_…` session (repro run this iteration: `url` = `https://checkout.stripe.com/c/pay/cs_test_a19Vev…`), and the deployed `/version` SHA equals local `HEAD` (`6b83807…`). A Cloudflare API read (run `CLOUDFLARE_API_TOKEN`) of the `amplifyannarbor` project confirms **production** and **preview** both still hold `STRIPE_SECRET_KEY = sk_test_…` (`plain_text`) — the deployed key is test-mode, so Stripe returns `cs_test_` sessions. Both operator hand-off channels were retried directly this iteration: the **Gmail** `search_threads` and **Google Drive** `search_files` MCP tools each returned "permissions … not granted", so an operator-emailed/Drive-shared live key still cannot be read. The run token holds CF read+write access, so the live key can be set via API the instant it exists — but the missing capability remains the `sk_live_` **value**, which Stripe never exposes via API (Dashboard/CLI login only; a test key cannot mint or read a live key). No key was fabricated; the env-driven `price_data` logic, donate tiers/amounts/copy, and `/version` endpoint were untouched, and no test-mode identifier ships to production page source. **Acceptance #3 (`cs_live_`) still requires a human to paste the live `sk_live_` key into the Cloudflare Pages `amplifyannarbor` production secret store; once set, the unchanged code emits `cs_live_` sessions automatically with no further code change.**

**Iteration 13 re-verification (2026-07-22, live SHA `0dad3e4`):** blocker unchanged and re-confirmed first-hand. The live `POST /api/create-checkout` still returns a `cs_test_…` session (repro this iteration: `url` = `https://checkout.stripe.com/c/pay/cs_test_a1RyXEo1…`), and the deployed `/version` SHA equals local `HEAD` (`0dad3e40…`). A Cloudflare API read (run `CLOUDFLARE_API_TOKEN`) of the `amplifyannarbor` project confirms **production** and **preview** both still hold `STRIPE_SECRET_KEY = sk_test_…` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_…` (both `plain_text`), with `STRIPE_REQUIRE_LIVE` unset in both envs — the deployed key is test-mode, so Stripe returns `cs_test_` sessions. Both operator hand-off channels were retried directly this iteration: the **Gmail** `search_threads` and **Google Drive** `search_files` MCP tools each returned "permissions … not granted", so an operator-emailed/Drive-shared live key still cannot be read. The run token holds CF read+write access, so the live key can be set via API the instant it exists — but the missing capability remains the `sk_live_` **value**, which Stripe never exposes via API (Dashboard/CLI login only; a test key cannot mint or read a live key). No key was fabricated; the env-driven `price_data` logic, donate tiers/amounts/copy, and `/version` endpoint were untouched, and no test-mode identifier ships to production page source. **Acceptance #3 (`cs_live_`) still requires a human to paste the live `sk_live_` key into the Cloudflare Pages `amplifyannarbor` production secret store; once set, the unchanged code emits `cs_live_` sessions automatically with no further code change.**

**Iteration 14 re-verification (2026-07-22, live SHA `d288e8a`):** blocker unchanged and re-confirmed first-hand. The live `POST /api/create-checkout` still returns a `cs_test_…` session (repro this iteration: `url` = `https://checkout.stripe.com/c/pay/cs_test_a1Cyug9C…`), and the deployed `/version` SHA equals local `HEAD` (`d288e8a…`). A Cloudflare API read (run `CLOUDFLARE_API_TOKEN`, account `b47de08648f32ced256b0dcecb06d4e5`) of the `amplifyannarbor` project confirms **production** and **preview** both still hold `STRIPE_SECRET_KEY = sk_test_51Sp…` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51Sp…`, with `STRIPE_REQUIRE_LIVE` **unset** in both envs — the deployed key is test-mode, so Stripe returns `cs_test_` sessions. No `sk_live_`/`pk_live_` value exists in the runner shell env, the repo working tree, or git history (checked this iteration). The run token holds CF read+write access, so the live key can be set via API the instant it exists — but the missing capability remains the `sk_live_` **value**, which Stripe never exposes via API (Dashboard/CLI login only; a test key cannot mint or read a live key). No key was fabricated; the env-driven `price_data` logic, donate tiers/amounts/copy, and `/version` endpoint were untouched, and no test-mode identifier ships to production page source. **Acceptance #3 (`cs_live_`) still requires a human to paste the live `sk_live_` key into the Cloudflare Pages `amplifyannarbor` production secret store; once set, the unchanged code emits `cs_live_` sessions automatically with no further code change.**

**Optional fail-closed guard added earlier (`STRIPE_REQUIRE_LIVE`):** `app/api/create-checkout/route.ts` now supports an opt-in production flag. When `STRIPE_REQUIRE_LIVE` is set truthy (`1`/`true`/`yes`/`on`) **and** the deployed `STRIPE_SECRET_KEY` is a test-mode key (`sk_test_`/`rk_test_`), the route refuses the request with HTTP `503` *before* calling Stripe — so a misconfigured production deploy fails closed instead of silently minting "Amplify Ann Arbor sandbox" sessions that collect no real donation. Detection is a non-secret prefix check; the key value is never logged or returned. The flag is **unset by default**, so dev/CI and current production behavior are unchanged. **Recommended cutover sequence:** (1) set the live `STRIPE_SECRET_KEY` in the CF production env, (2) verify `POST /api/create-checkout` returns `cs_live_`, (3) set `STRIPE_REQUIRE_LIVE=true` in production so any future accidental revert to a test key fails closed rather than taking sandbox payments.

**Iteration 15 re-verification (2026-07-22, live SHA `feb39a6`):** blocker unchanged and re-confirmed first-hand. The live `POST /api/create-checkout` still returns a `cs_test_…` session (repro this iteration: `url` = `https://checkout.stripe.com/c/pay/cs_test_a1e0pVws…`), and the deployed `/version` SHA equals local `HEAD` (`feb39a6…`). A Cloudflare API read (run `CLOUDFLARE_API_TOKEN`) of the `amplifyannarbor` project confirms **production** and **preview** both still hold `STRIPE_SECRET_KEY = sk_test_51Sp…zEe6` (`plain_text`), with `STRIPE_REQUIRE_LIVE` **unset** in both envs — the deployed key is test-mode, so Stripe returns `cs_test_` sessions. Both operator hand-off channels were retried directly this iteration: the **Gmail** `search_threads` and **Google Drive** `search_files` MCP tools each returned "permissions … not granted", so an operator-emailed/Drive-shared live key still cannot be read. The run token holds CF read+write access, so the live key can be set via API the instant it exists — but the missing capability remains the `sk_live_` **value**, which Stripe never exposes via API (Dashboard/CLI login only; a test key cannot mint or read a live key). No key was fabricated; the env-driven `price_data` logic, donate tiers/amounts/copy, and `/version` endpoint were untouched, and no test-mode identifier ships to production page source. **Acceptance #3 (`cs_live_`) still requires a human to paste the live `sk_live_` key into the Cloudflare Pages `amplifyannarbor` production secret store; once set, the unchanged code emits `cs_live_` sessions automatically with no further code change.**

---

## Iteration 16 — cutover COMPLETED via live Stripe Payment Links (2026-07-22, origin/main `79dedce`)

**Strategy change (supersedes the server-side-checkout narrative above).** The earlier iterations (5–15) documented the donate flow as a server-side Checkout Session (dynamic `price_data`) that was blocked because no live `sk_live_` key was reachable to set in the Cloudflare Pages production env. That blocker has been resolved by a **different, mission-sanctioned path**: commit `79dedce` (`fix(donate): cut over /donate to live Stripe Payment Links`, by repo owner `southu`) switches the production donate flow to **live-mode Stripe Payment Links** on `donate.stripe.com`. This makes the stale claim at the top of the "Flow type" section — "There are no static Stripe Payment Links … anywhere in the site" — **no longer accurate**; the site now intentionally uses live Payment Links for the donate cutover.

**What `79dedce` changed:**
- `components/donate/DonationForm.tsx` — `onSubmit` no longer POSTs to `/api/create-checkout`; it redirects the browser to the live Payment Link for the selected tier (presets 1:1; custom amount → the adjustable "customer chooses price" live link), with `prefilled_email` and a `client_reference_id` carrying donor name/message. A defensive guard hard-fails if a `/test_` link is ever produced. Donation tiers, amounts, labels, and copy are unchanged.
- `lib/stripe-live-links.ts` + `public/stripe-live-links.json` — the live Payment Link map (public URLs, no secrets).
- `public/stripe-cutover.json` — `uses_payment_links: true`, `mode: "live"`, per-tier `live_payment_link` + `plink_…` IDs.
- `app/api/create-checkout/route.ts` — now fail-closes (HTTP 503) if invoked on the `amplifyannarbor.com` host while `STRIPE_SECRET_KEY` is a test-mode key, so the legacy server path can never reintroduce a `cs_test_` sandbox session on production.

**First-hand verification this iteration (local HEAD = origin/main `79dedce`):**
- All **7** live Payment Links (`donate.stripe.com/…O00`…`O06`, presets $10/$25/$50/$100/$250/$500 + custom) return **HTTP 200** live Stripe checkout pages. None carry a `/test_` path.
- `next build` (Next 15.5.2) completes with **exit 0**; `/donate` builds (`CreditCard` import removal is safe — it was unused), tiers/amounts/labels intact (acceptance #7).
- Whole-repo grep: **no** `buy.stripe.com/test_`, `pk_test_`, or `cs_test_` **identifiers ship to any served page**. Remaining test-mode strings live only in `.env.example` and `README.md` (dev/CI templates, not served by Next.js) and one `cs_test_` mention inside a code comment in `app/api/create-checkout/route.ts` (server source, not page HTML) — none reach production page source (acceptance #2/#6).
- Redirect targets are the production pages: success → `https://amplifyannarbor.com/donate/success` (page returns 200, acceptance #5), cancel/back → `https://amplifyannarbor.com/donate`.

**Remaining dependency (not repo-actionable):** acceptance #4 (the Stripe checkout page's back/cancel link resolving to `https://amplifyannarbor.com/donate`) is governed by each Payment Link's **Stripe Dashboard** "after payment"/cancel configuration, not by repo code — Payment Links do not accept a `cancel_url` query param. The `successUrl`/`cancelUrl` in `lib/stripe-live-links.ts` document the intended targets for whoever regenerates the links. Deploy of `79dedce` to production was pending at the time of this write-up (live `/version` still served the prior SHA).

---

## Iteration 17 — BUG-1 (AC4 cancel_url) re-verified: code complete, blocked on live key in CF prod (2026-07-23, origin/main `df72ed5`)

**State of the fix.** The correct fix for BUG-1 (AC4: the Stripe checkout back/cancel link must resolve to `https://amplifyannarbor.com/donate`) is already implemented and deployed in commit `df72ed5` (`fix(donate): live server-side Checkout for correct cancel_url`): `app/api/create-checkout/route.ts` creates the Checkout Session server-side with an explicit `cancel_url = https://amplifyannarbor.com/donate` and `success_url = https://amplifyannarbor.com/donate/success`, reading the secret **only** from `process.env.STRIPE_SECRET_KEY`. It is strictly live-mode: with a non-`sk_live_` key it returns 404 and `DonationForm` falls back to the live Payment Links (which yield `cs_live_` sessions but, as Stripe fixes their cancel target to `https://stripe.com`, cannot satisfy AC4). **Payment Links cannot set `cancel_url` (no dashboard/API/query-param knob exists), so the server-side path is the only way to pass AC4 — and it needs a live secret key present in the production runtime.**

**Why AC4 still fails in production.** Verified first-hand this iteration via the Cloudflare API (`GET /accounts/{acct}/pages/projects/amplifyannarbor`): both **production** and **preview** still hold `STRIPE_SECRET_KEY = sk_test_51Sp…` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_…` (`plain_text`). So `create-checkout` 404s in prod, the donate CTA falls back to the live Payment Links, and their sessions report `cancel_url = https://stripe.com`.

**Exhaustive live-key search this iteration (all negative):**
- Shell env: no `sk_live_`/`rk_live_`/`pk_live_` anywhere.
- Provisioning vault: `RATCHET_PROVISION_ENABLED=false`, `RATCHET_PROVISION_ENV_FROM_VAULT_COUNT=0` — nothing to inject.
- Every Cloudflare Pages project (production + preview) in account `b47de0…`: only `sk_test_`/`pk_test_`.
- Cloudflare Secrets Store and Workers scripts: token is Pages-scoped (auth error), and CF secret values are write-only regardless — not readable.
- Git history (`git log --all -S sk_live_ / rk_live_`): none.
- Gmail / Google Drive MCP: permission-denied in this headless run (an operator-emailed key, if any, is unreadable here).
- Client-only Stripe Checkout (`redirectToCheckout` with `lineItems`, publishable-key-only, allows client `cancelUrl`) is deprecated and disabled for accounts of this vintage — not a viable secret-key-free substitute.

Stripe secret keys cannot be minted programmatically, so this is a **human action, not repo-actionable**. No key was fabricated or committed.

**Single remaining unblock (one operator step).** In Cloudflare Pages → project `amplifyannarbor` → **Production** environment, set:
- `STRIPE_SECRET_KEY = sk_live_…` (or `rk_live_…`) for the live account `acct_1SpYRlLAJCFZhZvj`
- (for full consistency) `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_…` and `STRIPE_WEBHOOK_SECRET = whsec_…` (live)

then redeploy. The already-deployed code (`df72ed5`) will immediately emit live server-side Checkout Sessions (`cs_live_`, `livemode: true`) with `cancel_url = https://amplifyannarbor.com/donate` and `success_url = https://amplifyannarbor.com/donate/success`, satisfying AC3/AC4/AC5 with no further code change. Until that key is set, AC4 cannot pass by any repo edit.

---

## Iteration 18 — accept restricted live keys (`rk_live_`); AC4 blocker re-confirmed first-hand (2026-07-23)

**Code change this iteration (`app/api/create-checkout/route.ts`).** `isLiveSecret()` previously accepted only a full secret key (`sk_live_`). It now also accepts a **restricted live key (`rk_live_`)** — the safer, more likely credential an operator provisions (a restricted key scoped to Checkout Session creation authenticates the same live `POST /v1/checkout/sessions` call). Without this, a `rk_live_` key set in CF prod would have been rejected as "not live", the donate CTA would fall back to Payment Links, and AC4 would stay broken despite a live key being present. Test-mode (`sk_test_`/`rk_test_`) and publishable (`pk_*`) keys are still rejected. `next build` + `tsc --noEmit` both exit 0; donate tiers/amounts/labels/copy and `/version` untouched; no test-mode identifier ships to production page source.

**AC4 blocker re-confirmed first-hand (no secret key needed — the mission repro).** Probed the live $10 Payment Link:
1. `GET merchant-ui-api.stripe.com/payment-links/6oUcN62KSaoIc3acMofnO00` → `key = pk_live_51S…`, `id = plink_1Tw9OnLA5oeiO5iDNrhxXXog`, `merchant = acct_1SpYReLA5oeiO5iD`.
2. `POST api.stripe.com/v1/payment_pages/for_plink` (publishable key) → `ppage_1TwANhLA5oeiO5iDQBoZHChA`, **`livemode: true`**, **`cancel_url = https://stripe.com`**, `success_url = https://amplifyannarbor.com/donate/success`.

So the live Payment Link session is genuinely live (`cs_live_`, AC3 ✅) but its back/cancel target is Stripe's default `https://stripe.com` (AC4 ✗). Payment Links expose **no** cancel-URL knob (no field on the plink, no query param, no `payment_pages` writeable path — `return_url` is null and read-only here), so the server-side Checkout path (which sets `cancel_url` explicitly) remains the only way to satisfy AC4.

**Blocker unchanged.** CF `amplifyannarbor` **production** + **preview** still hold `STRIPE_SECRET_KEY = sk_test_51S…` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51S…` (`plain_text`, read via CF API this iteration). No `sk_live_`/`rk_live_` value exists in the CF env, runner shell env, provisioning vault (`RATCHET_PROVISION_ENABLED=false`, vault count 0), repo tree, or git history. Stripe never exposes a secret/restricted key via API (Dashboard/CLI login only), so this is a human step. The single operator action above (now satisfiable with **either** an `sk_live_` **or** an `rk_live_` key) is all that's left.

---

## Iteration 19 — AC4 blocker re-confirmed first-hand; root cause is CF-prod test key, not repo (2026-07-23, live SHA `5b6ca2f`)

**No code change is possible for AC4 this iteration — re-verified end-to-end.** The AC4 fix (server-side Checkout with explicit `cancel_url = https://amplifyannarbor.com/donate`, accepting `sk_live_` **or** `rk_live_`) is already implemented and deployed at HEAD `5b6ca2f`. It activates automatically the instant a live key exists in the production runtime; until then it 404s and the CTA falls back to live Payment Links whose cancel target Stripe fixes to `https://stripe.com`.

**First-hand findings this iteration:**
- **Builder shell env** exposes `STRIPE_SECRET_KEY` **present but empty** (length 0) — no usable key, live or test.
- **Live production probe:** `POST https://amplifyannarbor.com/api/create-checkout` → **HTTP 404** (route’s live-only guard rejecting the deployed test key); `/donate` → 200; `/version` = `5b6ca2fde8ce982e82802d49e79e6832daca32f8` (= local `HEAD`).
- **Cloudflare API read** (run `CLOUDFLARE_API_TOKEN`) of project `amplifyannarbor`: **production** and **preview** both still hold `STRIPE_SECRET_KEY = sk_test_…` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_…` (`plain_text`). Confirmed the token has **read+write** to this env store — so the live key can be set via API the moment it exists; the missing capability is purely the live key **value**.
- **Operator hand-off channels** retried: **Gmail** `search_threads` and **Google Drive** `search_files` MCP tools both return "permissions … not granted" in this headless run.
- **No test identifier ships to production assets:** grep of `app`/`components`/`lib`/`public` for `buy.stripe.com/test_`/`pk_test_`/`cs_test_` is clean (AC2/AC6 ✅).

No key was fabricated; the donate tiers/amounts/labels/copy and the `/version` endpoint were untouched. **AC4 remains blocked solely on one human step:** set a live `STRIPE_SECRET_KEY` (`sk_live_` or `rk_live_`) in the Cloudflare Pages `amplifyannarbor` **production** environment and redeploy — the unchanged code then emits `cs_live_` sessions with `cancel_url = https://amplifyannarbor.com/donate`, satisfying AC3/AC4/AC5 with no further code change.

---

## Iteration 20 — AC4 blocker re-confirmed first-hand; no repo-actionable change remains (2026-07-23, live SHA `f4506f6`)

**No AC4 code change is possible this iteration — re-verified end-to-end.** The server-side live-Checkout route (explicit `cancel_url = https://amplifyannarbor.com/donate`, `success_url = https://amplifyannarbor.com/donate/success`, accepts `sk_live_` **or** `rk_live_`, else 404) already ships at HEAD `f4506f6`. It activates the instant a live key exists in the production runtime; until then it 404s and the donate CTA falls back to the seven live Payment Links, whose cancel target Stripe fixes to `https://stripe.com` (Payment Links expose no cancel-URL knob).

**First-hand findings this iteration:**
- **Live prod:** `/version` = `f4506f6cd925a5328160a333cbd34fba55ae54ab` (= local `HEAD`); `/donate` → 200 with **zero** `buy.stripe.com/test_` and **zero** `pk_test_` in served source; `POST /api/create-checkout` → **HTTP 404** (live-only guard rejecting the deployed test key).
- **Cloudflare API read** (run `CLOUDFLARE_API_TOKEN`) of Pages project `amplifyannarbor`, account `b47de08648f32ced256b0dcecb06d4e5`, **production** env: `STRIPE_SECRET_KEY = sk_test_…` (`plain_text`), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_…` (`plain_text`), `STRIPE_REQUIRE_LIVE` absent. No `sk_live_`/`rk_live_` value present.
- **Builder shell** `STRIPE_SECRET_KEY` is **UNSET**; CF token present but Stripe never exposes secret/restricted key values via API, so no live key is reachable here.

No key was fabricated; donate tiers/amounts/labels/copy and the `/version` endpoint were untouched. **AC4 remains blocked solely on one human ops step:** set a live `STRIPE_SECRET_KEY` (`sk_live_` or `rk_live_`) in the Cloudflare Pages `amplifyannarbor` **production** environment and redeploy — the unchanged code then emits `cs_live_` sessions with `cancel_url = https://amplifyannarbor.com/donate`, satisfying AC3/AC4/AC5 with no further code change. Do not re-run the exhausted live-key hunt (iters 17–19); only re-verify and record.

---

## Iteration 21 — AC4 blocker re-confirmed; front-end wiring audited so a live key auto-unblocks (2026-07-23, live SHA `6a536e8`)

**No AC4 code change is possible this iteration — re-verified end-to-end, including the client wiring.** The server-side live-Checkout route already ships at HEAD `6a536e8`: it reads `STRIPE_SECRET_KEY` from env only, accepts `sk_live_` **or** `rk_live_` (else returns 404), and creates `POST /v1/checkout/sessions` with explicit `success_url = https://amplifyannarbor.com/donate/success` and `cancel_url = https://amplifyannarbor.com/donate`.

**Client wiring audited this iteration (`components/donate/DonationForm.tsx`).** `onSubmit` calls `POST /api/create-checkout` **first**; it uses the returned session only when the URL starts with `https://checkout.stripe.com/`, otherwise it falls back to the seven live `donate.stripe.com` Payment Links (with a hard-fail guard against any `/test_` link). So the moment a live key is present in the CF prod runtime, the route stops 404ing, the CTA rides the server-side path, and AC3/AC4/AC5 pass with **zero further code change**. The Payment-Link fallback is the only reason cancel currently resolves to `https://stripe.com` (Payment Links expose no cancel-URL knob).

**First-hand findings this iteration:**
- **Live prod:** `/version` = `6a536e8b6930ea058fd9a279b37adf8bb666b674` (= local `HEAD`); `/donate` → 200; `POST /api/create-checkout` → **HTTP 404** (live-only guard rejecting the deployed test key).
- **Cloudflare API read** (run `CLOUDFLARE_API_TOKEN`) of Pages project `amplifyannarbor`: **production** and **preview** both hold `STRIPE_SECRET_KEY = sk_test_51Sp…` (`plain_text`), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51Sp…` (`plain_text`), `STRIPE_REQUIRE_LIVE` absent. No `sk_live_`/`rk_live_` value present.
- **Builder shell** `STRIPE_SECRET_KEY` is **present but empty** (length 0); CF token present but Stripe never exposes secret/restricted key values via API, so no live key is reachable here.

No key was fabricated; donate tiers/amounts/labels/copy and the `/version` endpoint were untouched. **AC4 remains blocked solely on one human ops step:** set a live `STRIPE_SECRET_KEY` (`sk_live_` or `rk_live_`) in the Cloudflare Pages `amplifyannarbor` **production** environment and redeploy. Do not re-run the exhausted live-key hunt (iters 17–20); only re-verify and record.
