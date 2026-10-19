"use client";

import { useState } from "react";
import { contrastRatio, formatRatio, shadeNumbers, wcagLevel } from "@/lib/color";

function Level({ level }) {
  // Words and symbols, never color alone.
  return <span className={`level ${level === "Fail" ? "level-fail" : "level-pass"}`}>{level === "Fail" ? "✕ Fail" : `✓ ${level}`}</span>;
}

// Parent passes key={colors.length}, so choices reset when the shade count changes.
export default function ContrastPanel({ colors }) {
  const n = colors.length;
  const steps = shadeNumbers(n);
  const [fg, setFg] = useState(`i:${n - 2}`);
  const [bg, setBg] = useState("i:0");

  const resolve = (key) => {
    if (key === "white") return "#ffffff";
    if (key === "black") return "#000000";
    return colors[Math.min(Number(key.slice(2)), n - 1)];
  };
  const fgColor = resolve(fg);
  const bgColor = resolve(bg);
  const ratio = contrastRatio(fgColor, bgColor);

  const options = [
    ...colors.map((c, i) => ({ key: `i:${i}`, label: `${steps[i]} · ${c}` })),
    { key: "white", label: "White · #ffffff" },
    { key: "black", label: "Black · #000000" },
  ];

  return (
    <section className="card" aria-labelledby="contrast-title">
      <h2 id="contrast-title" className="card-title">
        Contrast
      </h2>

      <div className="field-row">
        <div className="field">
          <label htmlFor="fg">Text color</label>
          <select id="fg" value={fg} onChange={(e) => setFg(e.target.value)}>
            {options.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="bg">Background</label>
          <select id="bg" value={bg} onChange={(e) => setBg(e.target.value)}>
            {options.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setFg(bg);
            setBg(fg);
          }}
        >
          Swap
        </button>
      </div>

      <div className="sample" style={{ background: bgColor, color: fgColor }}>
        <strong>Aa</strong> The quick brown fox jumps over the lazy dog
      </div>

      <p className="ratio" data-testid="ratio">
        {formatRatio(ratio)}
      </p>
      <ul className="levels">
        <li>
          Normal text <Level level={wcagLevel(ratio, false)} />
        </li>
        <li>
          Large text <Level level={wcagLevel(ratio, true)} />
        </li>
      </ul>

      <details>
        <summary>Every shade on white and on black</summary>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Contrast of each shade against white and black text backgrounds</caption>
            <thead>
              <tr>
                <th scope="col">Shade</th>
                <th scope="col">vs white</th>
                <th scope="col">vs black</th>
              </tr>
            </thead>
            <tbody>
              {colors.map((c, i) => {
                const w = contrastRatio(c, "#ffffff");
                const b = contrastRatio(c, "#000000");
                return (
                  <tr key={i}>
                    <th scope="row">
                      <span className="dot" style={{ background: c }} aria-hidden="true" /> {steps[i]}
                    </th>
                    <td>
                      {formatRatio(w)} <Level level={wcagLevel(w)} />
                    </td>
                    <td>
                      {formatRatio(b)} <Level level={wcagLevel(b)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
