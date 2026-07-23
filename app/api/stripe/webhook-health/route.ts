import { NextResponse } from "next/server";

// Cloudflare Pages (next-on-pages) requires the edge runtime.
export const runtime = "edge";

/**
 * Non-secret diagnostics: confirms a live Stripe webhook endpoint is registered
 * for this site's webhook route. It queries the Stripe live API server-side
 * (using STRIPE_SECRET_KEY, which is never returned) and reports ONLY the
 * endpoint's public url and subscribed events.
 *
 * Guarantees:
 *  - No secret material ever appears in the response (no whsec_, sk_live_, or
 *    rk_live_ substrings) — we only echo the endpoint url and enabled_events.
 *  - Any failure (missing key, network error, Stripe error) yields
 *    { registered: false } with HTTP 200 rather than an error.
 */

// The production webhook route this diagnostics endpoint reports on.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://amplifyannarbor.com").replace(/\/$/, "");
const WEBHOOK_PATH = "/api/webhooks/stripe";
const EXPECTED_WEBHOOK_URL = `${SITE_URL}${WEBHOOK_PATH}`;

type StripeWebhookEndpoint = {
  url?: string;
  enabled_events?: string[];
  status?: string;
};

// Never allow secret-looking substrings to leak into the response, even if an
// upstream value is unexpectedly malformed.
function isSafe(value: string): boolean {
  return !/whsec_|sk_live_|rk_live_/.test(value);
}

export async function GET() {
  const notRegistered = NextResponse.json({ registered: false });

  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return notRegistered;
    }

    const resp = await fetch("https://api.stripe.com/v1/webhook_endpoints?limit=100", {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (!resp.ok) {
      return notRegistered;
    }

    const data = (await resp.json()) as { data?: StripeWebhookEndpoint[] };
    const endpoints = Array.isArray(data.data) ? data.data : [];

    // Match the endpoint registered for this site's webhook route.
    const match = endpoints.find((e) => {
      if (!e.url) return false;
      if (e.url === EXPECTED_WEBHOOK_URL) return true;
      try {
        const u = new URL(e.url);
        return u.host === new URL(SITE_URL).host && u.pathname === WEBHOOK_PATH;
      } catch {
        return false;
      }
    });

    if (!match || !match.url) {
      return notRegistered;
    }

    const events = (match.enabled_events || []).filter(
      (ev): ev is string => typeof ev === "string" && isSafe(ev)
    );

    if (!isSafe(match.url)) {
      return notRegistered;
    }

    return NextResponse.json({
      registered: true,
      url: match.url,
      events,
    });
  } catch {
    // Never error out — diagnostics degrade to registered:false.
    return notRegistered;
  }
}
