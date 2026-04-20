"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Грешка при създаване на checkout.");
      }

      if (!data.url) {
        throw new Error("Липсва Stripe URL.");
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Нещо се обърка.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="page-wrap pb-32">
        <div className="shell max-w-6xl mx-auto">
          <div className="card p-6 md:p-8 mb-6 text-center">
            <p className="text-sm font-semibold text-pink-500 mb-2">💎 SmartMama Premium</p>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
              Отключи пълния достъп
            </h1>
            <p className="hero-text max-w-2xl mx-auto">
              Получи неограничен достъп до меню, сън, игри, дневник на развитието
              и пълната карта на развитието.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div className="card p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-5">Какво включва Premium</h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-[var(--border)] bg-white p-5">
                    <div className="text-3xl mb-3">🍽️</div>
                    <h3 className="text-lg font-bold mb-2">Меню за деня</h3>
                    <p className="text-sm text-gray-600 leading-6">
                      Неограничени AI предложения за хранене според профила на детето.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--border)] bg-white p-5">
                    <div className="text-3xl mb-3">😴</div>
                    <h3 className="text-lg font-bold mb-2">Сън и режим</h3>
                    <p className="text-sm text-gray-600 leading-6">
                      Неограничени персонални съвети за по-спокоен сън.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--border)] bg-white p-5">
                    <div className="text-3xl mb-3">🧩</div>
                    <h3 className="text-lg font-bold mb-2">Игри и развитие</h3>
                    <p className="text-sm text-gray-600 leading-6">
                      Идеи за игри и занимания според възрастта и интересите.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--border)] bg-white p-5">
                    <div className="text-3xl mb-3">📈</div>
                    <h3 className="text-lg font-bold mb-2">Дневник на развитието</h3>
                    <p className="text-sm text-gray-600 leading-6">
                      Неограничени записи за думи, сън, растеж, умения и важни моменти.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--border)] bg-white p-5 md:col-span-2">
                    <div className="text-3xl mb-3">🖼️</div>
                    <h3 className="text-lg font-bold mb-2">Карта на развитието</h3>
                    <p className="text-sm text-gray-600 leading-6">
                      Създай пълна красива карта на развитието, изтегли я като PNG или PDF
                      и я запази като специален спомен.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-5">Подходящо за родители с повече деца</h2>
                <p className="text-sm text-gray-600 leading-7">
                  С един акаунт можеш да добавиш повече от едно дете и да превключваш
                  между тях от менюто. Така цялото семейство използва SmartMama по-лесно.
                </p>
              </div>

              <div className="card p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-5">Допълнителна опция</h2>
                <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
                  <p className="font-semibold text-amber-800 mb-2">
                    Физическа карта в рамка
                  </p>
                  <p className="text-sm text-amber-700 leading-6">
                    След генериране на картата ще можеш да поръчаш и физическа A4 версия
                    в рамка като специален подарък или спомен.
                  </p>
                  <div className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-amber-700 border border-amber-200">
                    15€
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 md:p-8 h-fit xl:sticky xl:top-24">
              <p className="text-sm font-semibold text-pink-500 mb-2">План</p>
              <h2 className="text-3xl font-extrabold mb-2">Premium</h2>
              <p className="text-gray-600 mb-6">
                Пълен достъп до всички функции на SmartMama
              </p>

              <div className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,#fff7fb_0%,#ffffff_100%)] p-6 mb-6 text-center">
                <p className="text-5xl font-extrabold mb-2">2.99€</p>
                <p className="text-gray-600">на месец</p>
              </div>

              <div className="space-y-3 mb-6 text-sm text-gray-700">
                <div className="rounded-2xl bg-white border border-[var(--border)] px-4 py-3">
                  ✔ Неограничени AI резултати
                </div>
                <div className="rounded-2xl bg-white border border-[var(--border)] px-4 py-3">
                  ✔ Неограничени записи в дневника
                </div>
                <div className="rounded-2xl bg-white border border-[var(--border)] px-4 py-3">
                  ✔ Пълна карта на развитието
                </div>
                <div className="rounded-2xl bg-white border border-[var(--border)] px-4 py-3">
                  ✔ PNG и PDF download
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="primary-btn w-full"
              >
                {loading ? "Пренасочване..." : "Купи Premium"}
              </button>

              <Link href="/dashboard" className="secondary-btn w-full mt-3">
                Назад
              </Link>

              {error ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 mt-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              ) : null}

              <p className="text-xs text-gray-500 mt-4 leading-5 text-center">
                Абонаментът се управлява през Stripe. Ще можеш да спираш, подновяваш
                и променяш картата си по всяко време.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}