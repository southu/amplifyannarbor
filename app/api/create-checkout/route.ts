import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Returns an absolute https origin with no trailing slash, so it can be safely
// concatenated with a path to build a valid Stripe redirect URL.
function normalizeSiteUrl(raw: string): string {
  const trimmed = raw.trim();
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return withScheme.replace(/\/+$/, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, name, email, message } = body;

    // Coerce and validate the donation amount up front. A bare `amount < 1`
    // check lets non-numeric input through (e.g. "abc" < 1 is false), which
    // would later produce a `unit_amount` of "NaN" and a confusing Stripe 500.
    // Require a finite number of at least $1 so callers get a clean 400 instead.
    const numericAmount = typeof amount === "number" ? amount : Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 1) {
      return NextResponse.json(
        { error: "Invalid donation amount" },
        { status: 400 }
      );
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Stripe mode (test vs live) is governed ENTIRELY by which secret key the
    // deployment environment supplies here: dev/CI configure a test key
    // (sk_test_...), the Cloudflare Pages production environment supplies the
    // live key (sk_live_...). The key is never hardcoded — it is read only from
    // STRIPE_SECRET_KEY. The dynamic price_data below produces correctly-priced
    // sessions in whichever mode the key selects, so no test-mode price/link
    // identifiers are ever embedded in source.
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      );
    }

    // Optional fail-closed guard for the live cutover. When STRIPE_REQUIRE_LIVE
    // is set truthy (production should set it once the live key is in place),
    // a test-mode key is refused *before* any Stripe call, so a misconfigured
    // deploy returns a clean error instead of silently minting sandbox
    // ("Amplify Ann Arbor sandbox") checkout sessions that never collect a real
    // donation. Detection is a non-secret prefix check — the key value is never
    // logged or returned. Default (flag unset) is a no-op, so dev/CI and the
    // current production behavior are unchanged.
    // Always refuse minting sandbox sessions when the request is clearly for
    // production amplifyannarbor.com — the public donate form uses live Payment
    // Links, and this API must not reintroduce cs_test_ checkouts on the live
    // domain if CF Pages still holds a test secret.
    const host = (request.headers.get("host") || "").toLowerCase();
    const isProdHost =
      host === "amplifyannarbor.com" ||
      host === "www.amplifyannarbor.com" ||
      host.endsWith(".amplifyannarbor.com");
    const requireLive =
      isProdHost ||
      /^(1|true|yes|on)$/i.test((process.env.STRIPE_REQUIRE_LIVE ?? "").trim());
    const keyIsTestMode = /^(sk|rk)_test_/.test(stripeSecretKey.trim());
    if (requireLive && keyIsTestMode) {
      console.error(
        "STRIPE_REQUIRE_LIVE is set but STRIPE_SECRET_KEY is a test-mode key " +
          "(sk_test_/rk_test_). Refusing to create a sandbox Checkout session. " +
          "Set the live key (sk_live_...) in the Cloudflare Pages production " +
          "environment to complete the live cutover."
      );
      return NextResponse.json(
        { error: "Payment system is not in live mode" },
        { status: 503 }
      );
    }

    // Canonical, absolute production site URL for the post-checkout redirects.
    // Stripe requires success_url / cancel_url to be absolute https URLs, and
    // the mission requires them to land on amplifyannarbor.com production pages,
    // so we normalize the configured value (add https:// if a scheme is missing,
    // strip any trailing slash) and fall back to the request host and finally
    // the production domain.
    const siteUrl = normalizeSiteUrl(
      process.env.NEXT_PUBLIC_SITE_URL ||
        request.headers.get("host") ||
        "amplifyannarbor.com"
    );

    // Create Stripe Checkout Session using fetch (edge-compatible)
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": "payment",
        "success_url": `${siteUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
        "cancel_url": `${siteUrl}/donate`,
        "customer_email": email,
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][unit_amount]": String(Math.round(numericAmount * 100)),
        "line_items[0][price_data][product_data][name]": "Donation to Ann Arbor Meals on Wheels",
        "line_items[0][price_data][product_data][description]": "via Amplify Ann Arbor",
        "line_items[0][quantity]": "1",
        "metadata[donor_name]": name,
        "metadata[donor_email]": email,
        "metadata[message]": message || "",
        "metadata[type]": "donation",
      }).toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      console.error("Stripe error:", session);
      return NextResponse.json(
        { error: session.error?.message || "Failed to create checkout session" },
        { status: 500 }
      );
    }

    // Stripe returned 200 but, defensively, guard against a missing hosted
    // Checkout URL so the client never redirects to `undefined`. The url is the
    // Stripe-hosted session (test or live per the secret key) — we do not parse
    // or rewrite it; whichever mode the key selects flows straight through.
    if (!session.url) {
      console.error("Stripe session missing url:", session);
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    // Observability for the test→live cutover: Stripe reports the mode of the
    // created session via `session.livemode` (true for sk_live_ keys, false for
    // sk_test_). We never expose the key, but if the PRODUCTION deployment is
    // still minting test-mode sessions, emit a loud warning so the operator can
    // see in Cloudflare logs that STRIPE_SECRET_KEY is still a test key — the
    // one remaining action to complete the live cutover. This is diagnostic
    // only and never blocks a working checkout.
    const isProdSite = /(^|\.)amplifyannarbor\.com$/i.test(
      normalizeSiteUrl(siteUrl).replace(/^https?:\/\//i, "")
    );
    if (isProdSite && session.livemode === false) {
      console.warn(
        "STRIPE MODE WARNING: production site is creating TEST-mode Checkout " +
          "sessions (session.livemode=false). Set STRIPE_SECRET_KEY to the " +
          "live key (sk_live_...) in the Cloudflare Pages production environment " +
          "to complete the live cutover."
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
