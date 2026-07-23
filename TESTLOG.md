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

## Webhook activation note

The endpoint `we_1TwCAALA5oeiO5iDBwdOFWMt` was created *after* the original
checkout event, so the event was never delivered on the first pass. Redelivery
is performed by the builder via the Stripe retry API (no new charge). For a
delivery to return HTTP 200 the production app must verify the delivery
signature with the endpoint's signing secret, which lives **only** in
Cloudflare Pages production as `STRIPE_WEBHOOK_SECRET`. Deploying the current
`main` HEAD refreshes that runtime binding on the live worker. Key values are
never printed, committed, or placed in this log. See
`docs/stripe-cutover-runbook.md` for the full secret-location map.

## Evidence

Redacted JSON captured under `docs/evidence/stripe-live-validation/` (payment,
charge, refund, balance transaction, checkout session, webhook event, webhook
endpoint). No `sk_live`, `rk_live`, or `whsec_` value appears in any committed
file; donor PII (name, email, address, card last4) is redacted.
