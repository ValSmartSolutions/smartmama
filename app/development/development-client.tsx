"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LogItem = {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
  description: string | null;
  value_number: number | null;
  value_text: string | null;
  created_at: string;
};

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

function renderExtraLine(log: LogItem) {
  if (log.type === "growth" && log.value_number !== null) {
    if (log.value_text === "height") return `Ръст: ${log.value_number} см`;
    if (log.value_text === "weight") return `Тегло: ${log.value_number} кг`;
    return `${log.value_number}`;
  }

  if (log.type === "sleep" && log.value_number !== null) {
    return `Заспа за ${log.value_number} мин`;
  }

  if (log.type === "word" && log.value_text) {
    return `Каза: ${log.value_text}`;
  }

  if (log.type === "skill" && log.value_text) {
    return `Умение: ${log.value_text}`;
  }

  if (log.value_text) return log.value_text;
  if (log.value_number !== null) return `${log.value_number}`;

  return null;
}

export default function DevelopmentClient({
  childId,
  childName,
  logs,
  isPremium,
  freeRemaining,
}: {
  childId: string;
  childName: string;
  logs: LogItem[];
  isPremium: boolean;
  freeRemaining: number;
}) {
  const router = useRouter();

  const [type, setType] = useState("note");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [valueNumber, setValueNumber] = useState("");
  const [valueText, setValueText] = useState("");
  const [growthMode, setGrowthMode] = useState<"height" | "weight">("height");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  async function handleAddLog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const finalValueText =
        type === "growth" ? growthMode : valueText || null;

      const res = await fetch("/api/development", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          childId,
          type,
          title,
          description,
          valueNumber: valueNumber ? Number(valueNumber) : null,
          valueText: finalValueText,
          eventDate: date,
        }),
      });

      const text = await res.text();

      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("API не върна валиден JSON.");
      }

      if (data.paywall) {
        setMessage(data.message);
        setSaving(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Грешка при запис.");
      }

      setTitle("");
      setDescription("");
      setValueNumber("");
      setValueText("");
      setGrowthMode("height");
      setType("note");
      setDate(new Date().toISOString().split("T")[0]);
      setMessage("Записът е добавен.");
      router.refresh();
    } catch (err: any) {
      setMessage(err.message || "Нещо се обърка.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <div className="card p-5 md:p-6 space-y-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 border border-pink-100 px-3 py-1 text-xs font-semibold text-pink-600 mb-3">
            👶 Активно дете
          </div>

          <h2 className="text-2xl font-bold mb-1">{childName}</h2>
          <p className="text-sm text-gray-500">
            Добавяй важни моменти от развитието
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white p-4">
          {isPremium ? (
            <div className="rounded-2xl bg-green-50 border border-green-100 px-4 py-3 text-sm font-medium text-green-700">
              Premium е активен. Имаш неограничени записи.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm font-medium text-amber-700">
                Остават ти <span className="font-bold">{freeRemaining}</span> от 3 безплатни записа.
              </div>

              <p className="text-xs text-gray-500">
                След изчерпване на безплатните записи ще трябва да отключиш Premium.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold">Нов запис</h3>

            <Link href="/development-card" className="secondary-btn text-sm px-4 py-2">
              Виж карта
            </Link>
          </div>

          <form onSubmit={handleAddLog} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Тип запис</label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setValueNumber("");
                  setValueText("");
                  setGrowthMode("height");
                }}
              >
                <option value="note">Бележка</option>
                <option value="word">Нова дума</option>
                <option value="sleep">Сън</option>
                <option value="growth">Растеж</option>
                <option value="skill">Ново умение</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Дата на събитието</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Заглавие</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Пример: Каза първата дума"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Описание</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Какво се случи?"
                rows={4}
              />
            </div>

            {type === "word" && (
              <div>
                <label className="block text-sm mb-1">Каква дума каза?</label>
                <input
                  value={valueText}
                  onChange={(e) => setValueText(e.target.value)}
                  placeholder="Пример: мама"
                />
              </div>
            )}

            {type === "sleep" && (
              <div>
                <label className="block text-sm mb-1">Колко минути заспиваше?</label>
                <input
                  value={valueNumber}
                  onChange={(e) => setValueNumber(e.target.value)}
                  placeholder="Пример: 20"
                  inputMode="numeric"
                />
              </div>
            )}

            {type === "growth" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Тип измерване</label>
                  <select
                    value={growthMode}
                    onChange={(e) => setGrowthMode(e.target.value as "height" | "weight")}
                  >
                    <option value="height">Ръст</option>
                    <option value="weight">Тегло</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">
                    {growthMode === "height" ? "Ръст (см)" : "Тегло (кг)"}
                  </label>
                  <input
                    value={valueNumber}
                    onChange={(e) => setValueNumber(e.target.value)}
                    placeholder={growthMode === "height" ? "Пример: 95" : "Пример: 14.2"}
                    inputMode="decimal"
                  />
                </div>
              </div>
            )}

            {type === "skill" && (
              <div>
                <label className="block text-sm mb-1">Какво ново умение?</label>
                <input
                  value={valueText}
                  onChange={(e) => setValueText(e.target.value)}
                  placeholder="Пример: кара колело"
                />
              </div>
            )}

            <button className="primary-btn w-full" type="submit" disabled={saving}>
              {saving ? "Записване..." : "Добави запис"}
            </button>
          </form>

          {!isPremium ? (
            <Link href="/pricing" className="secondary-btn w-full">
              Купи Premium
            </Link>
          ) : null}

          {message ? (
            <div className="rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3">
              <p className="text-sm text-gray-700">{message}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="card p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold mb-1">История</h2>
            <p className="text-sm text-gray-500">
              Важни моменти от развитието на активното дете
            </p>
          </div>

          {!isPremium ? (
            <div className="rounded-full bg-pink-50 border border-pink-100 px-3 py-2 text-xs font-semibold text-pink-600">
              Free preview
            </div>
          ) : (
            <div className="rounded-full bg-green-50 border border-green-100 px-3 py-2 text-xs font-semibold text-green-600">
              Premium
            </div>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--border)] bg-white/70 p-6 text-center">
            <p className="text-sm text-gray-600">
              Все още няма записи. Добави първия важен момент.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const extraLine = renderExtraLine(log);

              return (
                <div
                  key={log.id}
                  className="rounded-3xl border border-[var(--border)] bg-white p-4 md:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-pink-50 flex items-center justify-center text-xl shrink-0">
                      {getTypeIcon(log.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-bold text-lg">{log.title}</p>
                        <span className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-600">
                          {log.typeLabel}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mb-2">
                        {new Date(log.created_at).toLocaleDateString("bg-BG")}
                      </p>

                      {log.description ? (
                        <p className="text-sm text-gray-700 mb-2">{log.description}</p>
                      ) : null}

                      {extraLine ? (
                        <p className="text-sm text-pink-600">{extraLine}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}