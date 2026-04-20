"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ChildItem = {
  id: string;
  child_name: string | null;
};

export default function ChildSwitcher({
  children,
  activeChildId,
}: {
  children: ChildItem[];
  activeChildId: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(activeChildId || children[0]?.id || "");
  const [loading, setLoading] = useState(false);

  async function handleChange(nextValue: string) {
    setValue(nextValue);
    setLoading(true);

    try {
      const res = await fetch("/api/set-active-child", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ childId: nextValue }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Грешка при смяна на дете.");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Неуспешна смяна на активно дете.");
    } finally {
      setLoading(false);
    }
  }

  if (!children.length) return null;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
      <label className="block text-xs text-gray-500 mb-1">
        Активно дете
      </label>

      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className="w-full"
      >
        {children.map((child) => (
          <option key={child.id} value={child.id}>
            {child.child_name || "Без име"}
          </option>
        ))}
      </select>
    </div>
  );
}