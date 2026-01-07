import DiagnosticsClient from "@/src/admin/diagnostics/ui/DiagnosticsClient";

export default function DiagnosticsPage() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1>Admin Diagnostics</h1>
      <p style={{ opacity: 0.85 }}>
        Run health + safety checks (DB, Redis, tenant isolation, audit, queue, webhook replay).
      </p>
      <DiagnosticsClient />
    </main>
  );
}
