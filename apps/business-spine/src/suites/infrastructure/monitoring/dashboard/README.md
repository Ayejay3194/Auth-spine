Ops Dashboard Spine Kit
======================

Portable Operations + Finance + Employee dashboard scaffold.
Built to plug into your existing auth/tenant spine and scale from “dad bookings” to “multi-location chaos.”

What you get
------------
- Next.js Admin Dashboard (App Router) with modules:
  - Executive (KPIs + alerts)
  - Finance (Revenue, Expenses, P&L)
  - POS & Payments (transactions, refunds, settlement)
  - Payroll & Compensation (runs, commission rules, exports)
  - Scheduling ↔ Labor (utilization, capacity, no-show risk placeholders)
  - Inventory (items, reorder rules, usage)
  - Vendors & Subscriptions (contracts, renewals, spend)
  - Compliance (audit log viewer, approvals queue)
  - Reports & Exports (CSV export stubs)
- Feature-flag gating for every module
- Audit/event schema + “receipts-first” ops scaffolding
- Admin notifications interface (stub): webhook adapter pattern

Quick start
-----------
1) cd apps/admin
2) npm i
3) npm run dev
4) http://localhost:3000/admin

Wire real systems
-----------------
- Payments: apps/admin/src/server/adapters/payments (create your adapters)
- Payroll:  apps/admin/src/server/adapters/payroll
- POS:      apps/admin/src/server/adapters/pos
- DB:       apps/admin/src/server/db (swap mock -> real)
- Notify:   apps/admin/src/server/notify
