import React from "react";
import { isEnabled, type FlagKey } from "@/server/flags";

export async function Gate({ flag, children }: { flag: FlagKey; children: React.ReactNode }) {
  const ok = await isEnabled(flag);
  if (!ok) {
    return (
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Module disabled</h3>
        <p className="muted">Feature flag <code>{flag}</code> is off.</p>
      </div>
    );
  }
  return <>{children}</>;
}
