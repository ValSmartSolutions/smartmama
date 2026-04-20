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

    const { childId } = await req.json();

    if (!childId) {
      return NextResponse.json({ error: "Missing childId" }, { status: 400 });
    }

    const { data: child, error: childError } = await supabase
      .from("children")
      .select("id")
      .eq("id", childId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (childError || !child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          active_child_id: childId,
        },
        { onConflict: "user_id" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}