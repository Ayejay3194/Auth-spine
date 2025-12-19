import React from "react";
import { Shell } from "@/components/Shell";
import { KPIs } from "@/components/KPIs";
import { Gate } from "@/components/Gate";
import { kpis, auditLog } from "@/server/db/mock";

export default async function AdminHome() {
  const items = kpis();
  const audits = auditLog();
  return (
    <Shell title="Executive Dashboard" subtitle="One screen to run the business.">
      <Gate flag="module.executive">
        <div style={{ display: "grid", gap: 14 }}>
          <KPIs items={items} />

          <div className="grid grid-2">
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Red Flags</h3>
              <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
                <li>2 failed payments in last 24h</li>
                <li>Inventory item below reorder threshold</li>
                <li>Utilization trending down in late afternoon</li>
              </ul>
            </div>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Today’s Focus</h3>
              <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
                <li>Confirm schedule for tomorrow (3 open slots)</li>
                <li>Approve payroll draft</li>
                <li>Review refund queue</li>
              </ul>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Recent Sensitive Actions (Audit)</h3>
            <table className="table">
              <thead><tr><th>Time</th><th>Action</th><th>Details</th></tr></thead>
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
        </div>
      </Gate>
    </Shell>
  );
}
