import React from "react";
import { Shell } from "@/components/Shell";
import { Gate } from "@/components/Gate";
import { vendors } from "@/server/db/mock";

export default async function Vendors() {
  const rows = vendors();
  return (
    <Shell title="Vendors & Subscriptions" subtitle="Recurring spend, renewals, contract hygiene.">
      <Gate flag="module.vendors">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Vendors</h3>
          <table className="table">
            <thead><tr><th>Name</th><th>Monthly</th><th>Renewal</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map(v => (
                <tr key={v.id}>
                  <td>{v.name}</td>
                  <td>{(v.monthlyCents/100).toLocaleString(undefined,{style:"currency",currency:"USD"})}</td>
                  <td className="muted">{new Date(v.renewalISO).toLocaleDateString()}</td>
                  <td className="muted">{v.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Gate>
    </Shell>
  );
}
