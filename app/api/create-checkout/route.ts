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

    if (!amount || amount < 1) {
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
        "line_items[0][price_data][unit_amount]": String(Math.round(amount * 100)),
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

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
