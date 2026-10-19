"use client";

import { EXPORT_FORMATS } from "@/lib/color";
import { SHADE_COUNTS } from "@/lib/constants";
import { DEFAULT_PREFS } from "@/lib/prefs";
import { usePreferences } from "./usePreferences";
import ThemeToggle from "./ThemeToggle";

const LABELS = { css: "CSS variables", tailwind: "Tailwind v4", scss: "SCSS", json: "JSON tokens" };

export default function SettingsForm() {
  const { prefs, update, ready } = usePreferences();

  return (
    <section className="card" aria-labelledby="prefs-title">
      <h2 id="prefs-title" className="card-title">
        Preferences
      </h2>
      <p className="muted small">Saved in this browser. The Studio uses them for new systems.</p>

      <div className="field">
        <label htmlFor="format">Default export format</label>
        <select id="format" value={prefs.format} disabled={!ready} onChange={(e) => update({ format: e.target.value })}>
          {EXPORT_FORMATS.map((f) => (
            <option key={f} value={f}>
              {LABELS[f]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="label" id="default-count-label">
          Default number of shades
        </span>
        <div className="segmented" role="group" aria-labelledby="default-count-label">
          {SHADE_COUNTS.map((n) => (
            <button key={n} type="button" className="seg" aria-pressed={prefs.count === n} onClick={() => update({ count: n })}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="label">Theme</span>
        <ThemeToggle />
      </div>

      <div className="actions">
        <button type="button" className="btn" onClick={() => update(DEFAULT_PREFS)}>
          Reset to defaults
        </button>
      </div>
    </section>
  );
}
