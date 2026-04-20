"use client";

import Link from "next/link";
import { useState } from "react";

export default function SleepClient({
  childName,
  ageText,
  notes,
  isPremium,
  freeRemaining,
}: {
  childName: string;
  ageText: string;
  notes: string;
  isPremium: boolean;
  freeRemaining: number;
}) {
  const [sleepProblem, setSleepProblem] = useState("Трудно заспиване");
  const [bedtime, setBedtime] = useState("21:00");
  const [wakeups, setWakeups] = useState("1-2");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateSleepPlan() {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/sleep-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          childName,
          ageText,
          sleepProblem,
          bedtime,
          wakeups,
          notes,
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
                Остава ти <span className="font-bold">{freeRemaining}</span> от 1 безплатен съвет за сън.
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
            <label className="block text-sm mb-1">Проблем</label>
            <select
              value={sleepProblem}
              onChange={(e) => setSleepProblem(e.target.value)}
            >
              <option>Трудно заспиване</option>
              <option>Чести нощни събуждания</option>
              <option>Става прекалено рано</option>
              <option>Неспокоен сън</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Час на лягане</label>
            <input
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              placeholder="Пример: 21:00"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Нощни събуждания</label>
            <input
              value={wakeups}
              onChange={(e) => setWakeups(e.target.value)}
              placeholder="Пример: 1-2"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white p-4 space-y-3">
          <h3 className="text-lg font-bold">Бележки за детето</h3>

          <div className="text-sm text-gray-700">
            <p>
              <span className="font-semibold">Бележки:</span>{" "}
              {notes || "Няма добавени"}
            </p>
          </div>
        </div>

        <button
          onClick={generateSleepPlan}
          disabled={loading}
          className="primary-btn w-full"
        >
          {loading ? "Генериране..." : "Генерирай съвет"}
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
              Практичен съвет за съня на активното дете
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
              Натисни „Генерирай съвет“, за да получиш предложение.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}