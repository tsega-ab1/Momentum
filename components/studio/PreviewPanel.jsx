import { previewTheme } from "@/lib/preview";

function Mock({ title, theme }) {
  return (
    <div className="preview-col">
      <h3 className="small-title">{title}</h3>
      <div className="mock" style={{ background: theme.bg, color: theme.text }}>
        <div className="mock-card" style={{ background: theme.card }}>
          <p className="mock-heading">Your next release</p>
          <p style={{ color: theme.muted, margin: "4px 0 12px" }}>Ship colors that read well everywhere.</p>
          <span className="mock-button" style={{ background: theme.accent, color: theme.accentText }}>
            Get started
          </span>
        </div>
      </div>
      <ul className="levels">
        {theme.checks.map((c) => (
          <li key={c.label}>
            {c.label}: {c.display}{" "}
            <span className={`level ${c.level === "Fail" ? "level-fail" : "level-pass"}`}>
              {c.level === "Fail" ? "✕ Fail" : `✓ ${c.level}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Pure presentation, so it needs no "use client": it renders wherever its parent does.
export default function PreviewPanel({ colors }) {
  const theme = previewTheme(colors);
  return (
    <section className="card" aria-labelledby="preview-title">
      <h2 id="preview-title" className="card-title">
        Theme preview
      </h2>
      <div className="preview-grid">
        <Mock title="Light" theme={theme.light} />
        <Mock title="Dark" theme={theme.dark} />
      </div>
    </section>
  );
}
