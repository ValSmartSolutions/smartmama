import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

  const {
    data: { users: authUsers },
    error: authUsersError,
  } = await supabaseAdmin.auth.admin.listUsers();

  if (authUsersError) {
    console.error("auth admin listUsers error:", authUsersError);
  }

  const allUserIds = (authUsers ?? []).map((u) => u.id);

  const { data: allSubscriptions } = await supabase
    .from("subscriptions")
    .select("user_id, status");

  const { data: manualPremiumRows } = await supabase
    .from("manual_premium_access")
    .select("user_id, is_active");

  const { data: allChildren } = await supabase
    .from("children")
    .select("user_id, id");

  const premiumMap = new Map(
    (allSubscriptions ?? []).map((s: any) => [
      s.user_id,
      ["active", "trialing"].includes(s.status || ""),
    ])
  );

  const manualPremiumMap = new Map(
    (manualPremiumRows ?? []).map((row: any) => [row.user_id, !!row.is_active])
  );

  const childCountMap = new Map<string, number>();
  for (const row of allChildren ?? []) {
    childCountMap.set(row.user_id, (childCountMap.get(row.user_id) || 0) + 1);
  }

  const enrichedUsers = (authUsers ?? []).map((authUser) => {
    const stripePremium = !!premiumMap.get(authUser.id);
    const manualPremium = !!manualPremiumMap.get(authUser.id);

    return {
      id: authUser.id,
      email: authUser.email || "Няма имейл",
      createdAt: authUser.created_at,
      stripePremium,
      manualPremium,
      effectivePremium: stripePremium || manualPremium,
      childCount: childCountMap.get(authUser.id) || 0,
    };
  });

  const premiumCount = enrichedUsers.filter((u) => u.effectivePremium).length;

  return (
    <>
      <Navbar
        isPremium={isPremium}
        childrenList={children ?? []}
        activeChildId={preferences?.active_child_id ?? null}
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
              <p className="text-3xl font-extrabold">{allUserIds.length}</p>
            </div>

            <div className="card p-5">
              <p className="text-sm text-gray-500 mb-1">Premium</p>
              <p className="text-3xl font-extrabold">{premiumCount}</p>
            </div>

            <div className="card p-5">
              <p className="text-sm text-gray-500 mb-1">Деца общо</p>
              <p className="text-3xl font-extrabold">{(allChildren ?? []).length}</p>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <h2 className="text-2xl font-bold">Потребители</h2>
              <div className="text-sm text-gray-500">
                Всички регистрирани акаунти от Supabase Auth
              </div>
            </div>

            {enrichedUsers.length === 0 ? (
              <p className="text-gray-600">Все още няма потребители.</p>
            ) : (
              <div className="space-y-3">
                {enrichedUsers.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-[var(--border)] bg-white p-4 md:p-5"
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-semibold break-all">{item.email}</p>
                        <p className="text-sm text-gray-500 break-all mt-1">
                          {item.id}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Регистрация:{" "}
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("bg-BG")
                            : "—"}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                            item.effectivePremium
                              ? "bg-green-50 text-green-700 border-green-100"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {item.effectivePremium ? "Premium" : "Free"}
                        </span>

                        {item.manualPremium ? (
                          <span className="rounded-full px-3 py-1 text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-100">
                            Manual Premium
                          </span>
                        ) : null}

                        <span className="rounded-full px-3 py-1 text-xs font-semibold border bg-pink-50 text-pink-700 border-pink-100">
                          {item.childCount} {item.childCount === 1 ? "дете" : "деца"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link href={`/admin/users/${item.id}`} className="secondary-btn">
                        Отвори потребител
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}