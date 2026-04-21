"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import ChildSwitcher from "./ChildSwitcher";

type ChildItem = {
  id: string;
  child_name: string | null;
};

export default function Navbar({
  isPremium = false,
  childrenList = [],
  activeChildId = null,
}: {
  isPremium?: boolean;
  childrenList?: ChildItem[];
  activeChildId?: string | null;
}) {
  const pathname = usePathname();
  const [portalLoading, setPortalLoading] = useState(false);

async function handleOpenPortal() {
  try {
    setPortalLoading(true);

    const res = await fetch("/api/create-portal-session", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Грешка при отваряне на портала.");
    }

    if (!data.url) {
      throw new Error("Липсва portal URL.");
    }

    window.location.href = data.url;
  } catch (error: any) {
    alert(error?.message || "Неуспешно отваряне на портала.");
  } finally {
    setPortalLoading(false);
  }
}
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navItem = (path: string, icon: string, label: string) => {
    const active = pathname === path;

    return (
      <Link
        href={path}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
          active ? "bg-pink-50 text-pink-600" : "text-gray-700"
        }`}
      >
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </Link>
    );
  };

  async function handleLogout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setOpen(false);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <header className="topbar relative z-50">
      <div className="shell flex items-center justify-between py-4 gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-4 min-w-0 shrink-0"
        >
          <img
			  src="/logo.png"
			  alt="SmartMama"
			  className="w-12 h-12 rounded-2xl shadow-md"
			/>

          <div className="min-w-0">
            <p className="font-extrabold text-[18px] leading-none text-[var(--text)]">
              SmartMama
            </p>
            <p className="text-sm text-gray-500 leading-tight mt-1">
              за родители
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isPremium && (
            <div className="hidden sm:flex rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-600 shadow-sm">
              💎 Premium
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="w-11 h-11 rounded-xl border border-[var(--border)] bg-white flex items-center justify-center text-xl shadow-sm"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute top-full right-4 mt-2 w-64 rounded-2xl border bg-white shadow-xl p-3 space-y-2">
          {isPremium && (
            <button
			  type="button"
			  onClick={handleOpenPortal}
			  disabled={portalLoading}
			  className="premium-badge"
				>
				{portalLoading ? "Отваряне..." : "💎 Premium активен"}
				</button>
          )}
          <ChildSwitcher
            children={childrenList}
            activeChildId={activeChildId}
          />

          {navItem("/dashboard", "🏠", "Начало")}
          {navItem("/child", "👶", "Профил")}
          {navItem("/meal-plan", "🍽️", "Меню")}
          {navItem("/sleep", "😴", "Сън")}
          {navItem("/games", "🧩", "Игри")}
          {navItem("/development", "📈", "Развитие")}
          {navItem("/development-card", "🖼️", "Карта")}

          <div className="border-t my-2" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 w-full text-left"
          >
            <span className="text-lg">🚪</span>
            <span className="text-sm font-medium">Изход</span>
          </button>
        </div>
      )}
    </header>
  );
}