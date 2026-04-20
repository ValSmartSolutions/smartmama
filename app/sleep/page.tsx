import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import SleepClient from "./sleep-client";
import Navbar from "../../components/Navbar";

function calculateAgeText(birthDate: string | null) {
  if (!birthDate) return "";

  const birth = new Date(birthDate);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    years--;
  }

  return `${years} години`;
}

export default async function SleepPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const activeChildId = preferences?.active_child_id ?? null;

  const activeChild =
    children?.find((c: any) => c.id === activeChildId) ??
    children?.[0] ??
    null;

  const { data: usage } = await supabase
    .from("sleep_usage")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const freeUsed = usage?.count ?? 0;
  const freeRemaining = Math.max(0, 1 - freeUsed);

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
            <p className="text-sm font-semibold text-pink-500 mb-2">😴 Сън и режим</p>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
              По-спокоен сън
            </h1>
            <p className="hero-text">
              Получи практичен съвет според профила на активното дете.
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
            <SleepClient
              childName={activeChild.child_name ?? ""}
              ageText={calculateAgeText(activeChild.birth_date)}
              notes={activeChild.notes ?? ""}
              isPremium={isPremium}
              freeRemaining={freeRemaining}
            />
          )}
        </div>
      </main>
    </>
  );
}