import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.user_id;
        const subscriptionId = session.subscription as string | null;

        console.log("checkout.session.completed", {
          userId,
          subscriptionId,
          metadata: session.metadata,
        });

        if (!userId) {
          console.error("Missing user_id in metadata");
          break;
        }

        if (!subscriptionId) {
          console.error("Missing subscription id in checkout session");
          break;
        }

        const { error } = await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            status: "active",
          },
          { onConflict: "user_id" }
        );

        if (error) {
          console.error("Supabase upsert error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log("Premium активиран за:", userId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: subscription.status,
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Supabase update error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Supabase cancel update error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log("Premium премахнат:", subscription.id);
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}