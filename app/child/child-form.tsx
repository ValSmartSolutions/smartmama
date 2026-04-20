"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

type ChildData = {
  id: string;
  child_name: string;
  birth_date: string;
  allergies: string;
  goals: string;
  notes: string;
} | null;

export default function ChildForm({
  initialChild,
  userId,
}: {
  initialChild: ChildData;
  userId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [childName, setChildName] = useState(initialChild?.child_name ?? "");
  const [birthDate, setBirthDate] = useState(initialChild?.birth_date ?? "");
  const [allergies, setAllergies] = useState(initialChild?.allergies ?? "");
  const [goals, setGoals] = useState(initialChild?.goals ?? "");
  const [notes, setNotes] = useState(initialChild?.notes ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = {
      user_id: userId,
      child_name: childName,
      birth_date: birthDate || null,
      allergies: allergies
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      goals: goals
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      notes,
    };

    try {
      if (initialChild?.id) {
        const { error } = await supabase
          .from("children")
          .update(payload)
          .eq("id", initialChild.id);

        if (error) throw error;
        setMessage("Профилът е обновен.");
      } else {
        const { error } = await supabase.from("children").insert(payload);

        if (error) throw error;
        setMessage("Профилът е запазен.");
      }

      router.refresh();
    } catch (err: any) {
      setMessage(err.message || "Грешка при запазване.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="rounded-2xl border p-6 space-y-4">
      <div>
        <label className="block mb-1 text-sm">Име на детето</label>
        <input
          className="w-full rounded-xl border px-4 py-3"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          placeholder="Пример: Алекс"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm">Рождена дата</label>
        <input
          className="w-full rounded-xl border px-4 py-3"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>

      <div>
        <label className="block mb-1 text-sm">Алергии</label>
        <input
          className="w-full rounded-xl border px-4 py-3"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          placeholder="мляко, яйца, глутен"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm">Цели</label>
        <input
          className="w-full rounded-xl border px-4 py-3"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          placeholder="по-добър сън, здравословно хранене"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm">Бележки</label>
        <textarea
          className="w-full rounded-xl border px-4 py-3 min-h-32"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Капризен към зеленчуци, харесва супи..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl border px-4 py-3"
      >
        {loading ? "Запазване..." : "Запази профила"}
      </button>

      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}