# Stripe live validation evidence

Machine-captured, **secret-redacted** JSON records for the one-time live Stripe
validation of the Amplify Ann Arbor donate pipeline. All objects are live-mode
(`livemode: true`). Captured server-side with the production live secret key,
which never appears in these files.

| File | Object | Key facts |
|---|---|---|
| `payment-intent.json` | `pi_3TwC0JLA5oeiO5iD1orSRs3v` | `status=succeeded`, amount 5000 USD, livemode |
| `charge.json` | `py_3TwC0JLA5oeiO5iD1gDT3AM1` | `refunded=true`, `amount_refunded=5000` |
| `refund.json` | `pyr_1TwCpqLA5oeiO5iDwP3f3IdN` | `status=succeeded`, amount 5000 (full) |
| `balance-transaction.json` | `txn_3TwC0JLA5oeiO5iD1t3VUJ5L` | type payment, amount 5000, net 4825 |
| `checkout-session.json` | `cs_live_a1iBSmzDg1DBxVR7…` | paid; success `/donate/success`, cancel `/donate` |
| `webhook-event.json` | `evt_1TwC0NLA5oeiO5iDUmzugqyy` | `checkout.session.completed`, livemode |
| `webhook-endpoint.json` | `we_1TwCAALA5oeiO5iDBwdOFWMt` | enabled; `…/api/webhooks/stripe` |

## Redaction

No live secret-key value (live secret / restricted / webhook-signing prefixes)
appears in any file. Donor personally identifiable information (name, email,
postal address, phone, card last4 / fingerprint, client secrets, receipt URLs)
is replaced with `"[REDACTED]"`. Only object ids, amounts, statuses, timestamps,
and mode flags needed to verify the validation remain.

Verify locally that no real key values are present:

```sh
grep -rIE '(sk|rk)_live_[0-9A-Za-z]{20,}|whsec_[0-9A-Za-z]{20,}' \
  docs/evidence/stripe-live-validation/   # → no matches
```
