import React from "react";
import { Shell } from "@/components/Shell";
import { Gate } from "@/components/Gate";
import { inventory } from "@/server/db/mock";

export default async function Inventory() {
  const items = inventory();
  return (
    <Shell title="Inventory" subtitle="Supplies, reorder thresholds, and cost inputs.">
      <Gate flag="module.inventory">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Items</h3>
          <table className="table">
            <thead><tr><th>Name</th><th>On Hand</th><th>Reorder At</th><th>Unit Cost</th><th>Status</th></tr></thead>
            <tbody>
              {items.map(i => {
                const low = i.onHand <= i.reorderAt;
                return (
                  <tr key={i.id}>
                    <td>{i.name}</td>
                    <td className="muted">{i.onHand}</td>
                    <td className="muted">{i.reorderAt}</td>
                    <td>{(i.unitCost.cents/100).toLocaleString(undefined,{style:"currency",currency:i.unitCost.currency})}</td>
                    <td>{low ? "REORDER" : "OK"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Gate>
    </Shell>
  );
}
