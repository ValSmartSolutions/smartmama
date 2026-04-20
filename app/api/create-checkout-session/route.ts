import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "../../../lib/supabase/server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(stripeSecretKey);

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Не си логнат." }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!appUrl) {
      return NextResponse.json(
        { error: "Липсва NEXT_PUBLIC_APP_URL" },
        { status: 500 }
      );
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "Липсва STRIPE_PRICE_ID" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      billing_address_collection: "auto",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        user_id: user.id,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe не върна checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("stripe checkout error:", error);
    return NextResponse.json(
      { error: error?.message || "Грешка при Stripe checkout." },
      { status: 500 }
    );
  }
}