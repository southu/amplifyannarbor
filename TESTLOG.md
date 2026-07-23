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

**Re-verification 2026-07-23 (run 034458, iter3):** AC6 still blocked on
one-time operator action; no live charge/refund/endpoint mutation performed.
This run has *fewer* credentials than before: the process env contains **no
Stripe key of any kind** (no `STRIPE_SECRET_KEY`, no restricted read key, no
`STRIPE_WEBHOOK_SECRET`), and the `CLOUDFLARE_API_TOKEN` is now **invalid
entirely** — `GET /user/tokens/verify` returns `Invalid API Token` (code 1000),
so it authenticates for *no* operation, not merely PATCH. Fixing AC6 needs a
Stripe write key (to roll/create the endpoint signing secret) **and** Cloudflare
Pages Edit (to store the matching `STRIPE_WEBHOOK_SECRET` and redeploy); this run
has neither. Live checks: `/`, `/donate`, `/version` = 200; deployed SHA matches
HEAD; `POST /api/webhooks/stripe` with a bogus signature = **400** (signature
verification still enforced — not disabled to force a pass). `evt_1TwC0NLA5oeiO5iDUmzugqyy`
`pending_webhooks` is unchanged at 1. See
`docs/evidence/stripe-live-validation/webhook-delivery-status.json`
→ `reverification_2026-07-23_run034458_iter3`.

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
