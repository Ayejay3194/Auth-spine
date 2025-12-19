import React from "react";
import { Shell } from "@/components/Shell";
import { Gate } from "@/components/Gate";
import { auditLog } from "@/server/db/mock";

export default async function Compliance() {
  const audits = auditLog();
  return (
    <Shell title="Compliance" subtitle="Audit logs, approvals, exports, sensitive action review.">
      <Gate flag="module.compliance">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Audit Log</h3>
          <table className="table">
            <thead><tr><th>Time</th><th>Action</th><th>Meta</th></tr></thead>
            <tbody>
              {audits.map(a => (
                <tr key={a.id}>
                  <td className="muted">{new Date(a.tsISO).toLocaleString()}</td>
                  <td>{a.action}</td>
                  <td className="muted">{JSON.stringify(a.meta ?? {})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Gate>
    </Shell>
  );
}
