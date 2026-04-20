"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setShowConfirmModal(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage("Успешен вход. Пренасочвам...");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setMessage(err?.message || "Нещо се обърка.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-wrap">
      <div className="shell">
        <div className="mb-6">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <img
			  src="/logo.png"
			  alt="SmartMama"
			  className="w-12 h-12 rounded-2xl shadow-md"
			/>
            <div>
              <p className="font-extrabold text-lg leading-none">SmartMama</p>
              <p className="text-xs text-gray-500">AI помощник за родители</p>
            </div>
          </Link>
        </div>

        <div className="card form-card">
          <p className="text-sm font-semibold text-pink-500 mb-2">
            {mode === "login" ? "Добре дошъл отново" : "Създай акаунт"}
          </p>

          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            {mode === "login" ? "Вход в SmartMama" : "Регистрация в SmartMama"}
          </h1>

          <p className="text-gray-600 mb-6">
            Получи достъп до меню, сън и режим, игри и развитие.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              className={mode === "login" ? "primary-btn w-full" : "secondary-btn w-full"}
            >
              Вход
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setMessage("");
              }}
              className={mode === "signup" ? "primary-btn w-full" : "secondary-btn w-full"}
            >
              Регистрация
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Текущ режим: {mode === "login" ? "Вход" : "Регистрация"}
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            autoComplete="on"
          >
            <input
              type="email"
              placeholder="Имейл"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Парола"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              className="primary-btn w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Изчакай..." : mode === "login" ? "Вход" : "Създай акаунт"}
            </button>
          </form>

          {showConfirmModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center shadow-xl">
                <div className="text-5xl mb-4">📩</div>

                <h2 className="text-2xl font-bold mb-2">
                  Потвърди регистрацията
                </h2>

                <p className="text-gray-600 mb-4">
                  Изпратихме ти имейл за потвърждение.
                  <br />
                  Моля отвори пощата си и активирай профила си.
                </p>

                <p className="text-sm text-gray-500 mb-6">
                  Провери и в Spam, ако не го виждаш.
                </p>

                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full rounded-2xl border px-4 py-3 font-semibold"
                >
                  Разбрах
                </button>
              </div>
            </div>
          )}

          {message ? (
            <p className="mt-5 text-sm text-gray-700">{message}</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}