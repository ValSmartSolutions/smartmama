"use client";

import { useState } from "react";

export default function AddLog({ onAdd }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleAdd() {
    await fetch("/api/development", {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        type: "note",
      }),
    });

    setTitle("");
    setDescription("");
    onAdd?.();
  }

  return (
    <div className="card p-4 space-y-3">
      <input
        placeholder="Заглавие (пример: каза първата дума)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button onClick={handleAdd} className="primary-btn w-full">
        Добави запис
      </button>
    </div>
  );
}