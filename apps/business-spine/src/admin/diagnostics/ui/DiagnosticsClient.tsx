"use client";

import { useState } from "react";
import type { RunResponse } from "../types";
import { DiagCard } from "./DiagCard";

export default function DiagnosticsClient() {
  const [out, setOut] = useState<RunResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/diagnostics/run", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as RunResponse;
      setOut(json);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <button
        onClick={run}
        disabled={busy}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #333",
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        {busy ? "Running…" : "Run diagnostics"}
      </button>

      {err ? (
        <div style={{ marginTop: 12, color: "crimson" }}>
          <strong>Error:</strong> {err}
          <div style={{ opacity: 0.8, marginTop: 6 }}>
            If you haven't wired real auth yet, send header <code>x-diag-secret</code> matching <code>DIAG_SHARED_SECRET</code>.
          </div>
        </div>
      ) : null}

      {out ? (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", opacity: 0.9 }}>
            <span><strong>Run:</strong> {out.runId}</span>
            <span><strong>At:</strong> {out.at}</span>
            <span><strong>OK:</strong> {out.summary.ok}</span>
            <span><strong>Warn:</strong> {out.summary.warn}</span>
            <span><strong>Fail:</strong> {out.summary.fail}</span>
          </div>

          <div style={{ marginTop: 12 }}>
            {out.results.map((r) => <DiagCard key={r.id} r={r} />)}
          </div>
        </div>
      ) : null}
    </section>
  );
}
