"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const focusAreas = [
  { id: "career", label: "Career Growth", icon: "💼" },
  { id: "search", label: "Job Search", icon: "🔍" },
  { id: "skills", label: "Skills & Learning", icon: "📚" },
  { id: "network", label: "Networking", icon: "🤝" },
  { id: "habits", label: "Daily Habits", icon: "✅" },
  { id: "custom", label: "Custom Goal", icon: "✨" },
];

export default function OnboardingPage() {
  const [selected, setSelected] = useState([]);
  const router = useRouter();

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function handleContinue() {
    localStorage.setItem("momentum-focus-areas", JSON.stringify(selected));
    localStorage.setItem("momentum-onboarded", "true");
    router.push("/chat");
  }

  return (
    <main className="page">
      <h1>What would you like to improve?</h1>
      <p className="text-dim">Choose your main focus. You can always change this later.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
        {focusAreas.map((area) => (
          <button
            key={area.id}
            onClick={() => toggle(area.id)}
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textAlign: "left",
              border: selected.includes(area.id)
                ? "1px solid var(--accent)"
                : "1px solid var(--border)",
              margin: 0,
            }}
          >
            <span style={{ fontSize: 20 }}>{area.icon}</span>
            <span>{area.label}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          className="btn-primary"
          onClick={handleContinue}
          disabled={selected.length === 0}
          style={{ opacity: selected.length === 0 ? 0.5 : 1 }}
        >
          Continue →
        </button>
      </div>
    </main>
  );
}
