import { loadStripe, Stripe } from "@stripe/stripe-js";
import StripeServer from "stripe";

let stripePromise: Promise<Stripe | null>;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}

// Server-side Stripe client
export function getStripeServer(): StripeServer {
  return new StripeServer(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
  });
}

