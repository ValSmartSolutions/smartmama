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
    const { childId } = body;

    if (!childId) {
      return NextResponse.json({ error: "Missing childId" }, { status: 400 });
    }

    const { data: child, error: childError } = await supabase
      .from("children")
      .select("id,user_id")
      .eq("id", childId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (childError) {
      return NextResponse.json({ error: childError.message }, { status: 500 });
    }

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const { data: preferences, error: prefReadError } = await supabase
      .from("user_preferences")
      .select("active_child_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (prefReadError) {
      return NextResponse.json({ error: prefReadError.message }, { status: 500 });
    }

    const currentActiveChildId = preferences?.active_child_id ?? null;

    const { data: allChildrenBeforeDelete, error: listError } = await supabase
      .from("children")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const { error: deleteLogsError } = await supabase
      .from("development_logs")
      .delete()
      .eq("user_id", user.id)
      .eq("child_id", childId);

    if (deleteLogsError) {
      return NextResponse.json({ error: deleteLogsError.message }, { status: 500 });
    }

    const { error: deleteChildError } = await supabase
      .from("children")
      .delete()
      .eq("id", childId)
      .eq("user_id", user.id);

    if (deleteChildError) {
      return NextResponse.json({ error: deleteChildError.message }, { status: 500 });
    }

    if (currentActiveChildId === childId) {
      const remainingChildren = (allChildrenBeforeDelete ?? []).filter(
        (c: any) => c.id !== childId
      );

      const nextActiveChildId = remainingChildren[0]?.id ?? null;

      const { error: upsertPrefError } = await supabase
        .from("user_preferences")
        .upsert(
          {
            user_id: user.id,
            active_child_id: nextActiveChildId,
          },
          { onConflict: "user_id" }
        );

      if (upsertPrefError) {
        return NextResponse.json({ error: upsertPrefError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("delete-child route error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}