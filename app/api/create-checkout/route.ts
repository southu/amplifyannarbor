import { NextRequest, NextResponse } from "next/server";

// Cloudflare Pages (next-on-pages) requires the edge runtime.
export const runtime = "edge";

/**
 * Live-mode server-side Stripe Checkout for the donate flow.
 *
 * Why this exists: static Stripe Payment Links (the browser donate path in
 * DonationForm) cannot set a cancel/return URL — a Checkout Session created
 * from a Payment Link always reports cancel_url = https://stripe.com. To make
 * the checkout back/cancel link return to https://amplifyannarbor.com/donate
 * we must create the Checkout Session ourselves and pass cancel_url explicitly.
 *
 * Secret handling: the Stripe secret key is read ONLY from the
 * STRIPE_SECRET_KEY environment variable — never hardcoded. This endpoint is
 * strictly live-mode: if no live key (a full sk_live_ secret key OR a
 * restricted rk_live_ key scoped to Checkout Sessions) is configured it
 * responds 404, so production never advertises a non-live payment surface.
 * When that happens the client transparently falls back to the live Payment
 * Links, so the donate flow keeps working. Once a live key is present in the
 * Cloudflare Pages environment, this path activates automatically.
 *
 * Live price IDs mirror the donate tiers 1:1 (see public/stripe-cutover.json).
 * Amounts, tiers and copy are unchanged — this is a URL/config swap only.
 */

const SUCCESS_URL = "https://amplifyannarbor.com/donate/success";
const CANCEL_URL = "https://amplifyannarbor.com/donate";
const DONATION_NAME = "Donation to Ann Arbor Meals on Wheels";

// Live-mode Price objects, one per preset tier (from the step-3 cutover map).
const LIVE_PRICE_BY_AMOUNT: Record<number, string> = {
  10: "price_1Tw7WJLA5oeiO5iDl90qqkmh",
  25: "price_1Tw7WKLA5oeiO5iDRf7ZUupf",
  50: "price_1Tw7WKLA5oeiO5iDeacCNoYu",
  100: "price_1Tw7WLLA5oeiO5iDMQn9Sg5F",
  250: "price_1Tw7WLLA5oeiO5iDd9xBRLlV",
  500: "price_1Tw7WMLA5oeiO5iDqWd9SyMu",
};

// A live-mode server key: either a full secret key (sk_live_) or a restricted
// key (rk_live_) scoped to Checkout Session creation. Both authenticate live
// Stripe API calls; a restricted key is the safer credential an operator is
// likely to provision, so accept it too. Test-mode keys (sk_test_/rk_test_)
// and publishable keys (pk_*) are intentionally rejected.
function isLiveSecret(key: string | undefined): key is string {
  return (
    typeof key === "string" &&
    (key.startsWith("sk_live_") || key.startsWith("rk_live_"))
  );
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;

  // Live-mode only. Without a live secret key we behave as if the route does
  // not exist so no non-live payment surface is exposed; the client falls back
  // to the live Payment Links.
  if (!isLiveSecret(secret)) {
    return new NextResponse(null, { status: 404 });
  }

  let body: {
    amount?: number;
    email?: string;
    name?: string;
    message?: string;
    custom?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 1) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const ref = [body.name?.trim(), body.message?.trim() ? `msg:${body.message.trim().slice(0, 80)}` : ""]
    .filter(Boolean)
    .join("|")
    .slice(0, 200);

  // Shared session params (cancel_url back to /donate is the whole point of this
  // route). The line item is filled in per-attempt below.
  const baseParams = () => {
    const p = new URLSearchParams();
    p.set("mode", "payment");
    p.set("success_url", SUCCESS_URL);
    p.set("cancel_url", CANCEL_URL);
    p.set("submit_type", "donate");
    if (body.email) p.set("customer_email", body.email);
    if (ref) p.set("client_reference_id", ref);
    return p;
  };

  // Custom (donor-entered) amount -> ad-hoc live price_data at that amount.
  const withPriceData = () => {
    const p = baseParams();
    p.set("line_items[0][price_data][currency]", "usd");
    p.set("line_items[0][price_data][unit_amount]", String(Math.round(amount * 100)));
    p.set("line_items[0][price_data][product_data][name]", DONATION_NAME);
    p.set("line_items[0][quantity]", "1");
    return p;
  };

  async function createSession(params: URLSearchParams) {
    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const session = (await resp.json()) as { url?: string; error?: { message?: string } };
    return { ok: resp.ok && !!session.url, session };
  }

  // Preferred for preset tiers: the live Price object from the step-3 map. But
  // if that Price ID is ever stale/absent in the live account, DON'T silently
  // fall back to a Payment Link (which cannot set cancel_url and would fail
  // AC4) — instead re-create the session with dynamic price_data at the SAME
  // amount, so we still return a live checkout.stripe.com session whose
  // cancel_url points at /donate. Amounts stay identical either way.
  const presetPrice = !body.custom ? LIVE_PRICE_BY_AMOUNT[amount] : undefined;

  let result;
  if (presetPrice) {
    const p = baseParams();
    p.set("line_items[0][price]", presetPrice);
    p.set("line_items[0][quantity]", "1");
    result = await createSession(p);
    if (!result.ok) {
      // Preset live Price failed — retry once with equivalent price_data.
      result = await createSession(withPriceData());
    }
  } else {
    result = await createSession(withPriceData());
  }

  if (!result.ok) {
    return NextResponse.json(
      { error: result.session.error?.message || "Unable to create checkout session" },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: result.session.url });
}
