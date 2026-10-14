"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  // null until mounted, so the first client render matches the server render.
  const [dark, setDark] = useState(null);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggle() {
    // Read the real current theme from the page, not from React state.
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("momentum-theme", next);
    } catch {
      // Storage can be blocked (private mode). The theme still switches for this visit.
    }
    setDark(next === "dark");
  }

  return (
    <button type="button" className="btn" onClick={toggle} aria-pressed={dark === true}>
      Dark mode
    </button>
  );
}
