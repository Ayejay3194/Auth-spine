"use client";
import { useState } from "react";

export default function TestPage() {
  const [log, setLog] = useState<string>("");

  async function hit(url: string, opts?: RequestInit) {
    setLog((l) => l + `\n→ ${opts?.method ?? "GET"} ${url}`);
    const res = await fetch(url, opts);
    const text = await res.text();
    setLog((l) => l + `\n← ${res.status} ${res.statusText}\n${text}\n`);
  }

  return (
    <main className="card">
      <h1>Test Console</h1>
      <p className="small">API pokes to prove the kernel works.</p>

      <div style={{display:"flex", gap: 12, flexWrap:"wrap"}}>
        <button onClick={() => hit("/api/verticals")}>List verticals</button>
        <button onClick={() => hit("/api/registry")}>List registry</button>
        <button onClick={() => hit("/api/smoke", { method: "POST" })}>Run smoke events</button>
        <button
          onClick={() =>
            hit("/api/compliance/evaluate", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                vertical: "beauty",
                event: {
                  type: "media.publish",
                  subject: { userId: "usr_1", professionalId: "pro_1" },
                  payload: { assetKind: "before_after" }
                },
                consents: []
              })
            })
          }
        >
          Evaluate compliance (beauty)
        </button>
      </div>

      <pre style={{ marginTop: 16 }}>{log || "No output yet."}</pre>
    </main>
  );
}
