// Client-side Stripe helper.
//
// This module is safe to import from client components: it only touches the
// publishable key, which is exposed to the browser via NEXT_PUBLIC_*. The
// server SDK and the secret key live in `lib/stripe-server.ts` and must never
// be imported here, so secret material can never be bundled into the browser.
import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}
