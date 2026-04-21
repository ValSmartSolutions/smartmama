import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "../../../lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Не си логнат." }, { status: 401 });
    }

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "Няма активен Stripe абонамент." },
        { status: 400 }
      );
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );

    const customerId = stripeSubscription.customer;

    if (!customerId || typeof customerId !== "string") {
      return NextResponse.json(
        { error: "Липсва Stripe customer." },
        { status: 400 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("create portal session error:", error);
    return NextResponse.json(
      { error: error?.message || "Грешка при отваряне на Stripe portal." },
      { status: 500 }
    );
  }
}