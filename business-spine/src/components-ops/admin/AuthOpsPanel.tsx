"use client";

import React, { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";

const examplePayload = {
  metrics: {
    failed_logins_5m: 72,
    reset_failures_15m: 0,
    oauth_callback_errors_5m: 0,
    jwt_validation_errors_5m: 0,
    suspicious_admin_logins_1h: 0,
    tenant_leak_suspected_5m: 0
  },
  context: {
    scope: { tenant_id: "tenant_demo" },
    recent_changes: { deploy_sha: "abc123", version: "1.0.0", flags_changed: ["auth.rateLimit.strict"] }
  }
};

export default function AuthOpsPanel() {
  const [payload, setPayload] = useState(JSON.stringify(examplePayload, null, 2));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const incidents = useMemo(() => result?.incidents ?? [], [result]);

  const run = async () => {
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const res = await fetch("/api/ops/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      const json = await res.json();
      setResult(json);
    } catch (e: any) {
      setErr(e?.message ?? "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <h1 className="text-2xl font-bold text-white">🔐 Auth Ops Control</h1>
        <p className="mt-1 text-slate-300">
          Post auth metrics → derive incidents → run Ops Spine → notify admin (log/webhook/email stub).
        </p>
        <div className="mt-4 rounded border border-slate-700 bg-slate-900/40 p-3 text-sm text-slate-300">
          <div className="font-semibold text-slate-200">Env config</div>
          <ul className="mt-1 list-disc pl-5">
            <li><code>OPSSPINE_NOTIFY_MODE</code> = <code>log</code> | <code>webhook</code> | <code>email</code> | <code>webhook+email</code></li>
            <li><code>OPSSPINE_ADMIN_EMAIL</code> = admin email (email modes)</li>
            <li><code>OPSSPINE_WEBHOOK_URL</code> = webhook URL (webhook modes)</li>
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Run Ops Check</h2>
          <button
            type="button"
            onClick={run}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            <Send size={16} /> {loading ? "Running..." : "POST metrics"}
          </button>
        </div>

        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          className="mt-3 h-64 w-full rounded-md border border-slate-700 bg-slate-900/40 p-3 font-mono text-xs text-slate-200 outline-none"
        />

        {err && (
          <div className="mt-3 flex items-start gap-2 rounded border border-red-500/30 bg-red-500/10 p-3 text-red-200">
            <AlertCircle size={18} className="mt-0.5" />
            <div>{err}</div>
          </div>
        )}

        {result?.ok && (
          <div className="mt-3 flex items-start gap-2 rounded border border-green-500/30 bg-green-500/10 p-3 text-green-200">
            <CheckCircle2 size={18} className="mt-0.5" />
            <div>Ran. Incidents: {incidents.length}</div>
          </div>
        )}
      </div>

      {incidents.length > 0 && (
        <div className="space-y-4">
          {incidents.map((x: any, idx: number) => (
            <div key={idx} className="rounded-lg border border-slate-700 bg-slate-800 p-6">
              <div className="flex items-center justify-between">
                <div className="text-white font-semibold">
                  {x.response?.classification?.category} • SEV-{x.response?.classification?.sev} • {x.event?.incident_type}
                </div>
                <div className="text-xs text-slate-400">{x.event?.occurred_at}</div>
              </div>

              <div className="mt-3 text-slate-200">
                <div className="font-semibold text-white">Decision</div>
                <div className="mt-1">{x.response?.decision}</div>

                <div className="mt-3 font-semibold text-white">Steps</div>
                <ol className="mt-1 list-decimal pl-5 space-y-1">
                  {(x.response?.steps ?? []).map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ol>

                <div className="mt-3 font-semibold text-white">Risk notes</div>
                <ul className="mt-1 list-disc pl-5 space-y-1">
                  {(x.response?.risk_notes ?? []).map((r: string, i: number) => <li key={i}>{r}</li>)}
                </ul>

                <div className="mt-3 font-semibold text-white">Rollback plan</div>
                <ul className="mt-1 list-disc pl-5 space-y-1">
                  {(x.response?.rollback_plan ?? []).map((r: string, i: number) => <li key={i}>{r}</li>)}
                </ul>

                {(x.response?.recommended_flags?.length ?? 0) > 0 && (
                  <>
                    <div className="mt-3 font-semibold text-white">Recommended flags</div>
                    <ul className="mt-1 list-disc pl-5 space-y-1">
                      {x.response.recommended_flags.map((f: any, i: number) => (
                        <li key={i}>
                          <code className="text-cyan-300">{f.key}</code> = <span className="text-slate-200">{String(f.value)}</span>
                          <span className="text-slate-400"> ({f.reason})</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
