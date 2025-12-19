import React from "react";
import Link from "next/link";
import { LayoutDashboard, Wallet, CreditCard, Users, Calendar, Boxes, Building2, Shield, FileDown } from "lucide-react";

export function Shell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="container">
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26 }}>{title}</h1>
            {subtitle && <div className="muted" style={{ marginTop: 6 }}>{subtitle}</div>}
          </div>
          <span className="badge">Ops Spine • receipts-first • flags everywhere</span>
        </div>
        <nav className="nav" style={{ marginTop: 12 }}>
          <Link href="/admin"><LayoutDashboard size={16} /> Exec</Link>
          <Link href="/admin/finance"><Wallet size={16} /> Finance</Link>
          <Link href="/admin/pos"><CreditCard size={16} /> POS</Link>
          <Link href="/admin/payroll"><Users size={16} /> Payroll</Link>
          <Link href="/admin/scheduling"><Calendar size={16} /> Scheduling</Link>
          <Link href="/admin/inventory"><Boxes size={16} /> Inventory</Link>
          <Link href="/admin/vendors"><Building2 size={16} /> Vendors</Link>
          <Link href="/admin/compliance"><Shield size={16} /> Compliance</Link>
          <Link href="/admin/reports"><FileDown size={16} /> Reports</Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
