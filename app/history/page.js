"use client";

import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [routine, setRoutine] = useState(null);
  const [completions, setCompletions] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("momentum-adopted-routine");
    if (stored) setRoutine(JSON.parse(stored));
    setCompletions(JSON.parse(localStorage.getItem("momentum-completions") || "{}"));
  }, []);

  if (!routine) {
    return (
      <main className="page">
        <h1>History</h1>
        <p className="text-dim">Adopt a routine to start tracking your consistency.</p>
      </main>
    );
  }

  const dates = Object.keys(completions).sort().reverse();

  return (
    <main className="page">
      <h1>History</h1>
      <p className="text-dim">{routine.title}</p>

      {dates.length === 0 && <p className="text-dim" style={{ marginTop: 16 }}>No days tracked yet.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {dates.map((date) => {
          const done = completions[date].length;
          const total = routine.items.length;
          const pct = Math.round((done / total) * 100);
          return (
            <div key={date} className="card" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{date}</strong>
                <span className="text-dim">{pct}%</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)" }} />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
