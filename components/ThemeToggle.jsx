"use client";

import { useSyncExternalStore } from "react";

// The page's data-theme attribute is the source of truth (the inline script in layout.js sets it
// before paint), so we subscribe to it instead of copying it into state from an effect.
function subscribe(onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.dataset.theme === "dark";

// null on the server and during hydration, so the first client render matches the server render.
const getServerSnapshot = () => null;

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    // Read the real current theme from the page, not from React state.
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next; // the observer above re-renders the button
    try {
      localStorage.setItem("momentum-theme", next);
    } catch {
      // Storage can be blocked (private mode). The theme still switches for this visit.
    }
  }

  return (
    <button type="button" className="btn" onClick={toggle} aria-pressed={dark === true}>
      Dark mode
    </button>
  );
}
