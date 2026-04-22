import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../../../../lib/supabase/server";
import Navbar from "../../../../../../components/Navbar";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminChildPage({
  params,
}: {
  params: Promise<{ userId: string; childId: string }>;
}) {
  const { userId, childId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) redirect("/dashboard");

  // Navbar данни
  const { data: ownChildren } = await supabase
    .from("children")
    .select("id, child_name")
    .eq("user_id", user.id);

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("active_child_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Детето
  const { data: child } = await supabaseAdmin
    .from("children")
    .select("*")
    .eq("id", childId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!child) {
    return <div>Детето не е намерено</div>;
  }

  // Логове
  const { data: logs } = await supabaseAdmin
    .from("development_logs")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false });

  return (
    <>
      <Navbar
        isPremium={true}
        childrenList={ownChildren ?? []}
        activeChildId={preferences?.active_child_id ?? null}
      />

      <main className="page-wrap pb-32">
        <div className="shell max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="card p-6 md:p-8">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-extrabold">
                  {child.child_name}
                </h1>
                <p className="text-gray-500">
                  Детайл на карта за печат
                </p>
              </div>

              <Link href={`/admin/users/${userId}`} className="secondary-btn">
                Назад
              </Link>
            </div>
          </div>

          {/* Карта */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Карта</h2>

            <div
              id="admin-development-card"
              className="mx-auto max-w-[400px] bg-white rounded-3xl p-6 shadow"
            >
              <h2 className="text-2xl font-bold mb-2">
                {child.child_name}
              </h2>

              <p className="text-sm text-gray-600 mb-4">
                {child.notes || "—"}
              </p>

              <div className="text-sm space-y-2">
                <p><b>Роден:</b> {child.birth_date || "-"}</p>
                <p><b>Алергии:</b> {Array.isArray(child.allergies) ? child.allergies.join(", ") : "-"}</p>
                <p><b>Цели:</b> {Array.isArray(child.goals) ? child.goals.join(", ") : "-"}</p>
              </div>
            </div>

            <div className="mt-5">
              <a
                href={`/development-card?childId=${childId}&admin=true`}
                target="_blank"
                className="primary-btn"
              >
                Отвори картата
              </a>
            </div>
          </div>

          {/* Логове */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Логове</h2>

            {!logs?.length ? (
              <p className="text-gray-500">Няма записи</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log: any) => (
                  <div key={log.id} className="border rounded-xl p-4">
                    <p className="font-semibold">{log.title}</p>
                    <p className="text-sm text-gray-500">{log.category}</p>
                    <p className="text-sm mt-1">{log.content}</p>
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