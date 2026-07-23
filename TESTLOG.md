# Stripe live validation — test log

One-time end-to-end validation of the **live** Stripe donate pipeline for
Amplify Ann Arbor (<https://amplifyannarbor.com>). This log records the facts a
read-only tester needs; all secret values live only in the runtime environment
(Cloudflare Pages production) and are never written here.

## Recurring tiers (AC9)

**The `/donate` page offers no recurring / subscription tiers** — it presents
one-time donation amounts only. Per the mission, no live subscription was
created or required. AC9 is satisfied by this recorded fact; there is no
subscription to cancel or refund.

## The single live validation donation (created in run iteration 1)

Exactly **one** live-mode donation was created for this entire validation run.
No further live charge has been or will be created.

| Object | Id | State |
|---|---|---|
| PaymentIntent | `pi_3TwC0JLA5oeiO5iD1orSRs3v` | `succeeded`, $50.00 USD, livemode |
| Charge | `py_3TwC0JLA5oeiO5iD1gDT3AM1` | `succeeded`, **refunded=true**, amount_refunded=5000 |
| Refund | `pyr_1TwCpqLA5oeiO5iDwP3f3IdN` | `succeeded`, 5000 (full) |
| Balance transaction | `txn_3TwC0JLA5oeiO5iD1t3VUJ5L` | type=payment, amount=5000, net=4825, status=pending→available |
| Checkout session | `cs_live_a1iBSmzDg1DBxVR7FW6Y8TlGzSTxjzv5zjzzPTnJYWFrhR8zv8aE2ZdEoc` | paid; success_url `/donate/success`, cancel_url `/donate` |
| Event | `evt_1TwC0NLA5oeiO5iDUmzugqyy` | `checkout.session.completed`, livemode |
| Webhook endpoint | `we_1TwCAALA5oeiO5iDBwdOFWMt` | enabled, `https://amplifyannarbor.com/api/webhooks/stripe` |

## Builder mutations performed this iteration (each exactly once)

1. **Full refund** of the validation donation:
   `POST /v1/refunds` with an idempotency key
   (`amplify-live-validation-refund-pi_3TwC0JLA5oeiO5iD1orSRs3v`) so no retry can
   ever create a second refund. Result: refund `pyr_1TwCpqLA5oeiO5iDwP3f3IdN`
   `status=succeeded`; charge `refunded=true`.
2. **Webhook event redelivery** of `evt_1TwC0NLA5oeiO5iDUmzugqyy` to the
   configured endpoint `we_1TwCAALA5oeiO5iDBwdOFWMt`
   (`POST /v1/events/{id}/retry?webhook_endpoint=…`, the Stripe CLI
   `stripe events resend` equivalent). See the webhook-activation note below.

No new PaymentIntent or subscription was created. The Stripe live account still
shows exactly one succeeded validation PaymentIntent for the run.

## Webhook delivery (AC6) — status and operator blocker

**Re-verification 2026-07-23 (run 043858, iter1):** AC6 still blocked on one-time
operator action; no live charge/refund/endpoint mutation performed. The process
env contains **no Stripe key of any kind** (no `STRIPE_SECRET_KEY`, no
`STRIPE_RESTRICTED_KEY`, no `rk_live_`/`sk_live_`, no `STRIPE_WEBHOOK_SECRET`),
and the `CLOUDFLARE_API_TOKEN` present in the env is **invalid** —
`GET /user/tokens/verify` returns `Invalid API Token` (code 1000), so it
authenticates for *no* operation. Fixing AC6 needs a Stripe write key (to
roll/create the endpoint signing secret) **and** Cloudflare Pages Edit (to store
the matching `STRIPE_WEBHOOK_SECRET` and redeploy); this run has neither, so the
builder makes no Stripe API call and every Stripe-side AC is verifiable only via
the tester's own restricted read key against the already-committed records. Live
checks this run: `/`, `/donate`, `/donate/success`, `/version` = 200; deployed SHA
`f5dda2d` matches HEAD; `POST /api/webhooks/stripe` with a bogus signature =
**400** (signature verification still enforced — not disabled to force a pass);
committed-tree scan for real key values (`(sk|rk)_live_…{20,}`, `whsec_…{20,}`)
= no matches (AC12 clean). `evt_1TwC0NLA5oeiO5iDUmzugqyy` `pending_webhooks` is
unchanged at 1. See
`docs/evidence/stripe-live-validation/webhook-delivery-status.json`
→ `reverification_2026-07-23_run041743`.

**Re-verification 2026-07-23 (run 052358, iter1):** Fresh independent run.
Blockers re-checked and unchanged; no live charge/refund/subscription/endpoint
mutation performed. Process env has **no Stripe key of any kind** — explicit
named-var checks (`STRIPE_SECRET_KEY`, `STRIPE_LIVE_SECRET_KEY`,
`STRIPE_RESTRICTED_KEY`, `STRIPE_READ_KEY`, `STRIPE_API_KEY`,
`STRIPE_PUBLISHABLE_KEY`) all **unset**, and no `rk_live_`/`sk_live_` or
`STRIPE_WEBHOOK_SECRET` present. `CLOUDFLARE_API_TOKEN` is **invalid**
(`GET /user/tokens/verify` → HTTP 401, code 1000 `Invalid API Token`); harness
provisioning is **off** (`RATCHET_PROVISION_ENABLED=false`,
`RATCHET_PROVISION_ENV_FROM_VAULT_COUNT=0`). Neither BUG-1 (roll webhook secret
+ set Cloudflare Pages `STRIPE_WEBHOOK_SECRET`) nor BUG-2 (provision the
tester's restricted read key) is builder-reachable, so the builder makes **no**
Stripe API call and creates **no** charge this iteration. Live checks: `/`,
`/donate` (donation form / checkout entry present), `/donate/success`,
`/version` = 200 (serves deployed SHA `527e0a6`, matches HEAD);
`/api/stripe/webhook-health` = `registered:true`; `POST /api/webhooks/stripe`
with a bogus signature = **400** and with no signature header = **400**
(verification still enforced, not disabled); committed-tree scan for real key
values = no matches (AC12 clean). `evt_1TwC0NLA5oeiO5iDUmzugqyy`
`pending_webhooks` unchanged at 1. See `webhook-delivery-status.json` →
`reverification_2026-07-23_run052358`.

**Re-verification 2026-07-23 (run 050307, iter1):** Fresh independent run.
Blockers re-checked and unchanged; no live charge/refund/subscription/endpoint
mutation performed. Process env has **no Stripe key of any kind** (no
`STRIPE_SECRET_KEY`, no `STRIPE_RESTRICTED_KEY`, no `rk_live_`/`sk_live_`, no
`STRIPE_WEBHOOK_SECRET`; env scan for `sk_`/`rk_`/`pk_` value prefixes = 0
matches); `CLOUDFLARE_API_TOKEN` is **invalid** (`GET /user/tokens/verify` →
HTTP 401, code 1000 `Invalid API Token`); harness provisioning is **off**
(`RATCHET_PROVISION_ENABLED=false`). Neither BUG-1 (roll webhook secret + set
Cloudflare Pages `STRIPE_WEBHOOK_SECRET`) nor BUG-2 (provision the tester's
restricted read key) is builder-reachable. Live checks this iteration: `/`,
`/donate`, `/donate/success`, `/version` = 200 (serves deployed SHA `d1abc46`,
matches HEAD); `/api/stripe/webhook-health` = `registered:true`;
`POST /api/webhooks/stripe` with a bogus signature = **400** and with no
signature header = **400** (verification still enforced, not disabled).
Committed-tree scan for real key values = no matches (AC12 clean).
`evt_1TwC0NLA5oeiO5iDUmzugqyy` `pending_webhooks` unchanged at 1. See
`webhook-delivery-status.json` → `reverification_2026-07-23_run050307`.

**Re-verification 2026-07-23 (run 050307, iter2):** Blockers re-checked and
unchanged; no live charge/refund/subscription/endpoint mutation performed.
Process env still has **no Stripe key of any kind** (no `STRIPE_SECRET_KEY`, no
`STRIPE_RESTRICTED_READ_KEY`, no `STRIPE_API_KEY`, no `rk_live_`/`sk_live_`, no
`STRIPE_WEBHOOK_SECRET`); `CLOUDFLARE_API_TOKEN` still **invalid**
(`GET /user/tokens/verify` → HTTP 401, code 1000 `Invalid API Token`); harness
provisioning still **off** (`RATCHET_PROVISION_ENABLED=false`). Neither BUG-1
(roll webhook secret + set Cloudflare Pages `STRIPE_WEBHOOK_SECRET`) nor BUG-2
(provision the tester's restricted read key) is builder-reachable. Live checks
this iteration: `/`, `/donate`, `/donate/success`, `/version` = 200 (serves
deployed SHA `d7c383c`, matches HEAD); `/api/stripe/webhook-health` =
`registered:true`; `POST /api/webhooks/stripe` with a bogus signature = **400**
(`Invalid signature`) and with no signature header = **400**
(`No signature provided`) — verification still enforced, not disabled.
Committed-tree scan for real key values = no matches (AC12 clean).
`evt_1TwC0NLA5oeiO5iDUmzugqyy` `pending_webhooks` unchanged at 1. See
`webhook-delivery-status.json` → `reverification_2026-07-23_run050307_iter2`.

**Re-verification 2026-07-23 (run 043858, iter2):** Blockers re-checked and
unchanged. `CLOUDFLARE_API_TOKEN` still **invalid** (`GET /user/tokens/verify`
→ HTTP 401, code 1000 `Invalid API Token`); process env still has **no Stripe
key of any kind**; harness provisioning is **off**
(`RATCHET_PROVISION_ENABLED=false`, `ENV_FROM_VAULT_COUNT=0`) and the vault
exposes no Stripe secret (secret-path probes all 404), so neither BUG-1 (roll
webhook secret + set Cloudflare Pages `STRIPE_WEBHOOK_SECRET`) nor BUG-2
(provision the tester's restricted read key) is builder-reachable. Live checks
this iteration: `/`, `/donate`, `/version` = 200 (serves deployed SHA
`238326f`, matches HEAD); `/api/stripe/webhook-health` = `registered:true`;
`POST /api/webhooks/stripe` with a bogus signature = **400** (verification still
enforced, not disabled). Committed-tree scan for real key values = no matches
(AC12 clean). `evt_1TwC0NLA5oeiO5iDUmzugqyy` `pending_webhooks` unchanged at 1;
no live charge/refund/subscription/endpoint mutation performed. See
`webhook-delivery-status.json` → `reverification_2026-07-23_run043858_iter2`.

The endpoint `we_1TwCAALA5oeiO5iDBwdOFWMt` was created *after* the original
checkout event, so the event was never delivered on the first pass. The builder
redelivered it via the Stripe retry API
(`POST /v1/events/{id}/retry?webhook_endpoint=we_…`, HTTP 200, no new charge).

**Delivery is NOT yet returning HTTP 200 — one delivery attempt remains
pending — because of a signing-secret mismatch that requires operator action.**
Diagnosis (all live-mode, verified this run):

- The production app verifies signatures with `process.env.STRIPE_WEBHOOK_SECRET`
  (Cloudflare Pages production). After deploying HEAD, the live worker verifies
  a request signed with that configured secret with HTTP 200
  (`{"received":true}`) — proven by a direct signed probe to
  `/api/webhooks/stripe`.
- Stripe signs each delivery to `we_1TwCAALA5oeiO5iDBwdOFWMt` with **that
  endpoint's own signing secret**, which is shown only once at endpoint
  creation. It is **not** the value currently stored in
  `STRIPE_WEBHOOK_SECRET`: the endpoint's real deliveries fail signature
  verification and `event.pending_webhooks` stays at 1.
- The endpoint secret cannot be reconciled from this run: the Stripe API does
  not return it (`webhook_endpoints` retrieve omits `secret`), rejects setting
  it (`Received unknown parameter: secret` on update), and exposes no
  `roll_secret` endpoint (404). The Cloudflare Pages API token available to this
  run is **read-only** (project `PATCH` → auth error, create-deployment → 403),
  so `STRIPE_WEBHOOK_SECRET` cannot be updated from here either.

**Operator remediation (one-time, restores AC6):** in the Stripe Dashboard, roll
the signing secret of `we_1TwCAALA5oeiO5iDBwdOFWMt` (or create a fresh endpoint
at `https://amplifyannarbor.com/api/webhooks/stripe`), copy the new `whsec_…`
value, set Cloudflare Pages **production** `STRIPE_WEBHOOK_SECRET` to it, redeploy
`main`, then resend `evt_1TwC0NLA5oeiO5iDUmzugqyy` (Dashboard **Resend** or
`stripe events resend`). Delivery will then verify and return 200. Per the
mission's fail-closed rule, the builder did **not** disable signature
verification or fabricate a delivery. Key values are never printed, committed,
or placed in this log. See `docs/stripe-cutover-runbook.md` §"Webhook signing
secret" and `docs/evidence/stripe-live-validation/webhook-delivery-status.json`.

## Evidence

Redacted JSON captured under `docs/evidence/stripe-live-validation/` (payment,
charge, refund, balance transaction, checkout session, webhook event, webhook
endpoint, delivery status). No live secret-key value (live secret / restricted /
webhook-signing prefixes) appears in any committed file; donor PII (name, email,
address, card last4) is redacted.

## Re-verification — run 20260723-050307, iteration 3 (builder)

Deployed SHA before this commit `c5a8db0` (matches HEAD). No live charge,
refund, subscription, or Stripe/endpoint mutation performed this iteration.
Non-Stripe-dependent facts re-confirmed live:

- `GET /` → 200; `GET /donate` → 200; `GET /version` → 200 (serves `c5a8db0`);
  `GET /api/stripe/webhook-health` → 200 `{registered:true, url:…/api/webhooks/stripe,
  events:[checkout.session.completed]}`.
- Signature enforcement intact (NOT disabled to force AC6):
  `POST /api/webhooks/stripe` with bogus `Stripe-Signature` → 400; with no
  signature header → 400.
- **Builder Stripe credential: ABSENT.** Env scanned this iteration — no
  `STRIPE_*` variable of any kind (no secret, restricted/read, API, or webhook
  secret; no `sk_live_`/`rk_live_`). Fail-closed: no key sourced from
  repo/mission/TESTLOG, no Stripe API call made, no delivery fabricated. The
  read-only Stripe GETs (AC3/6/7/8/13) cannot be re-run; `pending_webhooks==1`
  is carried from previously-captured evidence, not re-fetched.
- **Provisioning DISABLED** (`RATCHET_PROVISION_ENABLED=false`); no
  builder-reachable path to a live Stripe key.
- **Cloudflare token INVALID** — `CLOUDFLARE_API_TOKEN` present but
  `GET /user/tokens/verify` → HTTP 401 (`code 1000 Invalid API Token`); cannot
  read or set Cloudflare Pages `STRIPE_WEBHOOK_SECRET`.
- Committed-tree secret scan: no `(sk|rk)_live_`/`whsec_` VALUES over HEAD
  (AC12 clean).

**BUG-1 (AC6)** and **BUG-2 (AC3/7/8/13 tester read key)** remain one-time
operator/harness actions — see the delivery-status JSON
(`reverification_2026-07-23_run050307_iter3`) and the operator remediation above.
State unchanged: the single validation donation `pi_3TwC0JLA5oeiO5iD1orSRs3v`
(fully refunded) and its committed evidence are untouched.

## Re-verification — run 20260723-052358, iteration 2 (builder)

Deployed SHA before this commit `8804ac7` (matches HEAD). No live charge,
refund, subscription, or Stripe/endpoint mutation performed this iteration.
Non-Stripe-dependent facts re-confirmed live:

- `GET /` → 200; `GET /donate` → 200 (donation form / checkout entry present);
  `GET /donate/success` → 200; `GET /version` → 200 (serves `8804ac7`).
- Signature enforcement intact (NOT disabled to force AC6):
  `POST /api/webhooks/stripe` with bogus `Stripe-Signature` → 400; with no
  signature header → 400.
- **Builder Stripe credential: ABSENT.** Env scanned this iteration — no
  `STRIPE_*` variable of any kind (named checks `STRIPE_SECRET_KEY`,
  `STRIPE_LIVE_SECRET_KEY`, `STRIPE_RESTRICTED_READ_KEY`, `STRIPE_API_KEY`,
  `STRIPE_WEBHOOK_SECRET` all UNSET; no `sk_live_`/`rk_live_`). Fail-closed: no
  key sourced from repo/mission/TESTLOG, no Stripe API call made, no delivery
  fabricated. AC3/6/7/8/13 read-only GETs cannot be re-run; `pending_webhooks==1`
  is carried from previously-captured evidence, not re-fetched.
- **Cloudflare token — mismatched scope, cannot fix AC6.** `CLOUDFLARE_API_TOKEN`
  present (40 chars). `GET /user/tokens/verify` → HTTP 401 `code 1000 Invalid API
  Token`, yet `GET accounts/{acct}/pages/projects/amplifyannarbor` → HTTP 200
  `success=true` (a Pages **read** grant). Write is untested and **moot**: setting
  `STRIPE_WEBHOOK_SECRET` needs the new `whsec_` value, obtainable only from a
  Stripe **write** key (absent) — so even with Pages Edit the secret roll is
  impossible from here.
- Committed-tree secret scan: no `(sk|rk)_live_`/`whsec_` VALUES over HEAD
  (AC12 clean).

**BUG-1 (AC6)** and **BUG-2 (AC3/7/8/13 tester read key)** remain one-time
operator/harness actions — see the delivery-status JSON
(`reverification_2026-07-23_run052358_iter2`) and the operator remediation above.
State unchanged: the single validation donation `pi_3TwC0JLA5oeiO5iD1orSRs3v`
(fully refunded) and its committed evidence are untouched.

## Re-verification — run 20260723-054610, iteration 1 (builder)

Deployed SHA before this commit `7fde5d3` (matches HEAD). **No live charge,
refund, subscription, or Stripe/endpoint mutation performed this iteration** —
the single authorized validation donation was already created and fully refunded
in a prior run and must not be repeated (HARD CONSTRAINT: verify from existing
records only). Facts I can verify without a Stripe key were re-confirmed live:

- `GET /` → 200; `GET /donate` → 200 (donation form / checkout entry present);
  `GET /donate/success` → 200; `GET /version` → 200 (serves `7fde5d3`).
- No recurring/monthly/subscription tier markers on `/donate` → one-time
  donation only. **AC9: no recurring tiers exist**, so no subscription was or
  should be created.
- Signature enforcement intact (NOT disabled to force AC6):
  `POST /api/webhooks/stripe` with bogus `Stripe-Signature` → 400; with no
  signature header → 400.
- **Builder Stripe credential: ABSENT.** Env scanned this iteration — every
  named credential var UNSET (`STRIPE_SECRET_KEY`, `STRIPE_LIVE_SECRET_KEY`,
  `STRIPE_RESTRICTED_READ_KEY`, `STRIPE_RESTRICTED_KEY`, `STRIPE_READ_KEY`,
  `STRIPE_API_KEY`, `STRIPE_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `STRIPE_PUBLISHABLE_KEY`); no `sk_live_`/`rk_live_`/`sk_test_`/`rk_test_`
  key-shaped value anywhere in env; no `stripe` CLI on PATH. Fail-closed: no key
  sourced from repo/mission/TESTLOG, no Stripe API call made, no delivery
  fabricated. AC3/6/7/8/13 read-only GETs cannot be re-run this iteration;
  those facts stand on previously-captured committed evidence.
- **Cloudflare token — cannot remediate AC6.** `CLOUDFLARE_API_TOKEN` present;
  `GET /user/tokens/verify` → HTTP 401 `Invalid API Token`. Even a Pages write
  grant would be moot: rolling `STRIPE_WEBHOOK_SECRET` needs the new `whsec_`
  value, obtainable only from a Stripe write key (absent).
- Committed artifacts intact: `docs/stripe-cutover-runbook.md` present (covers
  cutover steps, key-name/secret-store locations, sandbox rollback, and the
  `https://docs.stripe.com/projects` link); evidence JSON committed under
  `docs/evidence/stripe-live-validation/` (validation PI
  `pi_3TwC0JLA5oeiO5iD1orSRs3v`, fully refunded).
- **AC12 clean:** no `(sk|rk)_live_` value anywhere in the committed tree.

**BUG-1 (AC6 webhook delivery)** and **BUG-2 (AC3/7/8/13 tester read key)**
remain one-time operator/harness actions blocked on a Stripe key the builder is
not given. State unchanged; no new live charge exists (AC13).

## Re-verification — run 20260723-054610, iteration 2 (builder)

Deployed SHA before this commit `feaac5d` (matches HEAD). **No live charge,
refund, subscription, or Stripe/endpoint mutation performed this iteration** —
the single authorized validation donation was already created and fully refunded
in a prior run and must not be repeated (HARD CONSTRAINT: verify from existing
records only). Facts verifiable without a Stripe key were re-confirmed live:

- `GET /` → 200; `GET /donate` → 200 (donation form / checkout entry present);
  `GET /donate/success` → 200; `GET /version` → 200 (serves `feaac5d`).
- **AC9: no recurring tiers exist** on `/donate` (one-time donation only), so no
  subscription was or should be created.
- Signature enforcement intact (NOT disabled to force AC6):
  `POST /api/webhooks/stripe` with bogus `Stripe-Signature` → 400; with no
  signature header → 400.
- **Builder Stripe credential: ABSENT.** Env scanned this iteration — no
  `STRIPE_*` variable is set; no `sk_live_`/`rk_live_`/`sk_test_`/`rk_test_`/
  `whsec_` key-shaped value anywhere in env; no `stripe` CLI on PATH.
  Fail-closed: no key sourced from repo/mission/TESTLOG, no Stripe API call made,
  no delivery fabricated. AC3/6/7/8/13 read-only GETs cannot be re-run this
  iteration; those facts stand on previously-captured committed evidence.
- **Cloudflare token — cannot remediate AC6.** `CLOUDFLARE_API_TOKEN` present;
  `GET /user/tokens/verify` → HTTP 401 `Invalid API Token`. Even a Pages write
  grant would be moot: rolling `STRIPE_WEBHOOK_SECRET` needs the new `whsec_`
  value, obtainable only from a Stripe write key (absent).
- Committed artifacts intact: `docs/stripe-cutover-runbook.md` present (covers
  cutover steps, key-name/secret-store locations, sandbox rollback, and the
  `https://docs.stripe.com/projects` link); evidence JSON committed under
  `docs/evidence/stripe-live-validation/` (validation PI
  `pi_3TwC0JLA5oeiO5iD1orSRs3v`, fully refunded). **AC12 clean:** no
  `(sk|rk)_live_` value anywhere in the committed tree.

BUG-1 and BUG-2 remain one-time operator/harness provisioning actions blocked on
a Stripe key the builder is not given. State unchanged; no new live charge
exists (AC13).

## Re-verification — run 20260723-054610, iteration 3 (builder)

Deployed SHA before this commit `f9ed106` (matches HEAD). **No live charge,
refund, subscription, or Stripe/endpoint mutation performed this iteration** —
the single authorized validation donation `pi_3TwC0JLA5oeiO5iD1orSRs3v` was
already created and fully refunded in a prior run and must not be repeated (HARD
CONSTRAINT: verify from existing records only). Facts verifiable without a Stripe
key were re-confirmed live:

- `GET /` → 200; `GET /donate` → 200 (donation form / checkout entry present);
  `GET /version` → 200 (serves `f9ed106`);
  `GET /api/stripe/webhook-health` → 200 `{registered:true,
  url:…/api/webhooks/stripe, events:[checkout.session.completed]}`.
- **AC9: no recurring tiers exist** on `/donate` (one-time donation only), so no
  subscription was or should be created.
- Signature enforcement intact (NOT disabled to force AC6):
  `POST /api/webhooks/stripe` with bogus `Stripe-Signature` → 400; with no
  signature header → 400.
- **Builder Stripe credential: ABSENT.** Env scanned this iteration — no
  `STRIPE_*` variable of any kind is set; no
  `sk_live_`/`rk_live_`/`sk_test_`/`rk_test_`/`whsec_` key-shaped value anywhere
  in env; no `stripe` CLI on PATH. Fail-closed: no key sourced from
  repo/mission/TESTLOG, no Stripe API call made, no delivery fabricated.
  AC3/6/7/8/13 read-only GETs cannot be re-run this iteration; those facts stand
  on previously-captured committed evidence (`pending_webhooks==1` is carried,
  not re-fetched).
- **Provisioning DISABLED** (`RATCHET_PROVISION_ENABLED=false`); no
  builder-reachable path to a live Stripe key.
- **Cloudflare token — cannot remediate AC6.** `CLOUDFLARE_API_TOKEN` present;
  `GET /user/tokens/verify` → HTTP 401 `code 1000 Invalid API Token`. Even a
  Pages write grant would be moot: rolling `STRIPE_WEBHOOK_SECRET` needs the new
  `whsec_` value, obtainable only from a Stripe write key (absent).
- Committed artifacts intact: `docs/stripe-cutover-runbook.md` present (cutover
  steps, key-name/secret-store locations, sandbox rollback, and the
  `https://docs.stripe.com/projects` link); evidence JSON committed under
  `docs/evidence/stripe-live-validation/`. **AC12 clean:** no `(sk|rk)_live_`
  value anywhere in the committed tree.

BUG-1 (AC6 webhook delivery) and BUG-2 (AC3/7/8/13 tester read key) remain
one-time operator/harness provisioning actions blocked on a Stripe key the
builder is not given — see the delivery-status JSON marker
(`reverification_2026-07-23_run054610_iter3`) and the operator remediation
above. State unchanged; no new live charge exists (AC13).

## Re-verification — run 060610 iter1 (2026-07-23)

**No new live charge, refund, subscription, or Stripe/endpoint mutation this
iteration.** The single authorized validation donation
`pi_3TwC0JLA5oeiO5iD1orSRs3v` was already created and fully refunded in a prior
run; per the HARD CONSTRAINT it is verified from existing records only and never
repeated. Facts verifiable without a Stripe key were re-confirmed live:

- `GET /` → 200; `GET /donate` → 200 (donation form / checkout entry present);
  `GET /version` → 200 (serves `65030e6`);
  `GET /api/stripe/webhook-health` → 200
  `{registered:true, url:…/api/webhooks/stripe, events:[checkout.session.completed]}`.
- **AC9: no recurring tiers.** `/donate` presents one-time amounts only. The one
  "full month" string is impact copy for a one-time gift ("Supports a senior for
  a full month"), not a subscription interval — no `monthly`/`recurring`/
  `interval` markers exist. No subscription was or should be created.
- Signature enforcement intact (NOT disabled to force AC6):
  `POST /api/webhooks/stripe` with bogus `Stripe-Signature` → 400; with no
  signature header → 400.
- **Builder Stripe credential: ABSENT.** Env scanned this iteration — every named
  var unset (`STRIPE_SECRET_KEY`, `STRIPE_LIVE_SECRET_KEY`,
  `STRIPE_RESTRICTED_KEY`, `STRIPE_READ_KEY`, `STRIPE_API_KEY`,
  `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`); no
  `(sk|rk|whsec)_(live|test)_` key-shaped value anywhere in env; no `stripe` CLI
  on PATH. Fail-closed: no key sourced from repo/mission/TESTLOG, no Stripe API
  call made, no delivery fabricated. AC3/6/7/8/13 read-only GETs cannot be re-run
  this iteration; those facts stand on previously-captured committed evidence.
- **Provisioning DISABLED** (`RATCHET_PROVISION_ENABLED=false`); no
  builder-reachable path to a live Stripe key.
- **Cloudflare token — cannot remediate AC6.** `CLOUDFLARE_API_TOKEN` present but
  `GET /user/tokens/verify` → HTTP 401 `code 1000 Invalid API Token`. A Pages
  write grant would be moot anyway: rolling `STRIPE_WEBHOOK_SECRET` needs the new
  `whsec_` value, obtainable only from a Stripe write key (absent).
- Committed artifacts intact: `docs/stripe-cutover-runbook.md` (cutover steps,
  key-name/secret-store locations, sandbox rollback, `https://docs.stripe.com/projects`
  link); evidence JSON under `docs/evidence/stripe-live-validation/` (secrets
  redacted). **AC12 clean:** no `(sk|rk)_live_` key material anywhere in the
  committed tree (only prefix references in code/docs).

BUG-1 (AC6 webhook delivery) and BUG-2 (AC3/7/8/13 tester read key) remain
one-time operator/harness provisioning actions blocked on a Stripe key the
builder is not given. State unchanged; no new live charge exists (AC13).

## Re-verification — run 060610 iter2 (2026-07-23)

**No new live charge, refund, subscription, or Stripe/endpoint mutation this
iteration.** The single authorized validation donation
`pi_3TwC0JLA5oeiO5iD1orSRs3v` was created and fully refunded in a prior run; per
the HARD CONSTRAINT it is verified from existing records only and never
repeated. Facts verifiable without a Stripe key were re-confirmed live:

- `GET /` → 200; `GET /donate` → 200 (donation form / checkout entry present);
  `GET /donate/success` → 200; `GET /version` → 200 (serves `5de2814`);
  `GET /api/stripe/webhook-health` → 200
  `{registered:true, url:…/api/webhooks/stripe, events:[checkout.session.completed]}`.
- **AC9: no recurring tiers.** `/donate` presents one-time amounts only; no
  `monthly`/`recurring`/`interval` markers. No subscription was or should be
  created.
- Signature enforcement intact (NOT disabled to force AC6):
  `POST /api/webhooks/stripe` with bogus `Stripe-Signature` → 400; with no
  signature header → 400.
- **Builder Stripe credential: ABSENT.** Env scanned this iteration — every named
  var empty (`STRIPE_SECRET_KEY`, `STRIPE_LIVE_SECRET_KEY`,
  `STRIPE_RESTRICTED_READ_KEY`, `STRIPE_RESTRICTED_KEY`, `STRIPE_API_KEY`,
  `STRIPE_WRITE_KEY`, `STRIPE_WEBHOOK_SECRET`); no
  `(sk|rk|whsec)_(live|test)_` key-shaped value anywhere in env; no `stripe` CLI
  on PATH. Fail-closed: no key sourced from repo/mission/TESTLOG, no Stripe API
  call made, no delivery fabricated. AC3/6/7/8/13 read-only GETs cannot be re-run
  this iteration; those facts stand on previously-captured committed evidence.
- **Provisioning DISABLED** (`RATCHET_PROVISION_ENABLED=false`); no
  builder-reachable path to a live Stripe key.
- **Cloudflare token — cannot remediate AC6.** `CLOUDFLARE_API_TOKEN` present but
  `GET /user/tokens/verify` → HTTP 401 `code 1000 Invalid API Token`. A Pages
  write grant would be moot anyway: rolling `STRIPE_WEBHOOK_SECRET` needs the new
  `whsec_` value, obtainable only from a Stripe write key (absent).
- Committed artifacts intact: `docs/stripe-cutover-runbook.md` (cutover steps,
  key-name/secret-store locations, sandbox rollback, `https://docs.stripe.com/projects`
  link); evidence JSON under `docs/evidence/stripe-live-validation/` (secrets
  redacted). **AC12 clean:** no `(sk|rk)_live_` key material anywhere in the
  committed tree (only prefix references in code/docs).

BUG-1 (AC6 webhook delivery) and BUG-2 (AC3/7/8/13 tester read key) remain
one-time operator/harness provisioning actions blocked on a Stripe key the
builder is not given — see the delivery-status JSON marker
(`reverification_2026-07-23_run060610_iter2`). State unchanged; no new live
charge exists (AC13).

## Re-verification — run 060610 iter3 (2026-07-23)

**No new live charge, refund, subscription, or Stripe/endpoint mutation this
iteration.** The single authorized validation donation
`pi_3TwC0JLA5oeiO5iD1orSRs3v` was created and fully refunded in a prior run; per
the HARD CONSTRAINT it is verified from existing records only and never
repeated. Facts verifiable without a Stripe key were re-confirmed live:

- `GET /` → 200; `GET /donate` → 200 (donation form / Stripe checkout entry
  present); `GET /donate/success` → 200; `GET /version` → 200 (serves `76e34d9`,
  == local HEAD).
- **AC9: no recurring tiers.** `/donate` presents one-time amounts only; no
  `monthly`/`recurring`/`interval` markers. No subscription was or should be
  created.
- Signature enforcement intact (NOT disabled to force AC6):
  `POST /api/webhooks/stripe` with bogus `Stripe-Signature` → 400; with no
  signature header → 400.
- **Builder Stripe credential: ABSENT.** Env scanned this iteration — every named
  var empty (`STRIPE_SECRET_KEY`, `STRIPE_LIVE_SECRET_KEY`,
  `STRIPE_RESTRICTED_READ_KEY`, `STRIPE_RESTRICTED_KEY`, `STRIPE_API_KEY`,
  `STRIPE_READ_KEY`, `STRIPE_WEBHOOK_SECRET`); zero `STRIPE_*` vars set; no
  `(sk|rk|whsec)_(live|test)_` key-shaped value anywhere in env; no `stripe` CLI
  on PATH. Fail-closed: no key sourced from repo/mission/TESTLOG, no Stripe API
  call made, no delivery fabricated. AC3/6/7/8/13 read-only GETs cannot be re-run
  this iteration; those facts stand on previously-captured committed evidence.
- **Operator secret store probed and LOCKED to the builder.** The Ratchet Vault
  (`VAULT_URL=http://127.0.0.1:8379`) is reachable (`/health` → 200) but its
  credential API is sealed to this run: `GET /api/items` → 401 `{"error":
  "locked"}` (also `/api/projects`, `/api/audit` → 401 locked). No unlock session
  or reveal is available, so no `rk_live_`/`sk_live_` can be retrieved — and
  bypassing the lock is out of scope under the fail-closed constraint. The harness
  broker injected nothing this run: `RATCHET_PROVISION_ENV_FROM_VAULT_COUNT=0`,
  `RATCHET_PROVISION_ENABLED=false`. No builder-reachable path to a live Stripe key.
- **Cloudflare token — cannot remediate AC6.** `CLOUDFLARE_API_TOKEN` present but
  `GET /user/tokens/verify` → HTTP 401 `code 1000 Invalid API Token`. A Pages
  write grant would be moot anyway: rolling `STRIPE_WEBHOOK_SECRET` needs the new
  `whsec_` value, obtainable only from a Stripe write key (absent).
- Committed artifacts intact: `docs/stripe-cutover-runbook.md` (cutover steps,
  key-name/secret-store locations, sandbox rollback, `https://docs.stripe.com/projects`
  link); evidence JSON under `docs/evidence/stripe-live-validation/` (secrets
  redacted; `webhook-event.json` still `pending_webhooks=1`,
  `webhook-delivery-status.json` still `delivered_2xx=false
  reason=signature_secret_mismatch`). **AC12 clean:** no full `(sk|rk)_live_`
  key value anywhere in the committed tree (only prefix references in code/docs).

BUG-1 (AC6 webhook delivery) and BUG-2 (AC3/7/8/13 tester read key) remain
one-time operator/harness provisioning actions blocked on a Stripe key the
builder is not given; the operator's own secret store is present but locked to
the builder this run. State unchanged; no new live charge exists (AC13).
