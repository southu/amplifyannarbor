# Stripe test → live cutover runbook

Operational runbook for the Amplify Ann Arbor (<https://amplifyannarbor.com>) donate
pipeline: how the live cutover is performed, where live vs. test keys live (**names and
store locations only — never key values**), how to roll back to Stripe test/sandbox mode
for local development, where to attach the operator's dashboard screenshots, and how to
drive the Stripe CLI.

> **Secret-handling rule (applies to this whole document):** No real key value ever
> appears here or anywhere in the repo. Only environment-variable **names** and the
> **locations** of the secret stores are recorded. The repo tree contains no `sk_live`,
> `rk_live`, or `sk_test` value — only placeholder templates. Verify with:
> `git grep -nE 'sk_live|rk_live'` → must return zero matches.

---

## 1. Where the keys live (names and locations only)

| Purpose | Env var name | Where it lives in production | Where it lives for local dev |
|---|---|---|---|
| Server-side secret key | `STRIPE_SECRET_KEY` | Cloudflare Pages → project `amplifyannarbor` → **Production** environment → encrypted secret (`secret_text`) | `.env.local` (git-ignored), **test key only** |
| Client publishable key | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Cloudflare Pages → `amplifyannarbor` → Production env var (`plain_text`; public by nature) | `.env.local`, **test key only** |
| Webhook signing secret | `STRIPE_WEBHOOK_SECRET` | Cloudflare Pages → `amplifyannarbor` → Production → encrypted secret | `.env.local` (from `stripe listen`, test mode) |

Optional/companion names consumed by the ops scripts when a cutover is staged from a
CI/operator shell (never committed, never printed): `STRIPE_LIVE_SECRET_KEY`,
`STRIPE_LIVE_PUBLISHABLE_KEY`, `STRIPE_LIVE_WEBHOOK_SECRET`, plus the Cloudflare API
credentials `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

**Source of truth for the live key at cutover time:** the operator's secret store
(Ratchet Vault / the equivalent secret manager). The live key is injected into the
cutover shell's environment from there; it is **never** taken from this mission text, the
repo, `TESTLOG.md`, or any commit. If the store does not surface the live key to the
runtime environment, the cutover **fails closed** — see §6.

Code that reads these names:

- `lib/stripe-server.ts` → `new StripeServer(process.env.STRIPE_SECRET_KEY!)`
- `app/api/create-checkout/route.ts` → live-only server Checkout Session
  (`success_url = /donate/success`, `cancel_url = /donate`)
- `app/api/webhooks/stripe/route.ts` → `/api/webhooks/stripe`, verifies the
  `stripe-signature` header with `STRIPE_WEBHOOK_SECRET` via async Web Crypto
  (`constructEventAsync`), and rejects unsigned/invalid requests with a 4xx
- `app/api/stripe/webhook-health/route.ts` → `/api/stripe/webhook-health` config probe

### Webhook signing secret — must match the live endpoint

`STRIPE_WEBHOOK_SECRET` in Cloudflare Pages **production** must equal the signing
secret of the live webhook endpoint registered at
`https://amplifyannarbor.com/api/webhooks/stripe`. The app verifies every
delivery's `stripe-signature` against this value; if they differ, Stripe's
deliveries fail signature verification (HTTP 400) and `event.pending_webhooks`
never clears — even though checkout itself still works.

A webhook endpoint's signing secret is shown **only once**, at creation. It is
not retrievable afterward (the `webhook_endpoints` retrieve API omits `secret`,
update rejects a `secret` parameter, and there is no `roll_secret` API). So the
sync is one-directional and must be performed by whoever creates/rolls the
endpoint:

1. In the Stripe Dashboard (live mode), create the endpoint (or **roll** its
   signing secret) and copy the shown `whsec_…` value.
2. Set Cloudflare Pages → `amplifyannarbor` → **Production** →
   `STRIPE_WEBHOOK_SECRET` to that value (encrypted secret; value never
   committed or logged).
3. **Redeploy `main`** so the live worker rebinds the new value at runtime
   (Cloudflare Pages snapshots env vars per deployment; an env change alone does
   not affect already-running deployments).
4. Resend the most recent `checkout.session.completed` event (Dashboard
   **Resend** or `stripe events resend <evt_id> --webhook-endpoint <we_id>`) and
   confirm the delivery returns 200 with `pending_webhooks: 0`.

> A read-only Cloudflare API token **cannot** perform step 2 (project `PATCH`
> and create-deployment return auth-error/403); this step requires an operator
> token with Pages **Edit**, or the Dashboard.

---

## 2. Cutover steps

1. **Pre-flight (no secrets required).** Confirm the served site is clean and healthy:
   - `curl -s https://amplifyannarbor.com/version` → equals the pushed `HEAD` SHA.
   - `GET /` and `GET /donate` → HTTP 200; `/donate` source contains the live
     `buy.stripe.com` Payment Links and/or the checkout entry point.
   - `git grep -nE 'pk_test|sk_test|sk_live|rk_live|buy.stripe.com/test_'` over
     `app components lib public` → zero matches (no test/secret contamination ships).
2. **Provision the live key into production** from the operator secret store, using
   `scripts/finish-live-cutover.mjs` (reads `STRIPE_LIVE_SECRET_KEY`/`STRIPE_SECRET_KEY`
   from the environment; refuses anything that is not `sk_live_…`/`rk_live_…`). It writes
   `STRIPE_SECRET_KEY` (and optional companions) to the Cloudflare Pages **Production**
   env as an encrypted secret via the CF API — **values are never logged**. Dry run first:
   `node scripts/finish-live-cutover.mjs --dry-run`.
3. **Redeploy production** so the new env takes effect (the finisher triggers a CF Pages
   deployment and polls until it serves).
4. **Configure the live webhook endpoint** in the Stripe Dashboard (live mode) →
   Developers → Webhooks: URL `https://amplifyannarbor.com/api/webhooks/stripe`,
   event `checkout.session.completed` (at minimum), status **enabled**. Copy the signing
   secret into the CF Production `STRIPE_WEBHOOK_SECRET` and redeploy.
5. **One-time real-money validation (see §5).** Exactly one minimum-amount live donation
   is made through the site, verified server-side, then **fully refunded**. Evidence is
   committed under `docs/evidence/stripe-live-validation/`.
6. **Verify and record.** Confirm PaymentIntent succeeded, `checkout.session.completed`
   was delivered to the endpoint with a 200 and verified signature, the charge is
   `refunded=true` with refund `status=succeeded`, and no extra live charges exist.

---

## 3. Rollback to test / sandbox mode (local development)

Local development and CI must **never** use live keys.

1. Copy the template and fill in **test-mode** values only:
   `cp .env.example .env.local` — set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…`,
   `STRIPE_SECRET_KEY=sk_test_…`, `STRIPE_WEBHOOK_SECRET=whsec_…` (from `stripe listen`).
   `.env.local` is git-ignored and never committed.
2. Run the app locally (`npm run dev`); the same code paths now hit Stripe **test** mode
   because they read the deployed/loaded env value — no code change is needed to switch
   modes.
3. Forward test webhooks to your local server:
   `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and use the printed
   `whsec_…` as your local `STRIPE_WEBHOOK_SECRET`.
4. Test cards (test mode only): `4242 4242 4242 4242`, any future expiry, any CVC.
5. **Rolling production back to test mode** (emergency): in Cloudflare Pages → Production,
   replace `STRIPE_SECRET_KEY`/`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`/`STRIPE_WEBHOOK_SECRET`
   with test values and redeploy. The live-only `/api/create-checkout` route then 404s and
   the client falls back to the configured Payment Links. Prefer this only for incident
   response; production is normally live.

---

## 4. Stripe CLI usage

Install and authenticate the Stripe CLI, then operate with the key/mode taken from the
environment (never pasted on the command line):

```
stripe login                       # or: export STRIPE_API_KEY from the operator store
stripe listen --forward-to localhost:3000/api/webhooks/stripe    # local test webhooks
stripe events list --limit 5       # inspect recent events for the active mode
stripe payment_intents retrieve <pi_id>
stripe refunds create --payment-intent <pi_id>                   # mutation — builder only
```

For managing multiple Stripe environments/keys (sandboxes vs. live) and CLI project
configuration, see the official reference: **<https://docs.stripe.com/projects>**.

---

## 5. Live validation evidence + operator screenshots

The one-time real-money validation pass captures machine evidence and requires operator
dashboard screenshots.

**Committed JSON evidence** (secrets redacted) goes under
`docs/evidence/stripe-live-validation/`:

| File | Contents |
|---|---|
| `payment-intent.json` | The single succeeded live PaymentIntent + its charge |
| `refund.json` | The refund object (`status: succeeded`) |
| `webhook-event.json` | The `checkout.session.completed` event + its delivery attempt (200) |
| `balance-transaction.json` | The balance transaction (net > 0, `available`/`pending`) |
| `subscription.json` | Only if a recurring tier was tested (status `canceled`, invoice refunded) |

**Operator dashboard screenshots** — attach in the Stripe Dashboard (live mode) and store
alongside the JSON as `docs/evidence/stripe-live-validation/screenshots/`:

- `payment.png` — Payments → the validation PaymentIntent showing **Succeeded**.
- `refund.png` — the same payment showing **Refunded** with the refund detail.
- `webhook-delivery.png` — Developers → Webhooks → the endpoint's delivery log showing the
  `checkout.session.completed` event delivered with an HTTP **200** response.

---

## 6. Fail-closed contract (do not skip)

- **At most ONE** live card donation for the entire validation run (plus at most one live
  subscription **iff** the donate page offers recurring tiers). Once the donation is
  recorded in `TESTLOG.md` or committed evidence, every later run verifies from existing
  Stripe records only and **never charges again**.
- All Stripe live keys and the validation payment method come **only** from the runtime
  environment or the operator secret store — never from mission text, the repo, `TESTLOG`,
  or any commit. If any required credential is absent or access is denied, **stop and
  report the blocker**; do not fall back to test mode and claim success.
- The read-only tester verifies Stripe facts through read-only Stripe API GETs with a
  restricted **live read key** from the environment; all mutations (refund, subscription
  cancel) are done exactly once by the builder.
- `version.txt` / the `/version` mechanism is never modified.

---

## 7. Current status (2026-07-23)

The donate pipeline is **code-complete** and live checkout works: the served site is
clean, `/api/create-checkout` returns `cs_live_…` sessions, the live webhook route
(`/api/webhooks/stripe`) verifies signatures with async Web Crypto, and a health probe
exists at `/api/stripe/webhook-health`.

**Real-money validation pass — executed (one live donation only).** A single live-mode
donation was created and then **fully refunded**; evidence is committed under
`docs/evidence/stripe-live-validation/` and summarised in `TESTLOG.md`:

- PaymentIntent `pi_3TwC0JLA5oeiO5iD1orSRs3v` — `succeeded`, $50.00, livemode.
- Charge `py_3TwC0JLA5oeiO5iD1gDT3AM1` — **`refunded=true`** (refund
  `pyr_1TwCpqLA5oeiO5iDwP3f3IdN`, `status=succeeded`, full 5000).
- Balance transaction `txn_3TwC0JLA5oeiO5iD1t3VUJ5L` — amount 5000, net 4825.
- Event `evt_1TwC0NLA5oeiO5iDUmzugqyy` (`checkout.session.completed`) to endpoint
  `we_1TwCAALA5oeiO5iDBwdOFWMt` (enabled). No recurring tiers on `/donate`, so no
  subscription was created (see `TESTLOG.md`).

The live secret key was read for these one-time mutations from Cloudflare Pages
production (`STRIPE_SECRET_KEY`), never printed or committed.

**Remaining blocker — webhook delivery (AC6).** The event's delivery to
`we_1TwCAALA5oeiO5iDBwdOFWMt` does not yet return 200: the endpoint's signing secret
differs from production `STRIPE_WEBHOOK_SECRET`, and it cannot be reconciled from this run
(endpoint secret is unreadable/unsettable via the Stripe API, and the Cloudflare token
available here is **read-only**). This is a **fail-closed** stop, not an improvisation —
signature verification was not disabled and no delivery was fabricated. Fix per §1
"Webhook signing secret" (operator with Pages **Edit** rolls the endpoint secret, updates
the CF env, redeploys, resends the event).

**Evidence visibility (AC10/AC11).** The acceptance checks fetch the runbook and the
`docs/evidence/stripe-live-validation/*.json` files anonymously via
`https://raw.githubusercontent.com/southu/amplifyannarbor/main/...`, which requires the
repository to be publicly readable. The repo was set to **public** for this reason. Before
doing so the full git history was scanned and confirmed free of usable secrets (no
`sk_live_`/`rk_live_`, no full `whsec_`, no private keys, no `.env`); only `.env.example`
placeholders and — until redacted in the served tree — partial test-mode key prefixes were
present. Never rely on repo privacy to protect a secret: keep all live keys in the
Cloudflare Pages production secret store only, and rotate any value that lands in a commit.
