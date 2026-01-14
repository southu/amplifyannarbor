import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

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

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      );
    }
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://amplifyannarbor.com";

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
