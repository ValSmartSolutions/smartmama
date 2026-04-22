import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import Navbar from "../../components/Navbar";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    redirect("/dashboard");
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
    .select("id, child_name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("active_child_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const activeChildId = preferences?.active_child_id ?? null;

  const { data: users } = await supabase
    .from("children")
    .select("user_id, id")
    .order("created_at", { ascending: false });

  const uniqueUserIds = Array.from(new Set((users ?? []).map((x: any) => x.user_id)));

  const { data: allSubscriptions } = await supabase
    .from("subscriptions")
    .select("user_id, status");

  const premiumMap = new Map(
    (allSubscriptions ?? []).map((s: any) => [s.user_id, ["active", "trialing"].includes(s.status || "")])
  );

  const childCountMap = new Map<string, number>();
  for (const row of users ?? []) {
    childCountMap.set(row.user_id, (childCountMap.get(row.user_id) || 0) + 1);
  }

  return (
    <>
      <Navbar
        isPremium={isPremium}
        childrenList={children ?? []}
        activeChildId={activeChildId}
      />

      <main className="page-wrap pb-32">
        <div className="shell max-w-6xl mx-auto space-y-6">
          <div className="card p-6 md:p-8">
            <p className="text-sm font-semibold text-pink-500 mb-2">🛠️ Админ панел</p>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
              Управление на SmartMama
            </h1>
            <p className="hero-text">
              Потребители, premium статус, деца и бъдещи поръчки за физически карти.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-5">
              <p className="text-sm text-gray-500 mb-1">Потребители</p>
              <p className="text-3xl font-extrabold">{uniqueUserIds.length}</p>
            </div>

            <div className="card p-5">
              <p className="text-sm text-gray-500 mb-1">Premium</p>
              <p className="text-3xl font-extrabold">
                {uniqueUserIds.filter((id) => premiumMap.get(id)).length}
              </p>
            </div>

            <div className="card p-5">
              <p className="text-sm text-gray-500 mb-1">Деца общо</p>
              <p className="text-3xl font-extrabold">{(users ?? []).length}</p>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <h2 className="text-2xl font-bold">Потребители</h2>
              <div className="text-sm text-gray-500">
                Начална версия на админ панела
              </div>
            </div>

            {uniqueUserIds.length === 0 ? (
              <p className="text-gray-600">Все още няма данни.</p>
            ) : (
              <div className="space-y-3">
                {uniqueUserIds.map((userId) => {
                  const isUserPremium = !!premiumMap.get(userId);
                  const childCount = childCountMap.get(userId) || 0;

                  return (
                    <div
                      key={userId}
                      className="rounded-3xl border border-[var(--border)] bg-white p-4 md:p-5"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">User ID</p>
                          <p className="font-semibold break-all">{userId}</p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                              isUserPremium
                                ? "bg-green-50 text-green-700 border-green-100"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                          >
                            {isUserPremium ? "Premium" : "Free"}
                          </span>

                          <span className="rounded-full px-3 py-1 text-xs font-semibold border bg-pink-50 text-pink-700 border-pink-100">
                            {childCount} {childCount === 1 ? "дете" : "деца"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}