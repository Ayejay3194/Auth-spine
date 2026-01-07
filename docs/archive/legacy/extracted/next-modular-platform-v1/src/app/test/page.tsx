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
      <p className="small">Buttons call API routes that boot the registry and publish a few events.</p>

      <div className="row">
        <button onClick={() => hit("/api/registry")}>List registry</button>
        <button onClick={() => hit("/api/smoke", { method: "POST" })}>Run smoke events</button>
        <button
          onClick={() =>
            hit("/api/publish", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                type: "booking.requested",
                subject: { userId: "usr_1", artistId: "art_1", bookingId: "bd_1" },
                channel: "web",
                payload: { any: "data" },
              }),
            })
          }
        >
          Publish booking.requested
        </button>
      </div>

      <pre style={{ marginTop: 16 }}>{log || "No output yet."}</pre>
    </main>
  );
}
