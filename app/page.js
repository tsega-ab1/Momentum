"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function HomePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [routine, setRoutine] = useState(null);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    const onboarded = localStorage.getItem("momentum-onboarded") === "true";
    if (!onboarded) {
      router.replace("/onboarding");
      return;
    }

    const stored = localStorage.getItem("momentum-adopted-routine");
    if (stored) setRoutine(JSON.parse(stored));

    const completions = JSON.parse(localStorage.getItem("momentum-completions") || "{}");
    setCompleted(completions[todayKey()] || []);

    setChecked(true);
  }, [router]);

  function toggleItem(time) {
    setCompleted((prev) => {
      const next = prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time];
      const completions = JSON.parse(localStorage.getItem("momentum-completions") || "{}");
      completions[todayKey()] = next;
      localStorage.setItem("momentum-completions", JSON.stringify(completions));
      return next;
    });
  }

  if (!checked) return null;

  if (!routine) {
    return (
      <main className="page">
        <h1>Momentum</h1>
        <p className="text-dim">Keep your career moving.</p>
        <div className="card" style={{ marginTop: 24 }}>
          <p>No routine yet.</p>
          <Link href="/chat" className="btn-primary" style={{ display: "block", textAlign: "center", marginTop: 12 }}>
            Talk to AI
          </Link>
        </div>
      </main>
    );
  }

  const progress = Math.round((completed.length / routine.items.length) * 100);

  return (
    <main className="page">
      <h1>Today</h1>
      <p className="text-dim">{progress}% complete</p>

      <div className="card" style={{ marginTop: 16 }}>
        {routine.items.map((item) => {
          const done = completed.includes(item.time);
          return (
            <label
              key={item.time}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid var(--border)",
                opacity: done ? 0.5 : 1,
              }}
            >
              <input type="checkbox" checked={done} onChange={() => toggleItem(item.time)} />
              <span className="text-dim" style={{ width: 56 }}>{item.time}</span>
              <span style={{ textDecoration: done ? "line-through" : "none" }}>{item.activity}</span>
            </label>
          );
        })}
      </div>
    </main>
  );
}
