"use client";

import Link from "next/link";
import { useState } from "react";

export default function GeneratePage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  async function submit() {
    const resp = await fetch("/api/generate_post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: "",
        payload: { CoreTokens: input },
        target: "demo",
      }),
    });
    const data = await resp.json();
    setResult(data.text);
  }

  return (
    <main
      style={{
        padding: 24,
        minHeight: "100vh",
        background: "#0f1720",
        color: "#e2e8f0",
      }}
    >
      <h1>SignalFlow Generate</h1>
      <textarea
        rows={8}
        cols={80}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          width: "100%",
          borderRadius: 12,
          background: "#020617",
          border: "1px solid #334155",
          color: "#e2e8f0",
          padding: 12,
          marginTop: 12,
        }}
      />
      <div style={{ marginTop: 16 }}>
        <button
          onClick={submit}
          style={{
            background: "#38bdf8",
            color: "#0f1720",
            border: "none",
            borderRadius: 12,
            padding: "12px 20px",
            cursor: "pointer",
          }}
        >
          Generate
        </button>
      </div>
      <h2 style={{ marginTop: 24 }}>Result</h2>
      <pre
        style={{
          background: "#020617",
          border: "1px solid #334155",
          borderRadius: 14,
          padding: 18,
        }}
      >
        {result}
      </pre>
      <p style={{ marginTop: 24 }}>
        <Link href="/">Back to home</Link>
      </p>
    </main>
  );
}
