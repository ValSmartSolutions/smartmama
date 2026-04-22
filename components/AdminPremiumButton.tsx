"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminPremiumButton({
  userId,
  isManualPremiumActive,
}: {
  userId: string;
  isManualPremiumActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/toggle-manual-premium", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId: userId,
          enable: !isManualPremiumActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Грешка при промяна на Premium.");
      }

      router.refresh();
    } catch (error: any) {
      alert(error?.message || "Неуспешна промяна.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={isManualPremiumActive ? "secondary-btn w-full" : "primary-btn w-full"}
    >
      {loading
        ? "Изчакване..."
        : isManualPremiumActive
        ? "Спри ръчния Premium"
        : "Дай безплатен Premium"}
    </button>
  );
}