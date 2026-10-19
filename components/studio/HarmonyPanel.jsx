"use client";

import { useEffect, useMemo, useState } from "react";
import {
  HARMONY_TYPES,
  PALETTE_SIZES,
  harmonyAsCss,
  makeHarmony,
} from "@/lib/harmony";

const STORAGE_KEY = "momentum-saved-harmony-palettes-v1";

function safeFileName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "momentum-palette";
}

function makeSvg(colors, name) {
  const swatchWidth = 120;
  const height = 150;
  const width = swatchWidth * colors.length;

  const swatches = colors.map((color, index) => `
    <g transform="translate(${index * swatchWidth},0)">
      <rect width="${swatchWidth}" height="${height}" fill="${color.hex}"/>
      <rect y="${height - 40}" width="${swatchWidth}" height="40" fill="#ffffff" fill-opacity=".92"/>
      <text x="10" y="${height - 16}" font-size="12" font-family="Arial,sans-serif" fill="#222222">${color.hex}</text>
    </g>`).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <title>${name.replace(/[<>&"]/g, "")}</title>
  ${swatches}
</svg>`;
}

function makeExportContent(format, palette) {
  const { name, base, type, colors } = palette;

  if (format === "json") {
    return JSON.stringify({
      name,
      base,
      harmony: type,
      count: colors.length,
      colors: colors.map((color, index) => ({
        name: color.role || `Color ${index + 1}`,
        hex: color.hex,
      })),
    }, null, 2);
  }

  if (format === "txt") {
    return [
      name,
      `Base color: ${base}`,
      `Harmony: ${type}`,
      `Number of colors: ${colors.length}`,
      "",
      ...colors.map((color, index) => `${index + 1}. ${color.hex}`),
      "",
    ].join("\n");
  }

  if (format === "svg") return makeSvg(colors, name);

  return [
    `/* ${name} — ${type} palette */`,
    harmonyAsCss(colors),
    "",
  ].join("\n");
}

export default function HarmonyPanel({ base }) {
  const [type, setType] = useState("complementary");
  const [count, setCount] = useState(9);
  const [exportFormat, setExportFormat] = useState("css");
  const [paletteName, setPaletteName] = useState("My color palette");
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [status, setStatus] = useState("");
  const [storageReady, setStorageReady] = useState(false);

  const colors = useMemo(
    () => makeHarmony(base, type, count),
    [base, type, count]
  );

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSavedPalettes(parsed);
        }
      }
    } catch {
      setStatus("Saved palettes could not be loaded from this browser.");
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPalettes));
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("Browser storage is full. Delete an old saved palette and try again.");
    }
  }, [savedPalettes, storageReady]);

  const palette = useMemo(() => ({
    name: paletteName.trim() || "Untitled palette",
    base: base.toUpperCase(),
    type,
    colors,
  }), [paletteName, base, type, colors]);

  async function copyText(value, successMessage) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(successMessage);
    } catch {
      setStatus("Clipboard access failed. Try using the export download instead.");
    }
  }

  function savePalette() {
    const saved = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...palette,
      savedAt: new Date().toISOString(),
    };

    setSavedPalettes((previous) => [saved, ...previous]);
    setStatus(`Saved "${saved.name}".`);
  }

  function loadPalette(saved) {
    setPaletteName(saved.name || "My color palette");
    setType(saved.type || "complementary");
    setCount(saved.colors?.length || 9);
    setStatus(`Loaded "${saved.name}".`);
  }

  function deletePalette(id) {
    setSavedPalettes((previous) => previous.filter((item) => item.id !== id));
    setStatus("Saved palette deleted.");
  }

  function downloadPalette() {
    const content = makeExportContent(exportFormat, palette);
    const mime = exportFormat === "svg"
      ? "image/svg+xml;charset=utf-8"
      : exportFormat === "json"
        ? "application/json;charset=utf-8"
        : exportFormat === "txt"
          ? "text/plain;charset=utf-8"
          : "text/css;charset=utf-8";

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeFileName(palette.name)}.${exportFormat}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus(`Exported ${exportFormat.toUpperCase()} file.`);
  }

  return (
    <section className="card harmony-v2" aria-labelledby="harmony-v2-title">
      <div className="harmony-v2-heading">
        <div>
          <h2 id="harmony-v2-title">Color harmony</h2>
          <p>Build, save, and export a palette from your base color.</p>
        </div>
        <span className="harmony-v2-count">{colors.length} colors</span>
      </div>

      <div className="harmony-v2-controls">
        <label className="harmony-v2-field">
          <span>Harmony type</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            {HARMONY_TYPES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <label className="harmony-v2-field">
          <span>Number of colors</span>
          <select
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          >
            {PALETTE_SIZES.map((size) => (
              <option key={size} value={size}>{size} colors</option>
            ))}
          </select>
        </label>
      </div>

      <label className="harmony-v2-field harmony-v2-name">
        <span>Palette name</span>
        <input
          value={paletteName}
          onChange={(event) => setPaletteName(event.target.value)}
          maxLength={80}
          placeholder="Name your palette"
        />
      </label>

      <div className="harmony-v2-swatches" aria-label="Generated palette">
        {colors.map((color, index) => (
          <button
            className="harmony-v2-swatch"
            key={`${index}-${color.hex}`}
            type="button"
            style={{ backgroundColor: color.hex }}
            title={`Copy ${color.hex}`}
            aria-label={`Copy color ${index + 1}, ${color.hex}`}
            onClick={() => copyText(color.hex, `Copied ${color.hex}`)}
          >
            <span>{color.hex}</span>
            {color.isBase && <small>BASE</small>}
          </button>
        ))}
      </div>

      <div className="harmony-v2-actions">
        <button type="button" className="btn" onClick={savePalette}>
          Save palette
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => copyText(colors.map((color) => color.hex).join("\n"), "Copied all hex colors.")}
        >
          Copy hex list
        </button>
      </div>

      <div className="harmony-v2-export">
        <label className="harmony-v2-field">
          <span>Export format</span>
          <select value={exportFormat} onChange={(event) => setExportFormat(event.target.value)}>
            <option value="css">CSS variables (.css)</option>
            <option value="json">JSON data (.json)</option>
            <option value="txt">Plain text (.txt)</option>
            <option value="svg">Palette image (.svg)</option>
          </select>
        </label>
        <button type="button" className="btn" onClick={downloadPalette}>
          Export file
        </button>
      </div>

      <div className="harmony-v2-saved">
        <div className="harmony-v2-saved-heading">
          <h3>Saved palettes</h3>
          <span>{savedPalettes.length}</span>
        </div>

        {!savedPalettes.length ? (
          <p className="harmony-v2-empty">Your saved palettes will appear here.</p>
        ) : (
          <div className="harmony-v2-saved-list">
            {savedPalettes.map((saved) => (
              <div className="harmony-v2-saved-item" key={saved.id}>
                <div className="harmony-v2-saved-info">
                  <strong>{saved.name}</strong>
                  <span>{saved.type} · {saved.colors?.length || 0} colors</span>
                  <div className="harmony-v2-mini-swatches">
                    {(saved.colors || []).slice(0, 12).map((color, index) => (
                      <span
                        key={`${saved.id}-${index}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.hex}
                      />
                    ))}
                  </div>
                </div>
                <div className="harmony-v2-saved-buttons">
                  <button type="button" className="btn" onClick={() => loadPalette(saved)}>
                    Load
                  </button>
                  <button type="button" className="btn" onClick={() => deletePalette(saved.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {status && <p className="harmony-v2-status" role="status">{status}</p>}
    </section>
  );
}
