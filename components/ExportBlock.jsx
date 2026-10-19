"use client";

import { useMemo, useState } from "react";
import { EXPORT_FORMATS, exportSystem, slugify } from "@/lib/color";
import CopyButton from "./CopyButton";

const LABELS = { css: "CSS variables", tailwind: "Tailwind v4", scss: "SCSS", json: "JSON tokens" };
const EXTENSION = { css: "css", tailwind: "css", scss: "scss", json: "json" };

// downloadBase: when given (public pages), Download goes through the Route Handler.
// Without it (the Studio, for unsaved work), the file is built in the browser.
export default function ExportBlock({ system, defaultFormat = "css", downloadBase = null }) {
  const [format, setFormat] = useState(defaultFormat);
  const code = useMemo(() => exportSystem(system, format), [system, format]);

  function downloadInBrowser() {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(system.name)}.${EXTENSION[format]}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="export">
      <div className="segmented" role="group" aria-label="Export format">
        {EXPORT_FORMATS.map((f) => (
          <button key={f} type="button" className="seg" aria-pressed={format === f} onClick={() => setFormat(f)}>
            {LABELS[f]}
          </button>
        ))}
      </div>
      <pre className="code" tabIndex={0} aria-label={`${LABELS[format]} export`}>
        <code>{code}</code>
      </pre>
      <div className="actions">
        <CopyButton text={code} label="Copy code" className="btn btn-primary" />
        {downloadBase ? (
          <a className="btn" href={`${downloadBase}?format=${format}&download=1`} download>
            Download file
          </a>
        ) : (
          <button type="button" className="btn" onClick={downloadInBrowser}>
            Download file
          </button>
        )}
      </div>
    </div>
  );
}
