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

## Re-verification log

Each builder iteration re-checks the live state without creating any new live
charge (the one authorized validation donation `pi_3TwC0JLA5oeiO5iD1orSRs3v`
was already created and fully refunded). Entries are newest-first.

### 2026-07-23 — run 081615 iter1 (unchanged: operator blocker)

Fresh run/iteration; fail-closed re-verification with **no state change**. No
live charge, refund, subscription, or any Stripe/endpoint write performed — the
one authorized validation donation `pi_3TwC0JLA5oeiO5iD1orSRs3v` stays
created-and-fully-refunded, so per the one-charge hard constraint this iteration
verified from existing records only.

- **Builder Stripe credential: ABSENT.** `env | grep -c '^STRIPE_' == 0`; zero
  `sk_live_`/`rk_live_`/`whsec_` key-shaped value anywhere in env; no `stripe`
  CLI on PATH. No key sourced from mission/repo/TESTLOG (fail-closed).
- **Operator secret store: LOCKED.** Vault `/health` 200 but `/api/items` → 401
  `{"error":"locked"}`; `RATCHET_PROVISION_ENABLED=false`,
  `RATCHET_PROVISION_ENV_FROM_VAULT_COUNT=0` (0 secrets injected).
- **BUG-2 (AC3/7/8/13):** still blocked — no restricted live read key, so the
  tester's live-mode Stripe GETs cannot run.
- **BUG-1 (AC6):** still blocked — `evt_1TwC0NLA5oeiO5iDUmzugqyy` stays
  `pending_webhooks=1` (`signature_secret_mismatch`); closing it needs the
  operator to set the endpoint `whsec_…` as the Pages `STRIPE_WEBHOOK_SECRET`.
- **Live site regression:** `/`, `/donate`, `/donate/success`, `/version` all
  **200**; `/version` body `05a4b48…` == HEAD (pre-commit). `/donate` one-time
  only (AC9: no recurring tiers).
- **AC12 clean:** `git grep '(sk|rk)_live_[A-Za-z0-9]{6,}|whsec_[A-Za-z0-9]{16,}'`
  over the committed tree (excluding `*.example`) returns no matches.
- **Evidence intact (AC10/11):** runbook + all evidence JSON present; refund
  `pyr_1TwCpqLA5oeiO5iDwP3f3IdN` `status=succeeded`, balance-txn `net=4825`.

**Blocker owner: operator.** Unchanged from run 073815. See
`docs/stripe-cutover-runbook.md` and `webhook-delivery-status.json`.

### 2026-07-23 — run 071608 iter3 (unchanged: operator blocker; final iteration)

Fail-closed re-verification; **no state change** from iter1/iter2. This is the
last authorized iteration (`RATCHET_LIMITS_MAX_ITERATIONS=3`); both open bugs
remain **operator-owned** and cannot be closed from the builder runtime.

- **Credentials:** 0 non-empty `STRIPE_*` env vars; zero
  `sk_live_`/`rk_live_`/`whsec_` key-shaped value anywhere in the environment;
  no `stripe` CLI on PATH.
- **Vault:** `/health` 200 but **LOCKED** to builder (`/api/items` →
  `{"error":"locked"}` HTTP 401); `RATCHET_PROVISION_ENABLED=false`,
  `RATCHET_PROVISION_ENV_FROM_VAULT_COUNT=0` (provider railway). 0 secrets
  injected.
- **Cloudflare token:** present but `/user/tokens/verify` → HTTP 401 code 1000
  (**Invalid API Token**) — unusable, and a `whsec_` roll requires **Stripe
  dashboard write** regardless. No CF Pages secret write attempted.
- **BUG-2 (AC3/7/8/13):** still blocked — no restricted live read key, so the
  required live-mode Stripe GETs cannot run this iteration.
- **BUG-1 (AC6):** still blocked — `evt_1TwC0NLA5oeiO5iDUmzugqyy` stays
  `pending_webhooks=1` (`reason=signature_secret_mismatch`); cannot roll the
  endpoint whsec or set Pages `STRIPE_WEBHOOK_SECRET` without the operator fix.
- **No mutation this run:** no live charge / refund / subscription / any Stripe
  write. Validation donation `pi_3TwC0JLA5oeiO5iD1orSRs3v` remains fully refunded
  (charge `refunded=true`, refund `succeeded`, balance-transaction net 4825).
- **Signature enforcement intact:** production `/api/webhooks/stripe` returns
  **400** for both missing and bogus `stripe-signature` (verification not
  disabled); GET → 405 (POST-only route).
- **Live site regression:** `/`, `/donate`, `/donate/success`, `/version` all
  200; deployed SHA `531c93f` matches HEAD (pre-commit).
- **AC9:** `/donate` is one-time only — no recurring tiers, no subscription test.
- **AC12:** no real live/whsec key value in the tree — only `sk_live_`/`rk_live_`
  prefix references in prose (`TESTLOG.md`) and `whsec_xxx`/`whsec_your_test…`
  placeholders in `.env.example`/`.dev.vars.example`.

**Blocker owner: operator.** Both bugs need Stripe dashboard write access (roll
whsec, provide a restricted read key) plus a Cloudflare Pages production secret
update + redeploy. See `docs/stripe-cutover-runbook.md` §1 and
`webhook-delivery-status.json` for the exact steps.

### 2026-07-23 — run 071608 iter2 (unchanged: operator blocker)

Fail-closed re-verification; **no state change** from iter1.

- **Credentials:** 0 non-empty `STRIPE_*` env vars; zero `sk_live_`/`rk_live_`/`whsec_`
  key-shaped value anywhere in the environment; no `stripe` CLI on PATH.
- **Vault:** `/health` 200 but **LOCKED** to builder (`/api/items` → 401);
  broker secrets endpoint → 404; `RATCHET_PROVISION_ENV_FROM_VAULT_COUNT=0`
  (provisioning disabled, provider railway). 0 secrets injected.
- **Cloudflare token:** present but `/user/tokens/verify` → 401 — cannot roll a
  webhook signing secret regardless, since a `whsec_` requires **Stripe dashboard
  write** access, which is not available. No CF Pages secret write attempted.
- **BUG-2 (AC3/7/8/13):** still blocked — no restricted live read key, so the
  tester cannot perform the required live-mode Stripe GETs this run.
- **BUG-1 (AC6):** still blocked — `evt_1TwC0NLA5oeiO5iDUmzugqyy` stays
  `pending_webhooks=1` (`reason=signature_secret_mismatch`); cannot roll whsec
  or set the Pages `STRIPE_WEBHOOK_SECRET` without the operator fix.
- **No mutation this run:** no live charge / refund / subscription / any Stripe
  write. The validation donation remains fully refunded (charge `refunded=true`,
  refund `succeeded`, balance-transaction net 4825).
- **Signature enforcement intact:** production `/api/webhooks/stripe` returns
  **400** for both missing and bogus `stripe-signature` (verification not
  disabled).
- **Live site regression:** `/`, `/donate`, `/donate/success`, `/version` all
  200; deployed SHA matches HEAD.
- **AC9:** `/donate` is one-time only — no recurring tiers, no subscription test.
- **AC12:** length-bounded scan finds no real live/whsec key value in the tree.

**Blocker owner: operator.** Both bugs need Stripe dashboard write access (roll
whsec, provide a restricted read key) plus a Cloudflare Pages production secret
update + redeploy. See `docs/stripe-cutover-runbook.md` and
`webhook-delivery-status.json` for the exact steps.

### 2026-07-23 — run 073815 iter1 (unchanged: operator blocker)

Fail-closed re-verification; **no state change** from the prior run. No new live
charge was created (HARD CONSTRAINT: the single validation donation already
exists and is refunded — verify from existing records only).

- **Credentials:** 0 `STRIPE_*` env names present; all named keys (`STRIPE_SECRET_KEY`,
  `STRIPE_LIVE_SECRET_KEY`, `STRIPE_RESTRICTED_KEY`, `STRIPE_WEBHOOK_SECRET`, …)
  unset; zero `sk_live_`/`rk_live_`/`whsec_` key-shaped value anywhere in the
  environment; no `stripe` CLI on PATH.
- **Vault:** `/health` 200 but **LOCKED** to builder (`/api/items` → 401);
  `RATCHET_PROVISION_ENABLED=false`, `RATCHET_PROVISION_ENV_FROM_VAULT_COUNT=0`
  (provider railway). 0 secrets injected.
- **BUG-2 (AC3/7/8/13):** still blocked — no restricted live read key, so the
  required live-mode Stripe GETs cannot run this iteration.
- **BUG-1 (AC6):** still blocked — `evt_1TwC0NLA5oeiO5iDUmzugqyy` stays
  `pending_webhooks=1` (`reason=signature_secret_mismatch`); cannot roll the
  endpoint whsec or set the Pages `STRIPE_WEBHOOK_SECRET` without the operator fix.
- **No mutation this run:** no live charge / refund / subscription / any Stripe
  write. Validation donation `pi_3TwC0JLA5oeiO5iD1orSRs3v` remains fully refunded
  (charge `refunded=true`, refund `succeeded`, balance-transaction net 4825).
- **Signature enforcement intact:** production `/api/webhooks/stripe` returns
  **400** for both missing and bogus `stripe-signature` (verification not disabled).
- **Live site regression:** `/`, `/donate`, `/donate/success`, `/version` all
  200; deployed SHA `ee51a79` matches HEAD (pre-commit).
- **AC9:** `/donate` is one-time only — no recurring tiers, no subscription test.
- **AC10/AC11:** runbook + all evidence JSON return 200 via raw.githubusercontent.
- **AC12:** length-bounded scan finds no real live/whsec key value in the tree.

**Blocker owner: operator.** Both bugs need Stripe dashboard write access (roll
whsec, provide a restricted read key) plus a Cloudflare Pages production secret
update + redeploy. See `docs/stripe-cutover-runbook.md` and
`webhook-delivery-status.json` for the exact steps.

### 2026-07-23 — run 073815 iter3 (unchanged: operator blocker)

Fail-closed re-verification; **no state change** from the prior run. No new live
charge was created (HARD CONSTRAINT: the single validation donation already
exists and is refunded — verify from existing records only).

- **Credentials:** 0 real `STRIPE_*` env values present; zero
  `sk_live_`/`rk_live_`/`whsec_` key-shaped value anywhere in the environment;
  no `stripe` CLI on PATH.
- **Vault:** `/health` 200 but **LOCKED** to builder (`/api/items` → 401);
  `RATCHET_PROVISION_ENABLED=false`, `RATCHET_PROVISION_ENV_FROM_VAULT_COUNT=0`
  (provider railway). 0 secrets injected.
- **BUG-2 (AC3/7/8/13):** still blocked — no restricted live read key, so the
  required live-mode Stripe GETs cannot run this iteration.
- **BUG-1 (AC6):** still blocked — `evt_1TwC0NLA5oeiO5iDUmzugqyy` stays
  `pending_webhooks=1` (`reason=signature_secret_mismatch`); cannot roll the
  endpoint whsec or set the Pages `STRIPE_WEBHOOK_SECRET` without the operator fix.
- **No mutation this run:** no live charge / refund / subscription / any Stripe
  write. Validation donation `pi_3TwC0JLA5oeiO5iD1orSRs3v` remains fully refunded
  (charge `refunded=true`, refund `succeeded`, balance-transaction net 4825).
- **Signature enforcement intact:** production `/api/webhooks/stripe` returns
  **400** for both missing and bogus `stripe-signature`, **405** for GET
  (verification not disabled).
- **Webhook registration:** `/api/stripe/webhook-health` reports `registered=true`,
  `url=/api/webhooks/stripe`, `events=[checkout.session.completed]`.
- **Live site regression:** `/`, `/donate`, `/donate/success`, `/version` all
  200; deployed SHA `b00fe90` matches HEAD (pre-commit).
- **AC9:** `/donate` is one-time only — no recurring tiers, no subscription test.
- **AC10/AC11:** runbook + all evidence JSON committed under this directory.
- **AC12:** length-bounded scan finds no real live/whsec key value in the tree.

**Blocker owner: operator.** Both bugs need Stripe dashboard write access (roll
whsec, provide a restricted read key) plus a Cloudflare Pages production secret
update + redeploy. See `docs/stripe-cutover-runbook.md` and
`webhook-delivery-status.json` for the exact steps.

### 2026-07-23 — run 073815 iter2 (unchanged: operator blocker)

Fail-closed re-verification; **no state change** from the prior run. No new live
charge was created (HARD CONSTRAINT: the single validation donation already
exists and is refunded — verify from existing records only).

- **Credentials:** 0 `STRIPE_*` env names present; all named keys (`STRIPE_SECRET_KEY`,
  `STRIPE_LIVE_SECRET_KEY`, `STRIPE_RESTRICTED_KEY`, `STRIPE_WEBHOOK_SECRET`, …)
  unset; zero `sk_live_`/`rk_live_`/`whsec_` key-shaped value anywhere in the
  environment; no `stripe` CLI on PATH.
- **Vault:** `/health` 200 but **LOCKED** to builder (`/api/items` → 401);
  `RATCHET_PROVISION_ENABLED=false`, `RATCHET_PROVISION_ENV_FROM_VAULT_COUNT=0`.
  0 secrets injected.
- **BUG-2 (AC3/7/8/13):** still blocked — no restricted live read key, so the
  required live-mode Stripe GETs cannot run this iteration.
- **BUG-1 (AC6):** still blocked — `evt_1TwC0NLA5oeiO5iDUmzugqyy` stays
  `pending_webhooks=1` (`reason=signature_secret_mismatch`); cannot roll the
  endpoint whsec or set the Pages `STRIPE_WEBHOOK_SECRET` without the operator fix.
- **No mutation this run:** no live charge / refund / subscription / any Stripe
  write. Validation donation `pi_3TwC0JLA5oeiO5iD1orSRs3v` remains fully refunded
  (charge `refunded=true`, refund `succeeded`, balance-transaction net 4825).
- **Signature enforcement intact:** production `/api/webhooks/stripe` returns
  **400** for both missing and bogus `stripe-signature` (verification not disabled).
- **Webhook registration:** `/api/stripe/webhook-health` reports `registered=true`,
  `url=/api/webhooks/stripe`, `events=[checkout.session.completed]`.
- **Live site regression:** `/`, `/donate`, `/donate/success`, `/version` all
  200; deployed SHA `f16636d` matches HEAD (pre-commit).
- **AC9:** `/donate` is one-time only — no recurring tiers, no subscription test.
- **AC10/AC11:** runbook + all evidence JSON committed under this directory.
- **AC12:** length-bounded scan (`git grep '(sk_live_|rk_live_|whsec_)[A-Za-z0-9]{12,}'`)
  finds no real live/whsec key value in the tree.

**Blocker owner: operator.** Both bugs need Stripe dashboard write access (roll
whsec, provide a restricted read key) plus a Cloudflare Pages production secret
update + redeploy. See `docs/stripe-cutover-runbook.md` and
`webhook-delivery-status.json` for the exact steps.

### 2026-07-23 — run 083005 iter2 (unchanged: operator blocker)

Fail-closed re-verification; **no state change** from the prior run. No new live
charge was created (HARD CONSTRAINT: the single validation donation already
exists and is refunded — verify from existing records only).

- **Credentials:** 0 `STRIPE_*` env names present; zero `sk_live_`/`rk_live_`/`whsec_`
  key-shaped value anywhere in the environment; no `stripe` CLI on PATH.
- **Vault:** `/health` 200 but **LOCKED** to builder (`/api/items` -> 401);
  `RATCHET_PROVISION_ENV_FROM_VAULT_COUNT=0`. 0 Stripe secrets injected.
- **BUG-2 (AC3/7/8/13):** still blocked — no restricted live read key, so the
  required live-mode Stripe GETs (PI / charge / refund / balance_transaction /
  events / webhook_endpoints) cannot run this iteration.
- **BUG-1 (AC6):** still blocked — `evt_1TwC0NLA5oeiO5iDUmzugqyy` stays
  `pending_webhooks=1` (`reason=signature_secret_mismatch`); cannot roll the
  endpoint whsec or set the Pages `STRIPE_WEBHOOK_SECRET` without the operator fix.
- **No mutation this run:** no live charge / refund / subscription / any Stripe
  write. Validation donation `pi_3TwC0JLA5oeiO5iD1orSRs3v` remains fully refunded
  (charge `refunded=true`, refund `succeeded`, balance-transaction net 4825) per
  the committed evidence JSON.
- **Signature enforcement intact:** production `/api/webhooks/stripe` returns
  **400** for both missing and bogus `stripe-signature` (verification not disabled).
- **Webhook registration:** `/api/stripe/webhook-health` reports `registered=true`,
  `url=https://amplifyannarbor.com/api/webhooks/stripe`,
  `events=[checkout.session.completed]`.
- **Live site regression:** `/`, `/donate` (donation form + Stripe checkout entry
  present), `/donate/success`, `/version` all 200.
- **AC9:** `/donate` is one-time only — no recurring tiers, no subscription test.
- **AC10/AC11:** runbook + all evidence JSON committed under this directory.
- **AC12:** length-bounded scan (`git grep -E '(sk_live_|rk_live_|whsec_)[A-Za-z0-9]{12,}'`)
  finds no real live/whsec key value in the tree.

**Blocker owner: operator.** Both bugs need Stripe dashboard write access (roll
whsec, provide a restricted read key) plus a Cloudflare Pages production secret
update + redeploy. See `docs/stripe-cutover-runbook.md` and
`webhook-delivery-status.json` for the exact steps.

### 2026-07-23 — run 083005 iter3 (unchanged: operator blocker)

Fail-closed re-verification; **no state change** from prior runs. No new live
charge (HARD CONSTRAINT: the single validation donation already exists and is
refunded — verify from existing records only). No refund, subscription, or any
Stripe/endpoint mutation this iteration.

- **Credentials:** 0 non-empty `STRIPE_*` env vars; no `sk_live_`/`rk_live_`/`whsec_`
  key-shaped value anywhere in the environment; no `stripe` CLI on PATH.
- **Vault:** `VAULT_URL=http://127.0.0.1:8379` `/health` 200 but **LOCKED**
  (`/api/items` -> 401 `{"error":"locked"}`, `/api/secrets` -> 404);
  `RATCHET_PROVISION_ENABLED=false`, `RATCHET_PROVISION_ENV_FROM_VAULT_COUNT=0`.
- **BUG-1 (AC6):** still blocked — `evt_1TwC0NLA5oeiO5iDUmzugqyy` stays
  `pending_webhooks=1` (`reason=signature_secret_mismatch`). Fixing it needs the
  operator to roll the `we_1TwCA…` signing secret, set the Cloudflare Pages
  production `STRIPE_WEBHOOK_SECRET` to the new `whsec_…`, redeploy, then resend
  the event — none of which the builder can do without Stripe write + CF Pages write.
- **Signature enforcement intact:** production `/api/webhooks/stripe` returns
  **400** for both missing and bogus `stripe-signature` (verification NOT disabled).
- **State unchanged:** validation donation `pi_3TwC0JLA5oeiO5iD1orSRs3v` remains
  fully refunded (charge `refunded=true`, refund `succeeded`, balance-transaction
  net 4825 pending) per the committed evidence JSON.
- **Live site regression:** `/`, `/donate`, `/donate/success`, `/version` all 200;
  `/version` body `c0638fd…` matches HEAD before this commit.
- **AC9:** `/donate` one-time only — no recurring tiers, no subscription test.
- **AC10/AC11:** runbook + all evidence JSON committed under this directory.
- **AC12:** no real `sk_live_`/`rk_live_`/`whsec_` key value in the tree (only
  documented `whsec_xxx` placeholders and prefix/prose references).

**Blocker owner: operator.** See `docs/stripe-cutover-runbook.md` and
`webhook-delivery-status.json` for the exact one-time fix steps.
