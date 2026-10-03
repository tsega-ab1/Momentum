"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! What would you like to build a routine around today?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getConfig() {
    return JSON.parse(localStorage.getItem("momentum-ai-config") || '{"provider":"mock"}');
  }

  async function send(content) {
    const config = getConfig();
    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, messages: nextMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      return data.reply;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setSending(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const text = input;
    setInput("");
    await send(text);
  }

  async function handleGenerateRoutine() {
    const reply = await send(
      "__GENERATE_ROUTINE__ Based on our conversation, generate a daily routine as JSON with this exact shape: {\"title\": string, \"items\": [{\"time\": \"HH:MM\", \"activity\": string}]}. Respond with ONLY the JSON, no other text."
    );

    if (!reply) return;

    try {
      const match = reply.match(/\{[\s\S]*\}/);
      const routine = JSON.parse(match ? match[0] : reply);
      localStorage.setItem("momentum-pending-routine", JSON.stringify(routine));
      router.push("/routine");
    } catch {
      setError("The AI's response wasn't valid routine data. Try asking again, or switch to Mock in Settings.");
    }
  }

  return (
    <main className="page" style={{ display: "flex", flexDirection: "column", height: "100vh", paddingBottom: 140 }}>
      <h1>AI Chat</h1>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            className="card"
            style={{
              margin: 0,
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              background: m.role === "user" ? "var(--accent)" : "var(--surface)",
              color: m.role === "user" ? "white" : "var(--text)",
            }}
          >
            {m.content}
          </div>
        ))}
        {sending && <p className="text-dim">Thinking…</p>}
        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div style={{ position: "fixed", bottom: 90, left: 0, right: 0, maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
        <button onClick={handleGenerateRoutine} className="btn-ghost" style={{ width: "100%", marginBottom: 8 }} disabled={sending}>
          ✨ Generate Routine
        </button>
        <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            style={{ flex: 1, padding: 12, borderRadius: 10, background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}
          />
          <button type="submit" className="btn-primary" style={{ width: "auto", padding: "0 18px" }} disabled={sending}>
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
