# Stripe test → live cutover — verification evidence

This document records the contamination sweep and production verification for the
Stripe test-to-live cutover of the Amplify Ann Arbor donate flow.

## Summary

- The `/donate` page serves **live** Stripe Payment Links (`https://buy.stripe.com/…`,
  live-mode, merchant `acct_1SpYReLA5oeiO5iD`) rendered directly into the HTML page
  source, so the live payment mechanism is present without JavaScript.
- The interactive `DonationForm` prefers a live server-side Checkout Session
  (`/api/create-checkout`, which is strictly live-only) and transparently falls back
  to the same live Payment Links.
- **Zero** test-mode strings (`pk_test_`, `sk_test_`, `buy.stripe.com/test_`) appear in
  any production code path (`app/`, `components/`, `lib/`, `public/`), in the served
  `/donate` HTML, or in any JS bundle it references.
- No secret key (`sk_live_`, `sk_test_`, `rk_*`) appears anywhere in shipped code or
  served output. The live secret key lives only in the Cloudflare Pages production
  secret store; the only Stripe values in shipped code are the public `buy.stripe.com`
  Payment Link URLs.

## What changed this cutover

- `lib/stripe-live-links.ts` / `public/stripe-live-links.json` / `public/stripe-cutover.json`:
  the live Payment Link URLs now use the canonical `buy.stripe.com` domain (the same
  link codes previously served under `donate.stripe.com`; both domains resolve the same
  live links — verified HTTP 200 + live merchant via the Stripe merchant API).
- `app/donate/page.tsx`: renders the six preset live `buy.stripe.com` Payment Links
  server-side, so the live payment mechanism is in the served HTML page source.
- `README.md`: dev-setup env template no longer inlines literal `pk_test_`/`sk_test_`
  placeholders (points to `.env.example` instead).

Test-mode key strings that intentionally remain are confined to non-shipping files:
`.env.example` and `.dev.vars.example` (env templates), `scripts/*.mjs` (ops scripts
whose guards *refuse* to run with a test key), and `docs/*.md` (this and the audit doc).
None of these are bundled into the production Next.js output.

---

## Evidence 1 — Repo contamination sweep (production code paths)

Command:

```
$ grep -rn 'pk_test_\|sk_test_\|buy.stripe.com/test_' app components lib public
(zero matches)
```

Result: **zero matches.** No test-mode Stripe string exists in any code path that
ships to production.

Whole-repo sweep (for completeness) — the only remaining matches are in allowed
env-example templates, non-shipping ops scripts, and documentation:

```
$ grep -rn 'pk_test_\|sk_test_\|buy.stripe.com/test_' . \
    (excluding node_modules, .git, .next)
.dev.vars.example:13:STRIPE_SECRET_KEY=sk_test_xxx            # env template (not shipped)
.env.example:6,18,20                                          # env template (not shipped)
scripts/create-live-stripe-prices.mjs:36,72                   # ops guard: refuses test keys
scripts/finish-live-cutover.mjs:68                            # ops diagnostic: prints prefix only
docs/stripe-cutover-inventory.md, docs/stripe-live-cutover.md # documentation
```

Live payment-link presence in the repo (all `buy.stripe.com`, none contain `/test_`):

```
$ grep -rn 'buy.stripe.com' lib public | grep -v '/test_'
lib/stripe-live-links.ts:  10/25/50/100/250/500/custom → https://buy.stripe.com/…
public/stripe-live-links.json, public/stripe-cutover.json → https://buy.stripe.com/…
```

## Evidence 2 — Local production build output

`next build` succeeds; `/donate` is statically prerendered.

Built HTML page source (`.next/server/app/donate.html`):

```
$ grep -oE 'https://buy.stripe.com/[A-Za-z0-9]+' .next/server/app/donate.html | sort -u
https://buy.stripe.com/6oUcN62KSaoIc3acMofnO00
https://buy.stripe.com/7sYeVe4T068sebi27KfnO02
https://buy.stripe.com/8x2bJ21GO7cw3wE13GfnO04
https://buy.stripe.com/aFa5kE2KSgN67MU4fSfnO03
https://buy.stripe.com/dRm9AU4T00O8gjqeUwfnO05
https://buy.stripe.com/fZu14o0CKaoIffmaEgfnO01

$ for s in pk_test_ sk_test_ buy.stripe.com/test_ sk_live_; do echo "$s: $(grep -c "$s" .next/server/app/donate.html)"; done
pk_test_: 0
sk_test_: 0
buy.stripe.com/test_: 0
sk_live_: 0
```

All static JS chunks:

```
$ grep -rl 'pk_test_\|sk_test_\|buy.stripe.com/test_\|sk_live_' .next/static
(no matches)
```

---

## Evidence 3 — Deployed production sweep

_Captured against the deployed SHA after push; see the section appended below._
