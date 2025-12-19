"use client";

import type { DiagResult } from "../types";

export function DiagCard({ r }: { r: DiagResult }) {
  const badge =
    r.status === "ok" ? "✅" : r.status === "warn" ? "⚠️" : "🛑";

  return (
    <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <strong>{badge} {r.name}</strong>
        <span style={{ opacity: 0.8 }}>{r.ms}ms</span>
      </div>
      {r.details ? (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 8, fontSize: 12, opacity: 0.9 }}>
{JSON.stringify(r.details, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
