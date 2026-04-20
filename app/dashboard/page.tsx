import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import Navbar from "../../components/Navbar";

export default async function DashboardPage() {
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

  return (
    <>
      <Navbar
        isPremium={isPremium}
        childrenList={children ?? []}
        activeChildId={activeChild?.id ?? null}
      />

      <main className="page-wrap pb-32">
        <section className="shell max-w-6xl mx-auto">
          <div className="card p-6 md:p-8 mb-6">
            <p className="text-sm font-semibold text-pink-500 mb-2">
              AI помощник за родители
            </p>

            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
              Всичко важно за ежедневието с детето
            </h1>

            <p className="hero-text mb-5">
              Използвай SmartMama за хранене, сън, игри и развитие от едно място.
            </p>

            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div
                className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                  isPremium
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-amber-50 text-amber-700 border border-amber-100"
                }`}
              >
                {isPremium
                  ? "Premium е активен. Имаш неограничен достъп до всички функции."
                  : "Free план. Имаш ограничени безплатни опити за всяка функция."}
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm">
                <span className="text-gray-500">Активно дете:</span>{" "}
                <span className="font-semibold text-[var(--text)]">
                  {activeChild?.child_name || "Няма добавено дете"}
                </span>
              </div>
            </div>
          </div>

          {!children?.length ? (
            <div className="card p-6 md:p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">Започни с профил на дете</h2>
              <p className="text-gray-600 mb-5">
                За да работят функциите персонално, първо добави дете.
              </p>
              <Link href="/child" className="primary-btn">
                Добави дете
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="feature-card h-full flex flex-col">
                <div className="feature-icon">👶</div>
                <h2 className="text-xl font-bold mb-2">Профил на детето</h2>
                <p className="text-sm text-gray-600 mb-5 leading-6">
                  Добавяй и редактирай деца, алергии, цели и бележки.
                </p>
                <Link href="/child" className="secondary-btn w-full mt-auto">
                  Отвори
                </Link>
              </div>

              <div className="feature-card h-full flex flex-col">
                <div className="feature-icon">🍽️</div>
                <h2 className="text-xl font-bold mb-2">Меню за деня</h2>
                <p className="text-sm text-gray-600 mb-5 leading-6">
                  Генерирай хранене според нуждите на активното дете.
                </p>
                <Link href="/meal-plan" className="secondary-btn w-full mt-auto">
                  Отвори
                </Link>
              </div>

              <div className="feature-card h-full flex flex-col">
                <div className="feature-icon">😴</div>
                <h2 className="text-xl font-bold mb-2">Сън и режим</h2>
                <p className="text-sm text-gray-600 mb-5 leading-6">
                  Практични насоки за по-спокоен сън и по-лесно заспиване.
                </p>
                <Link href="/sleep" className="secondary-btn w-full mt-auto">
                  Отвори
                </Link>
              </div>

              <div className="feature-card h-full flex flex-col">
                <div className="feature-icon">🧩</div>
                <h2 className="text-xl font-bold mb-2">Игри и развитие</h2>
                <p className="text-sm text-gray-600 mb-5 leading-6">
                  Идеи за игри и занимания според възраст и интереси.
                </p>
                <Link href="/games" className="secondary-btn w-full mt-auto">
                  Отвори
                </Link>
              </div>

              <div className="feature-card h-full flex flex-col">
                <div className="feature-icon">📈</div>
                <h2 className="text-xl font-bold mb-2">Дневник на развитието</h2>
                <p className="text-sm text-gray-600 mb-5 leading-6">
                  Записвай нови думи, сън, растеж, умения и важни моменти.
                </p>
                <Link href="/development" className="secondary-btn w-full mt-auto">
                  Отвори
                </Link>
              </div>

              <div className="feature-card h-full flex flex-col">
                <div className="feature-icon">🖼️</div>
                <h2 className="text-xl font-bold mb-2">Карта на развитието</h2>
                <p className="text-sm text-gray-600 mb-5 leading-6">
                  Виж красив преглед на важните моменти на активното дете.
                </p>
                <Link href="/development-card" className="secondary-btn w-full mt-auto">
                  Отвори
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}