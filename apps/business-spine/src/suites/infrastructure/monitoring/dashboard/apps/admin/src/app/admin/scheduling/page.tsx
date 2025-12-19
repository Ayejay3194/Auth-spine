import React from "react";
import { Shell } from "@/components/Shell";
import { Gate } from "@/components/Gate";

export default async function Scheduling() {
  return (
    <Shell title="Scheduling ↔ Labor" subtitle="Capacity, utilization, and staffing suggestions (never auto-apply).">
      <Gate flag="module.scheduling">
        <div className="grid grid-3">
          <div className="card"><h3 style={{ marginTop: 0 }}>Utilization</h3><div style={{ fontSize: 28, fontWeight: 800 }}>78%</div><div className="muted">Booked / Available</div></div>
          <div className="card"><h3 style={{ marginTop: 0 }}>Revenue per Hour</h3><div style={{ fontSize: 28, fontWeight: 800 }}>$210</div><div className="muted">Average</div></div>
          <div className="card"><h3 style={{ marginTop: 0 }}>No-show Risk (stub)</h3><div style={{ fontSize: 28, fontWeight: 800 }}>0.18</div><div className="muted">Hook ML later</div></div>
        </div>
      </Gate>
    </Shell>
  );
}
