#!/usr/bin/env node
/**
 * create-live-stripe-prices.mjs
 *
 * Step-2 Stripe live-mode cutover helper for Amplify Ann Arbor
 * (Ann Arbor Meals on Wheels).
 *
 * WHAT THIS DOES
 *   Given a LIVE Stripe secret key, this script:
 *     1. Verifies the live account is activated (charges_enabled + payouts_enabled).
 *     2. Idempotently creates one live-mode Product + Price for every donation
 *        tier (the $10/$25/$50/$100/$250/$500 presets plus the custom-amount
 *        option), matching the amounts/currency/description the live donate flow
 *        (app/api/create-checkout/route.ts) uses today.
 *     3. Rewrites public/stripe-cutover.json with the resulting real live
 *        product_id / price_id values and the live activation booleans.
 *
 *   Re-running is safe: tiers are keyed by a stable `lookup_key` / metadata
 *   marker, so an existing live Price is reused instead of duplicated.
 *
 * WHY IT IS NOT ALREADY RUN
 *   The builder/CI environment has NO live Stripe secret key. The only Stripe
 *   key configured for the site is test-mode (in Cloudflare Pages env, not
 *   reachable here). Real `price_…` identifiers are NEVER fabricated: this file
 *   feeds a mapping served on the charity's live production site, and inventing
 *   fake live IDs would be dishonest and would break live checkout at the real
 *   cutover. So public/stripe-cutover.json keeps live_price_id = null until a
 *   human provisions the live key and runs this script.
 *
 * USAGE (never commit the key; pass it only via env)
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/create-live-stripe-prices.mjs
 *   # then review the diff to public/stripe-cutover.json, commit, and push.
 *
 * SECURITY
 *   - Reads the key ONLY from process.env.STRIPE_SECRET_KEY.
 *   - Refuses to run with a test-mode key (sk_test_/rk_test_) — live IDs must
 *     be created in live mode.
 *   - Never prints, logs, or writes the secret key anywhere.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "..", "public", "stripe-cutover.json");

// Donation tiers as used by the live donate flow (dynamic price_data today).
// amount_minor is the Stripe unit_amount (cents). custom_amount has no fixed
// amount; it documents the free-entry option (minimum $1).
const PRESETS = [
  { tier: "preset_10", amount_minor: 1000, description: "Donation to Ann Arbor Meals on Wheels" },
  { tier: "preset_25", amount_minor: 2500, description: "Donation to Ann Arbor Meals on Wheels" },
  { tier: "preset_50", amount_minor: 5000, description: "Donation to Ann Arbor Meals on Wheels (default preset)" },
  { tier: "preset_100", amount_minor: 10000, description: "Donation to Ann Arbor Meals on Wheels" },
  { tier: "preset_250", amount_minor: 25000, description: "Donation to Ann Arbor Meals on Wheels" },
  { tier: "preset_500", amount_minor: 50000, description: "Donation to Ann Arbor Meals on Wheels" },
];
const CURRENCY = "usd";
const PRODUCT_NAME = "Donation to Ann Arbor Meals on Wheels";
const CUSTOM_MIN_MINOR = 100; // $1 minimum

function die(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) die("STRIPE_SECRET_KEY is not set. Provide a LIVE key via env.");
  if (key.startsWith("sk_test_") || key.startsWith("rk_test_")) {
    die("STRIPE_SECRET_KEY is a TEST-mode key. Live price IDs must be created with a LIVE key (sk_live_/rk_live_).");
  }
  if (!(key.startsWith("sk_live_") || key.startsWith("rk_live_"))) {
    die("STRIPE_SECRET_KEY does not look like a live secret key (expected sk_live_/rk_live_).");
  }

  const stripe = new Stripe(key, { apiVersion: "2024-06-20" });

  // 1) Activation gate — a non-activated account rejects live charges.
  const account = await stripe.accounts.retrieve();
  const chargesEnabled = Boolean(account.charges_enabled);
  const payoutsEnabled = Boolean(account.payouts_enabled);
  if (!chargesEnabled || !payoutsEnabled) {
    die(
      `Live account ${account.id} not fully activated ` +
        `(charges_enabled=${chargesEnabled}, payouts_enabled=${payoutsEnabled}). ` +
        "Finish business details + attach a payout bank account first."
    );
  }
  console.log(`Live account ${account.id} activated (charges + payouts enabled).`);

  // 2) Idempotently create one live Price per preset tier.
  async function ensurePrice({ tier, amount_minor }) {
    const lookup_key = `amplify_${tier}_live`;
    const existing = await stripe.prices.list({ lookup_keys: [lookup_key], limit: 1 });
    if (existing.data.length) {
      const p = existing.data[0];
      console.log(`  ${tier}: reused ${p.id} (${p.product})`);
      return { price_id: p.id, product_id: String(p.product) };
    }
    const product = await stripe.products.create({
      name: PRODUCT_NAME,
      description: "via Amplify Ann Arbor",
      metadata: { amplify_tier: tier },
    });
    const price = await stripe.prices.create({
      product: product.id,
      currency: CURRENCY,
      unit_amount: amount_minor,
      lookup_key,
      metadata: { amplify_tier: tier },
    });
    console.log(`  ${tier}: created ${price.id} (${product.id})`);
    return { price_id: price.id, product_id: product.id };
  }

  const liveByTier = {};
  for (const preset of PRESETS) {
    liveByTier[preset.tier] = await ensurePrice(preset);
  }

  // Custom-amount tier: a live Product (used with dynamic amounts) plus a live
  // Price at the $1 minimum so the tier has a real live price_… identifier.
  {
    const tier = "custom_amount";
    const lookup_key = "amplify_custom_amount_live";
    const existing = await stripe.prices.list({ lookup_keys: [lookup_key], limit: 1 });
    if (existing.data.length) {
      const p = existing.data[0];
      liveByTier[tier] = { price_id: p.id, product_id: String(p.product) };
      console.log(`  ${tier}: reused ${p.id} (${p.product})`);
    } else {
      const product = await stripe.products.create({
        name: "Custom donation to Ann Arbor Meals on Wheels",
        description: "Custom donation amount (free entry, minimum $1) via Amplify Ann Arbor",
        metadata: { amplify_tier: tier },
      });
      const price = await stripe.prices.create({
        product: product.id,
        currency: CURRENCY,
        unit_amount: CUSTOM_MIN_MINOR,
        lookup_key,
        metadata: { amplify_tier: tier, pricing_model: "dynamic_price_data" },
      });
      liveByTier[tier] = { price_id: price.id, product_id: product.id };
      console.log(`  ${tier}: created ${price.id} (${product.id})`);
    }
  }

  // 3) Rewrite public/stripe-cutover.json with real live IDs (no secrets).
  const doc = JSON.parse(readFileSync(OUT_PATH, "utf8"));
  doc.status = "live_prices_created";
  delete doc.blocker;
  doc.activation.charges_enabled = chargesEnabled;
  doc.activation.payouts_enabled = payoutsEnabled;
  for (const tier of doc.tiers) {
    const live = liveByTier[tier.tier];
    if (!live) continue;
    tier.live_price_id = live.price_id;
    tier.live_product_id = live.product_id;
    tier.status = "live";
  }
  writeFileSync(OUT_PATH, JSON.stringify(doc, null, 2) + "\n");
  console.log(`Wrote ${OUT_PATH}. Review the diff, then commit and push.`);
}

main().catch((err) => die(err?.message || String(err)));
