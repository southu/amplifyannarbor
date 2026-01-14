import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

// Lazy load stripe and supabase to avoid build errors
async function getStripeServer() {
  const stripe = await import("stripe");
  return new stripe.default(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
  });
}

async function getSupabaseServer() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  const stripe = await getStripeServer();
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

async function handleSuccessfulPayment(session: {
  id: string;
  payment_intent: string | { id: string } | null;
  amount_total: number | null;
  metadata: {
    donor_name?: string;
    donor_email?: string;
    message?: string;
    type?: string;
    event_id?: string;
  } | null;
}) {
  const supabase = await getSupabaseServer();
  const metadata = session.metadata || {};

  const paymentIntentId = typeof session.payment_intent === 'string' 
    ? session.payment_intent 
    : session.payment_intent?.id || session.id;

  // Record the donation in Supabase
  const { data: donation, error: donationError } = await supabase
    .from("donations")
    .insert({
      donor_name: metadata.donor_name || "Anonymous",
      donor_email: metadata.donor_email || "",
      amount: (session.amount_total || 0) / 100, // Convert from cents
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
    await generateTicket(supabase, donation, metadata);
  }
}

async function generateTicket(
  supabase: Awaited<ReturnType<typeof getSupabaseServer>>,
  donation: { id: string; donor_name: string; donor_email: string },
  metadata: { event_id?: string }
) {
  // Generate QR code data
  const ticketData = {
    ticketId: `TKT-${donation.id}`,
    event: metadata.event_id,
    donor: donation.donor_name,
  };

  try {
    // Generate QR code as data URL
    const qrCode = await QRCode.toDataURL(JSON.stringify(ticketData), {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    // Create ticket record
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .insert({
        event_id: metadata.event_id,
        donor_name: donation.donor_name,
        donor_email: donation.donor_email,
        quantity: 1,
        donation_id: donation.id,
        qr_code: qrCode,
        checked_in: false,
      })
      .select()
      .single();

    if (ticketError) {
      console.error("Error creating ticket:", ticketError);
      return;
    }

    console.log("Ticket generated:", ticket.id);

    // TODO: Send email with ticket QR code using a service like SendGrid
    // await sendTicketEmail(donation.donor_email, donation.donor_name, ticket, qrCode);
  } catch (error) {
    console.error("Error generating ticket:", error);
  }
}
