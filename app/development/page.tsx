import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import Navbar from "../../components/Navbar";
import DevelopmentClient from "./development-client";

function formatType(type: string) {
  switch (type) {
    case "word":
      return "Нова дума";
    case "sleep":
      return "Сън";
    case "growth":
      return "Растеж";
    case "skill":
      return "Ново умение";
    default:
      return "Бележка";
  }
}

export default async function DevelopmentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium =
    !!subscription && ["active", "trialing"].includes(subscription.status || "");

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("active_child_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const activeChildId = preferences?.active_child_id ?? null;

  const activeChild =
    children?.find((c: any) => c.id === activeChildId) ??
    children?.[0] ??
    null;

  let logs: any[] = [];

  if (activeChild) {
    const { data: logsData, error: logsError } = await supabase
      .from("development_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("child_id", activeChild.id)
      .order("created_at", { ascending: false });

    if (logsError) {
      console.error("development logs error:", logsError);
    } else {
      logs = logsData ?? [];
    }
  }

  const freeRemaining = Math.max(0, 3 - logs.length);

  return (
    <>
      <Navbar
        isPremium={isPremium}
        childrenList={children ?? []}
        activeChildId={activeChild?.id ?? null}
      />

      <main className="page-wrap pb-32">
        <div className="shell max-w-6xl mx-auto">
          <div className="card p-6 md:p-8 mb-6">
            <p className="text-sm font-semibold text-pink-500 mb-2">📈 Развитие</p>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
              Дневник на развитието
            </h1>
            <p className="hero-text">
              Записвай важни моменти, нови думи, сън, растеж и умения за активното дете.
            </p>
          </div>

          {!activeChild ? (
            <div className="card p-6 text-center">
              <h2 className="text-2xl font-bold mb-3">Няма активно дете</h2>
              <p className="text-gray-600">
                Първо добави дете и го избери като активно от менюто горе вдясно.
              </p>
            </div>
          ) : (
            <DevelopmentClient
              childId={activeChild.id}
              childName={activeChild.child_name ?? ""}
              logs={logs.map((log: any) => ({
                ...log,
                typeLabel: formatType(log.type),
              }))}
              isPremium={isPremium}
              freeRemaining={freeRemaining}
            />
          )}
        </div>
      </main>
    </>
  );
}