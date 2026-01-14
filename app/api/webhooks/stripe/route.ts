import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
  });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await handleSuccessfulPayment(session);
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      console.log("Payment failed:", paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const metadata = session.metadata || {};

  const paymentIntentId = typeof session.payment_intent === 'string' 
    ? session.payment_intent 
    : session.id;

  // Record the donation in Supabase
  const { data: donation, error: donationError } = await supabase
    .from("donations")
    .insert({
      donor_name: metadata.donor_name || "Anonymous",
      donor_email: metadata.donor_email || "",
      amount: (session.amount_total || 0) / 100,
      stripe_payment_id: paymentIntentId,
      event_id: metadata.event_id || null,
      message: metadata.message || null,
    })
    .select()
    .single();

  if (donationError) {
    console.error("Error recording donation:", donationError);
    return;
  }

  console.log("Donation recorded:", donation.id);

  // If this is a ticket purchase, generate a ticket
  if (metadata.type === "ticket" && metadata.event_id) {
    const { error: ticketError } = await supabase
      .from("tickets")
      .insert({
        event_id: metadata.event_id,
        donor_name: donation.donor_name,
        donor_email: donation.donor_email,
        quantity: 1,
        donation_id: donation.id,
        checked_in: false,
      });

    if (ticketError) {
      console.error("Error creating ticket:", ticketError);
    } else {
      console.log("Ticket created for donation:", donation.id);
    }
  }
}
