import { NextRequest, NextResponse } from "next/server";
import { createCheckout } from "@/lib/shopify";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lineItems } = body;

    if (!lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    const checkout = await createCheckout(lineItems);

    if (!checkout) {
      return NextResponse.json(
        { error: "Failed to create checkout" },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl: checkout.webUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}

