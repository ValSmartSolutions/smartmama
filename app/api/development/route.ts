import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
	// Проверка дали user е premium
	const { data: subscription } = await supabase
	  .from("subscriptions")
	  .select("*")
	  .eq("user_id", user.id)
	  .maybeSingle();

	const isPremium =
	  !!subscription &&
	  ["active", "trialing"].includes(subscription.status || "");

	// Взимаме колко записа има
	const { count } = await supabase
	  .from("development_logs")
	  .select("*", { count: "exact", head: true })
	  .eq("user_id", user.id);

	// LIMIT = 3
	if (!isPremium && (count ?? 0) >= 3) {
	  return NextResponse.json({
		paywall: true,
		message:
		  "Използва безплатните 3 записа. Отключи Premium, за да продължиш дневника.",
	  });
	}
    const {
      childId,
      type,
      title,
      description,
      valueNumber,
      valueText,
      eventDate,
    } = body;

    if (!childId || !type || !title) {
      return NextResponse.json(
        { error: "Липсват задължителни полета." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("development_logs").insert({
      user_id: user.id,
      child_id: childId,
      type,
      title,
      description: description || null,
      value_number: valueNumber || null,
      value_text: valueText || null,
      created_at: eventDate
        ? new Date(eventDate).toISOString()
        : new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Грешка при запис." },
      { status: 500 }
    );
  }
}