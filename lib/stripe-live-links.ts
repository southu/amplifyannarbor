/**
 * Live-mode Stripe Payment Link map for production donate.
 * URLs are public Payment Links (not secrets). Regenerated via ops script /
 * public/stripe-live-links.json when tiers change.
 *
 * Using Payment Links avoids depending on Cloudflare Pages STRIPE_SECRET_KEY
 * for the browser donate path (CF token on madcat is currently read-only).
 */
export const STRIPE_LIVE_LINKS = {
  mode: "live" as const,
  byAmount: {
    10: "https://donate.stripe.com/6oUcN62KSaoIc3acMofnO00",
    25: "https://donate.stripe.com/fZu14o0CKaoIffmaEgfnO01",
    50: "https://donate.stripe.com/7sYeVe4T068sebi27KfnO02",
    100: "https://donate.stripe.com/aFa5kE2KSgN67MU4fSfnO03",
    250: "https://donate.stripe.com/8x2bJ21GO7cw3wE13GfnO04",
    500: "https://donate.stripe.com/dRm9AU4T00O8gjqeUwfnO05",
  } as Record<number, string>,
  custom: "https://donate.stripe.com/dRm00kgBI1Scd7e13GfnO06",
  successUrl: "https://amplifyannarbor.com/donate/success",
  cancelUrl: "https://amplifyannarbor.com/donate",
};

/** Build a live Payment Link URL with optional prefilled email. */
export function liveDonateUrl(
  amount: number | "custom",
  opts?: { email?: string; clientReferenceId?: string }
): string {
  let base: string | undefined;
  if (amount === "custom") {
    base = STRIPE_LIVE_LINKS.custom;
  } else {
    base = STRIPE_LIVE_LINKS.byAmount[amount];
  }
  if (!base) {
    // Fall back to custom link so we never send donors to a test checkout.
    base = STRIPE_LIVE_LINKS.custom;
  }
  const url = new URL(base);
  if (opts?.email) {
    url.searchParams.set("prefilled_email", opts.email);
  }
  if (opts?.clientReferenceId) {
    url.searchParams.set("client_reference_id", opts.clientReferenceId.slice(0, 200));
  }
  return url.toString();
}
