"use client";

import { useMemo, useState } from "react";
import { contrastRatio, formatRatio, readableTextOn } from "@/lib/color";
import { HARMONY_TYPES, harmonyAsCss, makeHarmony } from "@/lib/harmony";

export default function HarmonyPanel({ base }) {
  const [type, setType] = useState("complementary");
  const [message, setMessage] = useState("");
  const colors = useMemo(() => makeHarmony(base, type), [base, type]);
  const selected = HARMONY_TYPES.find((item) => item.id === type);

  async function copyText(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(`${label} copied.`);
    } catch {
      setMessage("Clipboard access was blocked. Select and copy the values manually.");
    }
  }

  const json = JSON.stringify(
    { name: `${selected.label} palette`, base, colors: colors.map((color) => color.hex) },
    null,
    2,
  );

  return (
    <section className="card harmony-panel" aria-labelledby="harmony-title">
      <div className="harmony-heading">
        <div>
          <p className="eyebrow">COLOR RELATIONSHIPS</p>
          <h2 id="harmony-title" className="card-title">Harmony</h2>
          <p className="muted small">Build a coordinated palette from your base color.</p>
        </div>
        <span className="harmony-live">Live</span>
      </div>

      <div className="harmony-types" role="group" aria-label="Harmony type">
        {HARMONY_TYPES.map((item) => (
          <button
            key={item.id}
            type="button"
            className="btn harmony-type"
            aria-pressed={type === item.id}
            onClick={() => {
              setType(item.id);
              setMessage("");
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="muted small harmony-description">{selected.description}</p>

      <div className="harmony-colors" aria-label={`${selected.label} colors`}>
        {colors.map(({ hex, role, isBase }, index) => (
          <button
            type="button"
            key={`${hex}-${index}`}
            className="harmony-swatch"
            style={{ backgroundColor: hex, color: readableTextOn(hex) }}
            onClick={() => copyText(hex, hex)}
            title={`Copy ${hex}`}
            aria-label={`Copy ${role} color ${hex}`}
          >
            <span className="harmony-role">{isBase ? "BASE" : role.toUpperCase()}</span>
            <span className="harmony-hex">{hex.toUpperCase()}</span>
            <span className="harmony-contrast">
              {formatRatio(contrastRatio(hex, readableTextOn(hex)))} text
            </span>
          </button>
        ))}
      </div>

      <div className="harmony-actions">
        <button type="button" className="btn" onClick={() => copyText(colors.map((c) => c.hex).join("\n"), "Palette")}>
          Copy hex list
        </button>
        <button type="button" className="btn" onClick={() => copyText(harmonyAsCss(colors), "CSS variables")}>
          Copy CSS
        </button>
        <button type="button" className="btn" onClick={() => copyText(json, "JSON palette")}>
          Copy JSON
        </button>
      </div>

      <p className="muted small harmony-note">
        Color harmony is a design starting point, not an accessibility guarantee.
        Check text and interface contrast before shipping.
      </p>
      <p className="sr-only" role="status" aria-live="polite">{message}</p>
      {message && <p className="muted small harmony-feedback">{message}</p>}
    </section>
  );
}
