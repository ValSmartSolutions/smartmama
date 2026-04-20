import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import ChildForm from "./child-form";
import Navbar from "../../components/Navbar";
import DeleteChildIconButton from "../../components/DeleteChildIconButton";
import SetActiveChildButton from "../../components/SetActiveChildButton";

type ChildPageProps = {
  searchParams?: Promise<{
    childId?: string;
    new?: string;
  }>;
};

export default async function ChildPage({ searchParams }: ChildPageProps) {
  const params = (await searchParams) || {};

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

  const { data: children, error } = await supabase
    .from("children")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

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

  const editingChild =
    params.new === "1"
      ? null
      : children?.find((c: any) => c.id === params.childId) ?? activeChild ?? null;

  return (
    <>
      <Navbar
        isPremium={isPremium}
        childrenList={children ?? []}
        activeChildId={activeChild?.id ?? null}
      />

      <main className="page-wrap pb-32">
        <div className="shell max-w-6xl mx-auto space-y-6">
          <div className="card p-6 md:p-8">
            <p className="text-sm font-semibold text-pink-500 mb-2">👶 Профил на детето</p>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
              Деца в профила
            </h1>
            <p className="hero-text">
              Добавяй повече от едно дете и избирай кое да е активно за функциите.
            </p>
          </div>

          {children?.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {children.map((child: any) => {
                const isActive = child.id === activeChild?.id;
                const isEditing = child.id === editingChild?.id && params.new !== "1";

                return (
                  <div
                    key={child.id}
                    className={`card p-5 ${
                      isEditing
                        ? "ring-2 ring-blue-200"
                        : isActive
                        ? "ring-2 ring-pink-200"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-300 to-blue-300 text-white font-bold flex items-center justify-center text-lg shrink-0">
                          {(child.child_name || "Д").charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-xl font-bold truncate">
                            {child.child_name || "Без име"}
                          </h2>
                          <p className="text-sm text-gray-500">
                            {child.birth_date
                              ? new Date(child.birth_date).toLocaleDateString("bg-BG")
                              : "Без дата на раждане"}
                          </p>
                        </div>
                      </div>

                      {children && children.length > 1 ? (
                        <DeleteChildIconButton
                          childId={child.id}
                          childName={child.child_name || "Без име"}
                        />
                      ) : null}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-5">
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

                    <div className="grid gap-3">
                      <SetActiveChildButton
                        childId={child.id}
                        isActive={isActive}
                      />

                      <Link
                        href={`/child?childId=${child.id}`}
                        className="secondary-btn w-full"
                      >
                        Редактирай
                      </Link>

                      {isEditing ? (
                        <div className="rounded-full bg-blue-50 border border-blue-100 px-3 py-2 text-xs font-semibold text-blue-600 text-center">
                          В момента редактираш това дете
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card p-6 text-center">
              <h2 className="text-2xl font-bold mb-3">Все още няма добавено дете</h2>
              <p className="text-gray-600">
                Попълни първия профил, за да използваш SmartMama персонално.
              </p>
            </div>
          )}

          <div className="card p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {params.new === "1"
                    ? "Добави ново дете"
                    : editingChild
                    ? "Редакция на дете"
                    : "Добави дете"}
                </h2>
                <p className="text-sm text-gray-600">
                  {params.new === "1"
                    ? "Попълни информацията за новото дете."
                    : editingChild
                    ? "Можеш да обновиш информацията за избраното дете."
                    : "Попълни информация, за да създадеш профил."}
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Link href="/child?new=1" className="primary-btn">
                  + Добави ново дете
                </Link>

                {params.new === "1" ? (
                  <Link href="/child" className="secondary-btn">
                    Отказ
                  </Link>
                ) : null}
              </div>
            </div>

            <ChildForm
              key={params.new === "1" ? "new-child" : editingChild?.id ?? "no-child"}
              initialChild={
                editingChild
                  ? {
                      id: editingChild.id,
                      child_name: editingChild.child_name ?? "",
                      birth_date: editingChild.birth_date ?? "",
                      allergies: Array.isArray(editingChild.allergies)
                        ? editingChild.allergies.join(", ")
                        : "",
                      goals: Array.isArray(editingChild.goals)
                        ? editingChild.goals.join(", ")
                        : "",
                      notes: editingChild.notes ?? "",
                    }
                  : null
              }
              userId={user.id}
            />
          </div>
        </div>
      </main>
    </>
  );
}