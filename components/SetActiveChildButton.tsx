"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SetActiveChildButton({
  childId,
  isActive,
}: {
  childId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSetActive() {
    if (isActive) return;

    try {
      setLoading(true);

      const res = await fetch("/api/set-active-child", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ childId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Грешка при активиране.");
      }

      router.refresh();
    } catch (error: any) {
      alert(error?.message || "Неуспешно активиране.");
    } finally {
      setLoading(false);
    }
  }

  if (isActive) {
    return (
      <div className="rounded-full bg-pink-50 border border-pink-100 px-3 py-2 text-xs font-semibold text-pink-600 text-center">
        Активно дете
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSetActive}
      disabled={loading}
      className="primary-btn w-full"
    >
      {loading ? "Активиране..." : "Направи активно"}
    </button>
  );
}