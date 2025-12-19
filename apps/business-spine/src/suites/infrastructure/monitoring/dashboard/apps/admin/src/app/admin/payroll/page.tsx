import React from "react";
import { Shell } from "@/components/Shell";
import { Gate } from "@/components/Gate";
import { payrollRuns } from "@/server/db/mock";

export default async function Payroll() {
  const runs = payrollRuns();
  return (
    <Shell title="Payroll & Compensation" subtitle="Payroll runs, commission rules, approvals, exports.">
      <Gate flag="module.payroll">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Payroll Runs</h3>
          <table className="table">
            <thead><tr><th>Period</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {runs.map(r => (
                <tr key={r.id}>
                  <td>{r.periodLabel}</td>
                  <td>{(r.total.cents/100).toLocaleString(undefined,{style:"currency",currency:r.total.currency})}</td>
                  <td className="muted">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Gate>
    </Shell>
  );
}
