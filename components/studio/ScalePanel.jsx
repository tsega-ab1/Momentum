"use client";

import { useState } from "react";
import { readableTextOn, shadeNumbers } from "@/lib/color";

export default function ScalePanel({ colors }) {
  const [copied, setCopied] = useState("");
  const steps = shadeNumbers(colors.length);

  async function copy(hex) {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      // Clipboard can be blocked; the hex is still visible on the swatch.
    }
    setCopied(hex);
  }

  return (
    <section className="card" aria-labelledby="scale-title">
      <h2 id="scale-title" className="card-title">
        Scale
      </h2>
      <ul className="scale">
        {colors.map((color, i) => (
          <li key={i}>
            <button
              type="button"
              className="swatch"
              style={{ background: color, color: readableTextOn(color) }}
              onClick={() => copy(color)}
              aria-label={`Copy ${steps[i]}, ${color}`}
            >
              <span className="swatch-step">{steps[i]}</span>
              <span className="swatch-hex">{color}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="muted small" aria-live="polite">
        {copied ? `Copied ${copied}` : "Click a swatch to copy its hex."}
      </p>
    </section>
  );
}
