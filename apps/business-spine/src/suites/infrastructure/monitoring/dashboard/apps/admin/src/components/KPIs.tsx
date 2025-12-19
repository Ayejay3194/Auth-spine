import React from "react";
import type { KPI } from "@spine/contracts";

export function KPIs({ items }: { items: KPI[] }) {
  return (
    <div className="grid grid-4">
      {items.map(k => (
        <div key={k.key} className="card kpi">
          <div className="label">{k.label}</div>
          <div className="value">{k.value}</div>
          <div className="muted" style={{ fontSize: 12 }}>Trend: {k.trend ?? "flat"}</div>
        </div>
      ))}
    </div>
  );
}
