"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RoutinePage() {
  const [routine, setRoutine] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const pending = localStorage.getItem("momentum-pending-routine");
    const adopted = localStorage.getItem("momentum-adopted-routine");
    const source = pending || adopted;
    if (source) setRoutine(JSON.parse(source));
  }, []);

  function updateItem(index, newActivity) {
    setRoutine((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], activity: newActivity };
      return { ...prev, items };
    });
  }

  function handleAdopt() {
    localStorage.setItem("momentum-adopted-routine", JSON.stringify(routine));
    localStorage.removeItem("momentum-pending-routine");
    router.push("/");
  }

  if (!routine) {
    return (
      <main className="page">
        <h1>No Routine Yet</h1>
        <p className="text-dim">Chat with the AI to generate one.</p>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>{routine.title}</h1>
      <p className="text-dim">Review your routine. Tap any activity to edit it.</p>

      <div className="card" style={{ marginTop: 16 }}>
        {routine.items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              padding: "10px 0",
              borderBottom: i < routine.items.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <span className="text-dim" style={{ width: 56 }}>{item.time}</span>
            <button
              onClick={() => {
                const next = prompt("Edit activity:", item.activity);
                if (next) updateItem(i, next);
              }}
              style={{ background: "none", border: "none", color: "var(--text)", textAlign: "left", flex: 1 }}
            >
              {item.activity}
            </button>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={handleAdopt} style={{ marginTop: 16 }}>
        Adopt Routine
      </button>
    </main>
  );
}
