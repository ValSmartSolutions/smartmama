"use client";

import Link from "next/link";
import { useState } from "react";

export default function MealPlanClient({
  childName,
  ageText,
  allergies,
  goals,
  notes,
  isPremium,
  freeRemaining,
}: {
  childName: string;
  ageText: string;
  allergies: string;
  goals: string;
  notes: string;
  isPremium: boolean;
  freeRemaining: number;
}) {
  const [timeAvailable, setTimeAvailable] = useState("30");
  const [budgetLevel, setBudgetLevel] = useState("среден");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generatePlan() {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          childName,
          ageText,
          allergies,
          goals,
          notes,
          timeAvailable,
          budgetLevel,
        }),
      });

      const data = await res.json();

      if (data.paywall) {
        setError(data.message);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Грешка при генериране.");
      }

      setResult(data.text);
    } catch (err: any) {
      setError(err.message || "Нещо се обърка.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <div className="card p-5 md:p-6 space-y-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 border border-pink-100 px-3 py-1 text-xs font-semibold text-pink-600 mb-3">
            👶 Активно дете
          </div>

          <h2 className="text-2xl font-bold mb-1">{childName}</h2>
          <p className="text-sm text-gray-500">
            {ageText ? ageText : "Възраст не е добавена"}
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white p-4">
          {isPremium ? (
            <div className="rounded-2xl bg-green-50 border border-green-100 px-4 py-3 text-sm font-medium text-green-700">
              Premium е активен. Имаш неограничен достъп.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm font-medium text-amber-700">
                Остават ти <span className="font-bold">{freeRemaining}</span> от 3 безплатни менюта.
              </div>

              <p className="text-xs text-gray-500">
                След изчерпване на безплатния опит ще трябва да отключиш Premium.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white p-4 space-y-4">
          <h3 className="text-lg font-bold">Параметри</h3>

          <div>
            <label className="block text-sm mb-1">Минути за готвене</label>
            <input
              value={timeAvailable}
              onChange={(e) => setTimeAvailable(e.target.value)}
              placeholder="Пример: 30"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Бюджет</label>
            <select
              value={budgetLevel}
              onChange={(e) => setBudgetLevel(e.target.value)}
            >
              <option value="нисък">Нисък</option>
              <option value="среден">Среден</option>
              <option value="висок">Висок</option>
            </select>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white p-4 space-y-3">
          <h3 className="text-lg font-bold">Профил за генериране</h3>

          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <span className="font-semibold">Алергии:</span>{" "}
              {allergies || "Няма добавени"}
            </p>
            <p>
              <span className="font-semibold">Цели:</span>{" "}
              {goals || "Няма добавени"}
            </p>
            <p>
              <span className="font-semibold">Бележки:</span>{" "}
              {notes || "Няма добавени"}
            </p>
          </div>
        </div>

        <button
          onClick={generatePlan}
          disabled={loading}
          className="primary-btn w-full"
        >
          {loading ? "Генериране..." : "Генерирай меню"}
        </button>

        {!isPremium ? (
          <Link href="/pricing" className="secondary-btn w-full">
            Купи Premium
          </Link>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>

            {!isPremium && error.includes("Отключи") ? (
              <Link href="/pricing" className="secondary-btn w-full mt-3">
                Отключи Premium
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="card p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold mb-1">Резултат</h2>
            <p className="text-sm text-gray-500">
              Практично меню според активното дете
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

        {result ? (
          <div className="rounded-3xl border border-[var(--border)] bg-white p-5">
            <pre className="whitespace-pre-wrap text-sm leading-7 font-sans text-gray-800">
              {result}
            </pre>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--border)] bg-white/70 p-6 text-center">
            <p className="text-sm text-gray-600">
              Натисни „Генерирай меню“, за да получиш предложение.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}