import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import Navbar from "../../components/Navbar";
import DownloadCardButton from "../../components/DownloadCardButton";
import DownloadCardPdfButton from "../../components/DownloadCardPdfButton";
import DevelopmentCardExport from "../../components/DevelopmentCardExport";

function getZodiacSign(dateString: string | null) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Водолей";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Риби";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Овен";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Телец";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Близнаци";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Рак";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Лъв";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Дева";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Везни";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Скорпион";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Стрелец";
  return "Козирог";
}

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

function renderLogLine(log: any) {
  if (log.type === "growth" && log.value_number !== null) {
    if (log.value_text === "height") return `Ръст: ${log.value_number} см`;
    if (log.value_text === "weight") return `Тегло: ${log.value_number} кг`;
  }

  if (log.type === "sleep" && log.value_number !== null) {
    return `Заспа за ${log.value_number} минути`;
  }

  if (log.type === "word" && log.value_text) {
    return `Каза: ${log.value_text}`;
  }

  if (log.type === "skill" && log.value_text) {
    return `Ново умение: ${log.value_text}`;
  }

  return log.description || "";
}

function getHighlights(logs: any[]) {
  const words = logs.filter((l) => l.type === "word" && l.value_text).slice(-3);
  const skills = logs.filter((l) => l.type === "skill" && l.value_text).slice(-3);
  const growth = logs.filter((l) => l.type === "growth" && l.value_number !== null);

  const latestHeight = [...growth].reverse().find((l) => l.value_text === "height");
  const latestWeight = [...growth].reverse().find((l) => l.value_text === "weight");
  const sleepLog = [...logs].reverse().find((l) => l.type === "sleep" && l.value_number !== null);

  return { words, skills, latestHeight, latestWeight, sleepLog };
}

function getTypeIcon(type: string) {
  switch (type) {
    case "word":
      return "🗣️";
    case "sleep":
      return "😴";
    case "growth":
      return "📏";
    case "skill":
      return "✨";
    default:
      return "📝";
  }
}

export default async function DevelopmentCardPage() {
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
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const activeChildId = preferences?.active_child_id ?? null;

  const activeChild =
    children?.find((c: any) => c.id === activeChildId) ??
    children?.[0] ??
    null;

  if (!activeChild) {
    return (
      <>
        <Navbar
          isPremium={isPremium}
          childrenList={children ?? []}
          activeChildId={null}
        />

        <main className="page-wrap pb-32">
          <div className="shell">
            <div className="card p-6 text-center">
              <h2 className="text-2xl font-bold mb-3">Няма активно дете</h2>
              <p className="text-gray-600">
                Добави дете и го избери като активно от менюто горе вдясно.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  const { data: logs } = await supabase
    .from("development_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("child_id", activeChild.id)
    .order("created_at", { ascending: true });

  const allLogs = logs ?? [];
  const previewLogs = isPremium ? allLogs : allLogs.slice(0, 3);
  const { words, skills, latestHeight, latestWeight, sleepLog } = getHighlights(allLogs);

  const childName = activeChild.child_name || "Детето";
  const birthDate = activeChild.birth_date
    ? new Date(activeChild.birth_date).toLocaleDateString("bg-BG")
    : "Не е добавена";
  const zodiac = getZodiacSign(activeChild.birth_date ?? null) || "—";

  return (
    <>
      <Navbar
        isPremium={isPremium}
        childrenList={children ?? []}
        activeChildId={activeChild?.id ?? null}
      />

      <main className="page-wrap pb-32">
        <div className="shell">
          <div className="card p-5 md:p-8 mb-5">
            <p className="text-sm font-semibold text-pink-500 mb-2">🖼️ Карта на развитието</p>
            <h1 className="text-2xl md:text-5xl font-extrabold mb-3">
              Красив спомен за растежа на детето
            </h1>
            <p className="hero-text">
              Подреди важните моменти в карта, която си струва да запазиш.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
            <div className="card p-3 md:p-6">
              <div className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,#fff9fb_0%,#fffefe_45%,#f4f8ff_100%)] p-4 md:p-8 shadow-sm">
                <div className="rounded-[24px] border border-pink-100/80 bg-white/85 p-4 md:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                    <div className="relative w-20 h-20 md:w-28 md:h-28 shrink-0">
                      <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-pink-300 via-pink-200 to-blue-300 shadow-lg" />
                      <div className="absolute inset-[3px] rounded-[21px] bg-white/20" />
                      <div className="absolute inset-0 flex items-center justify-center text-3xl md:text-5xl font-extrabold text-white">
                        {childName.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 border border-pink-100 px-3 py-1 text-xs font-semibold text-pink-600 mb-3">
                        ✨ Карта на развитието
                      </div>

                      <h2 className="text-2xl md:text-5xl font-extrabold leading-tight mb-2">
                        {childName}
                      </h2>

                      <p className="text-sm md:text-base text-gray-600">
                        Малките победи, които си струва да останат запазени.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-pink-50/50 px-4 py-3 mb-5 text-sm text-gray-700">
                    Карта за: <span className="font-semibold">{childName}</span>
                  </div>

                  <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-5">
                    <div className="rounded-3xl bg-white border border-[var(--border)] px-3 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                        Дата на раждане
                      </p>
                      <p className="font-bold text-sm md:text-base text-gray-800">
                        {birthDate}
                      </p>
                    </div>

                    <div className="rounded-3xl bg-white border border-[var(--border)] px-3 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                        Зодия
                      </p>
                      <p className="font-bold text-sm md:text-base text-gray-800">
                        {zodiac}
                      </p>
                    </div>

                    <div className="rounded-3xl bg-white border border-[var(--border)] px-3 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                        Последен ръст
                      </p>
                      <p className="font-bold text-sm md:text-base text-blue-600">
                        {latestHeight?.value_number ? `${latestHeight.value_number} см` : "—"}
                      </p>
                    </div>

                    <div className="rounded-3xl bg-white border border-[var(--border)] px-3 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                        Последно тегло
                      </p>
                      <p className="font-bold text-sm md:text-base text-pink-600">
                        {latestWeight?.value_number ? `${latestWeight.value_number} кг` : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[24px] bg-[linear-gradient(135deg,#fff7fb_0%,#ffffff_100%)] border border-pink-100 p-4 mb-5">
                    <h3 className="text-base md:text-lg font-bold mb-2">💌 Кратко описание</h3>
                    <p className="text-sm md:text-base text-gray-700 leading-7">
                      {isPremium
                        ? `${childName} расте с красиви малки крачки всеки ден. Тази карта събира ценни моменти, нови умения, първи думи и важни победи в един нежен спомен за семейството.`
                        : `Това е примерна карта на развитието. С Premium ще можеш да създадеш пълната карта на своето дете и да я изтеглиш в красив дигитален формат.`}
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3 mb-6">
                    <div className="rounded-3xl bg-white border border-[var(--border)] p-4">
                      <h3 className="font-bold text-base md:text-lg mb-3">🗣️ Първи думи</h3>
                      {words.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {words.map((word) => (
                            <span
                              key={word.id}
                              className="rounded-full bg-pink-50 border border-pink-100 px-3 py-2 text-sm font-medium text-pink-700"
                            >
                              {word.value_text}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Няма добавени думи</p>
                      )}
                    </div>

                    <div className="rounded-3xl bg-white border border-[var(--border)] p-4">
                      <h3 className="font-bold text-base md:text-lg mb-3">✨ Умения</h3>
                      {skills.length > 0 ? (
                        <div className="space-y-2">
                          {skills.map((skill) => (
                            <div
                              key={skill.id}
                              className="rounded-2xl bg-amber-50 border border-amber-100 px-3 py-2 text-sm text-amber-800"
                            >
                              {skill.value_text}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Няма добавени умения</p>
                      )}
                    </div>

                    <div className="rounded-3xl bg-white border border-[var(--border)] p-4">
                      <h3 className="font-bold text-base md:text-lg mb-3">😴 Сън</h3>
                      {sleepLog?.value_number ? (
                        <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">
                          <p className="text-xl md:text-2xl font-extrabold text-blue-700">
                            {sleepLog.value_number} мин
                          </p>
                          <p className="text-sm text-blue-600 mt-1">
                            последно време за заспиване
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Няма данни за сън</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <h3 className="text-lg md:text-xl font-bold">🌟 Важни моменти</h3>
                      <span className="text-xs rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                        {previewLogs.length} записа
                      </span>
                    </div>

                    {previewLogs.length === 0 ? (
                      <p className="text-sm text-gray-600">
                        Все още няма достатъчно записи за карта.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {previewLogs.map((log: any, index: number) => (
                          <div key={log.id} className="relative pl-6">
                            {index !== previewLogs.length - 1 ? (
                              <div className="absolute left-[12px] top-8 bottom-[-14px] w-[2px] bg-gradient-to-b from-pink-200 to-blue-200" />
                            ) : null}

                            <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-white border-2 border-pink-300 shadow-sm flex items-center justify-center text-[11px]">
                              {getTypeIcon(log.type)}
                            </div>

                            <div className="rounded-3xl border border-[var(--border)] bg-white p-4">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="font-bold text-base md:text-lg">{log.title}</p>
                                <span className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-600">
                                  {formatType(log.type)}
                                </span>
                              </div>

                              <p className="text-xs text-gray-500 mb-2">
                                {new Date(log.created_at).toLocaleDateString("bg-BG")}
                              </p>

                              <p className="text-sm text-gray-700 leading-6">
                                {renderLogLine(log)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isPremium ? (
                      <div className="mt-6 rounded-3xl border border-dashed border-pink-200 bg-pink-50/70 p-4 text-center">
                        <p className="font-semibold text-pink-700 mb-2">
                          Отключи пълната карта на развитието
                        </p>
                        <p className="text-sm text-gray-600">
                          С Premium ще можеш да видиш пълната карта и да я изтеглиш.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="text-xl font-bold mb-3">Какво получаваш</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li>• Красиво оформена карта</li>
                  <li>• Подредени важни моменти</li>
                  <li>• Подходяща за дигитален спомен</li>
                  <li>• Подготовка за A4 принт</li>
                </ul>
              </div>

              <div className="card p-5">
                <h3 className="text-xl font-bold mb-3">Физическа карта</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Поръчай A4 карта в рамка като специален спомен.
                </p>
                <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm font-semibold text-amber-700">
                  Цена: 15€
                </div>
              </div>

              {isPremium ? (
                <div className="space-y-3">
                  <DownloadCardButton />
                  <DownloadCardPdfButton />
                </div>
              ) : (
                <Link href="/pricing" className="primary-btn w-full">
                  Отключи Premium
                </Link>
              )}

              <Link href="/development" className="secondary-btn w-full">
                Обратно към дневника
              </Link>
            </div>
          </div>

          <div
            style={{
              position: "fixed",
              left: "-99999px",
              top: 0,
              pointerEvents: "none",
            }}
          >
            <DevelopmentCardExport
              childName={childName}
              birthDate={birthDate}
              zodiac={zodiac}
              latestHeight={latestHeight?.value_number ? `${latestHeight.value_number} см` : "—"}
              latestWeight={latestWeight?.value_number ? `${latestWeight.value_number} кг` : "—"}
              words={words.map((w: any) => w.value_text).filter(Boolean)}
              skills={skills.map((s: any) => s.value_text).filter(Boolean)}
              sleepMinutes={sleepLog?.value_number ? `${sleepLog.value_number} мин` : "—"}
              logs={isPremium ? allLogs : allLogs.slice(0, 5)}
            />
          </div>
        </div>
      </main>
    </>
  );
}