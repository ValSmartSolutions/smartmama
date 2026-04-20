import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import MealPlanClient from "./meal-plan-client";
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

export default async function MealPlanPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const child = children?.[0] ?? null;

  const { data: usage } = await supabase
    .from("usage")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium =
    !!subscription && ["active", "trialing"].includes(subscription.status || "");

  const freeUsed = usage?.count ?? 0;
  const freeRemaining = Math.max(0, 1 - freeUsed);

  return (
  <>
  <Navbar />
    <main className="min-h-screen p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">Какво да готвя днес</h1>
        <p className="text-sm text-gray-600 mb-6">
          Генерирай примерно дневно меню според профила на детето.
        </p>

        {!child ? (
          <div className="rounded-2xl border p-5">
            Първо попълни профил на детето.
          </div>
        ) : (
          <MealPlanClient
            childName={child.child_name ?? ""}
            ageText={calculateAgeText(child.birth_date)}
            allergies={Array.isArray(child.allergies) ? child.allergies.join(", ") : ""}
            goals={Array.isArray(child.goals) ? child.goals.join(", ") : ""}
            notes={child.notes ?? ""}
            isPremium={isPremium}
            freeRemaining={freeRemaining}
          />
        )}
      </div>
    </main>
	</>
  );
}