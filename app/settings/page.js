"use client";

import { useState, useEffect } from "react";

const providers = [
  { id: "mock", label: "Mock (no key needed, for testing)" },
  { id: "openai", label: "OpenAI" },
  { id: "anthropic", label: "Anthropic" },
];

export default function SettingsPage() {
  const [provider, setProvider] = useState("mock");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const config = JSON.parse(localStorage.getItem("momentum-ai-config") || "{}");
    setProvider(config.provider || "mock");
    setModel(config.model || "");
    setApiKey(config.apiKey || "");
  }, []);

  function handleSave(e) {
    e.preventDefault();
    localStorage.setItem(
      "momentum-ai-config",
      JSON.stringify({ provider, model, apiKey })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="page">
      <h1>Settings</h1>
      <p className="text-dim">Choose your AI engine and add your API key.</p>

      <form onSubmit={handleSave} className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)" }}
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        {provider !== "mock" && (
          <>
            <div>
              <label style={{ display: "block", marginBottom: 6 }}>Model</label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={provider === "openai" ? "gpt-4o-mini" : "claude-3-5-sonnet-20241022"}
                style={{ width: "100%", padding: 10, borderRadius: 8, background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6 }}>API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                style={{ width: "100%", padding: 10, borderRadius: 8, background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)" }}
              />
              <p className="text-dim" style={{ fontSize: 13, marginTop: 6 }}>
                Stored only in this browser. Never sent anywhere except directly to {provider} through our own server, per request.
              </p>
            </div>
          </>
        )}

        <button type="submit" className="btn-primary">
          {saved ? "Saved ✓" : "Save"}
        </button>
      </form>
    </main>
  );
}
