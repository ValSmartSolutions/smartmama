"use client";

import { useState } from "react";

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handleOpenPortal() {
    try {
      setLoading(true);

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
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleOpenPortal}
      disabled={loading}
      className="secondary-btn w-full"
    >
      {loading ? "Отваряне..." : "Управлявай абонамента"}
    </button>
  );
}