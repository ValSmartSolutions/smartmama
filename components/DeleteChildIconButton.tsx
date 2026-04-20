"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteChildIconButton({
  childId,
  childName,
}: {
  childId: string;
  childName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Сигурен ли си, че искаш да изтриеш профила на "${childName}"?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const res = await fetch("/api/delete-child", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ childId }),
      });

      const text = await res.text();

      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("API не върна валиден JSON. Провери route.ts");
      }

      if (!res.ok) {
        throw new Error(data.error || "Грешка при изтриване.");
      }

      router.push("/child");
      router.refresh();
    } catch (error: any) {
      alert(error?.message || "Неуспешно изтриване.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="w-9 h-9 rounded-full border border-red-200 bg-red-50 text-red-600 flex items-center justify-center text-sm font-bold shrink-0"
      title="Изтрий профила"
    >
      {loading ? "..." : "✕"}
    </button>
  );
}