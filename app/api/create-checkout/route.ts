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
 * strictly live-mode: if no live secret key (sk_live_) is configured it
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

function isLiveSecret(key: string | undefined): key is string {
  return typeof key === "string" && key.startsWith("sk_live_");
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

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", SUCCESS_URL);
  params.set("cancel_url", CANCEL_URL);
  params.set("submit_type", "donate");

  const presetPrice = !body.custom ? LIVE_PRICE_BY_AMOUNT[amount] : undefined;
  if (presetPrice) {
    // Fixed preset tier -> its live Price object (amount unchanged).
    params.set("line_items[0][price]", presetPrice);
    params.set("line_items[0][quantity]", "1");
  } else {
    // Custom amount -> ad-hoc live price_data at the donor-entered amount.
    params.set("line_items[0][price_data][currency]", "usd");
    params.set("line_items[0][price_data][unit_amount]", String(Math.round(amount * 100)));
    params.set("line_items[0][price_data][product_data][name]", DONATION_NAME);
    params.set("line_items[0][quantity]", "1");
  }

  if (body.email) params.set("customer_email", body.email);
  const ref = [body.name?.trim(), body.message?.trim() ? `msg:${body.message.trim().slice(0, 80)}` : ""]
    .filter(Boolean)
    .join("|")
    .slice(0, 200);
  if (ref) params.set("client_reference_id", ref);

  const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const session = (await resp.json()) as { url?: string; error?: { message?: string } };
  if (!resp.ok || !session.url) {
    return NextResponse.json(
      { error: session.error?.message || "Unable to create checkout session" },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: session.url });
}
