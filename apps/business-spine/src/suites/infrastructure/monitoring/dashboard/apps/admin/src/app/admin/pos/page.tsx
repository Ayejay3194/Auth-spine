import React from "react";
import { Shell } from "@/components/Shell";
import { Gate } from "@/components/Gate";
import { txns } from "@/server/db/mock";

export default async function POS() {
  const rows = txns();
  return (
    <Shell title="POS & Payments" subtitle="Charges, refunds, payouts.">
      <Gate flag="module.pos">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Transactions</h3>
          <table className="table">
            <thead><tr><th>ID</th><th>Time</th><th>Kind</th><th>Provider</th><th>Amount</th><th>Status</th><th>Note</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td className="muted">{r.id}</td>
                  <td className="muted">{new Date(r.tsISO).toLocaleString()}</td>
                  <td>{r.kind}</td>
                  <td className="muted">{r.provider}</td>
                  <td>{(r.amount.cents/100).toLocaleString(undefined,{style:"currency",currency:r.amount.currency})}</td>
                  <td>{r.status}</td>
                  <td className="muted">{r.note ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Gate>
    </Shell>
  );
}
