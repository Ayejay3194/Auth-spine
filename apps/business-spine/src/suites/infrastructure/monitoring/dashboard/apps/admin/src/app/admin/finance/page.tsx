import React from "react";
import { Shell } from "@/components/Shell";
import { Gate } from "@/components/Gate";

export default async function Finance() {
  return (
    <Shell title="Finance" subtitle="Revenue, expenses, margin, and cash flow.">
      <Gate flag="module.finance">
        <div className="grid grid-2">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>P&L Snapshot</h3>
            <table className="table">
              <tbody>
                <tr><th>Gross Revenue (MTD)</th><td>$112,420</td></tr>
                <tr><th>Refunds (MTD)</th><td>-$3,210</td></tr>
                <tr><th>Supplies</th><td>-$9,880</td></tr>
                <tr><th>Payroll</th><td>-$42,100</td></tr>
                <tr><th>Net</th><td><b>$57,230</b></td></tr>
              </tbody>
            </table>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Cash & Forecast</h3>
            <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
              <li>Cash on hand: $84,000</li>
              <li>Expected payouts (7d): $21,500</li>
              <li>Upcoming obligations (7d): $18,300</li>
            </ul>
          </div>
        </div>
      </Gate>
    </Shell>
  );
}
