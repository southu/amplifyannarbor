// Server-side Stripe client.
//
// Kept separate from the client helper (`lib/stripe.ts`) so the server SDK and
// STRIPE_SECRET_KEY are never reachable from client component import graphs.
// Only import this from server code (API routes / edge functions). The secret
// key is read from the environment (Cloudflare Pages secret store in production)
// and never hardcoded.
import StripeServer from "stripe";

export function getStripeServer(): StripeServer {
  return new StripeServer(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
  });
}
