import React from "react";
import { Shell } from "@/components/Shell";
import { Gate } from "@/components/Gate";

export default async function Reports() {
  return (
    <Shell title="Reports & Exports" subtitle="Generate CSVs and packets for accountants and disputes.">
      <Gate flag="module.reports">
        <div className="grid grid-2">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Exports</h3>
            <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
              <li>Transactions CSV</li>
              <li>Refunds CSV</li>
              <li>Payroll CSV</li>
              <li>Inventory snapshot CSV</li>
            </ul>
            <button className="btn" style={{ marginTop: 10 }}>Generate (stub)</button>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Report Packs</h3>
            <p className="muted">Bundle exports + audit IDs into one packet when disputes happen.</p>
            <button className="btn">Create Dispute Packet (stub)</button>
          </div>
        </div>
      </Gate>
    </Shell>
  );
}
