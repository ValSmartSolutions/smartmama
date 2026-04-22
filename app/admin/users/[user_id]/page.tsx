import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../../lib/supabase/server";
import Navbar from "../../../../components/Navbar";
import AdminPremiumButton from "../../../../components/AdminPremiumButton";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id } = await params;
  const userId = user_id;
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

  const { data: ownSubscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium =
    !!ownSubscription && ["active", "trialing"].includes(ownSubscription.status || "");

  const { data: ownChildren } = await supabase
    .from("children")
    .select("id, child_name")
    .eq("user_id", user.id);

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

  const targetAuthUser = (authUsers ?? []).find((u) => u.id === userId) ?? null;

  const { data: targetSubscription, error: targetSubscriptionError } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (targetSubscriptionError) {
    console.error("target subscription error:", targetSubscriptionError);
  }

  const stripePremium =
    !!targetSubscription &&
    ["active", "trialing"].includes(targetSubscription.status || "");

  const { data: manualPremium, error: manualPremiumError } = await supabaseAdmin
    .from("manual_premium_access")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (manualPremiumError) {
    console.error("manual premium error:", manualPremiumError);
  }

  const manualPremiumActive = !!manualPremium?.is_active;
  const effectivePremium = stripePremium || manualPremiumActive;

  const { data: children, error: childrenError } = await supabaseAdmin
    .from("children")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (childrenError) {
    console.error("target children error:", childrenError);
  }

  return (
    <>
      <Navbar
        isPremium={isPremium}
        childrenList={ownChildren ?? []}
        activeChildId={preferences?.active_child_id ?? null}
      />

      <main className="page-wrap pb-32">
        <div className="shell max-w-6xl mx-auto space-y-6">
          <div className="card p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-pink-500 mb-2">🛠️ Админ / Потребител</p>
                <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
                  Детайл на потребител
                </h1>
                <p className="hero-text break-all">
                  {targetAuthUser?.email || "Няма имейл"}
                </p>
                <p className="text-sm text-gray-500 mt-2 break-all">
                  User ID: {userId}
                </p>
              </div>

              <Link href="/admin" className="secondary-btn">
                Назад
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="card p-5">
              <p className="text-sm text-gray-500 mb-1">Краен статус</p>
              <p className="text-2xl font-extrabold">
                {effectivePremium ? "Premium" : "Free"}
              </p>
            </div>

            <div className="card p-5">
              <p className="text-sm text-gray-500 mb-1">Stripe Premium</p>
              <p className="text-2xl font-extrabold">
                {stripePremium ? "Да" : "Не"}
              </p>
            </div>

            <div className="card p-5">
              <p className="text-sm text-gray-500 mb-1">Ръчен Premium</p>
              <p className="text-2xl font-extrabold">
                {manualPremiumActive ? "Да" : "Не"}
              </p>
            </div>

            <div className="card p-5">
              <p className="text-sm text-gray-500 mb-1">Деца</p>
              <p className="text-2xl font-extrabold">
                {children?.length ?? 0}
              </p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4">Premium управление</h2>

            <div className="max-w-md">
              <AdminPremiumButton
                userId={userId}
                isManualPremiumActive={manualPremiumActive}
              />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-5">Деца в профила</h2>

            {!children?.length ? (
              <p className="text-gray-600">Няма добавени деца.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {children.map((child: any) => (
                  <div
                    key={child.id}
                    className="rounded-3xl border border-[var(--border)] bg-white p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-300 to-blue-300 text-white font-bold flex items-center justify-center text-lg shrink-0">
                        {(child.child_name || "Д").charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold">
                          {child.child_name || "Без име"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {child.birth_date
                            ? new Date(child.birth_date).toLocaleDateString("bg-BG")
                            : "Без дата на раждане"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium text-gray-700">Алергии:</span>{" "}
                        {Array.isArray(child.allergies) && child.allergies.length
                          ? child.allergies.join(", ")
                          : "Няма"}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Цели:</span>{" "}
                        {Array.isArray(child.goals) && child.goals.length
                          ? child.goals.join(", ")
                          : "Няма"}
                      </p>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/admin/users/${userId}/children/${child.id}`}
                        className="secondary-btn w-full"
                      >
                        Отвори детайл
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