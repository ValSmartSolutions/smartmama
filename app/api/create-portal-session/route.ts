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

    // взимаме subscription от базата
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Няма активен абонамент." },
        { status: 400 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/meal-plan`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("portal error:", error);
    return NextResponse.json(
      { error: error?.message || "Грешка при portal." },
      { status: 500 }
    );
  }
}