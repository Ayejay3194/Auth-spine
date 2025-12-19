import PageView from "@/app/_components/PageView";

import { getViewer } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function Home() {
  const viewer = await getViewer();
  const [employeeCount, submittedTimesheets, draftRuns, accountCount, openInvoices] = await Promise.all([
    db.employee.count(),
    db.timesheet.count({ where: { status: "SUBMITTED" } }),
    db.payRun.count({ where: { status: "DRAFT" } }),
    db.account.count(),
    db.invoice.count({ where: { status: "ISSUED" } })
  ]);

  return (
    <>
      <PageView name="home_view" />
    <div className="grid">
      <div className="panel">
        <h1 className="h1">HR + Payroll + Ops + Bookkeeping</h1>
        <div className="h2">Viewer: {viewer.email} ({viewer.role})</div>
        <div className="kpi">
          <div className="chip">Employees: {employeeCount}</div>
          <div className="chip">Timesheets submitted: {submittedTimesheets}</div>
          <div className="chip">Draft payroll runs: {draftRuns}</div>
          <div className="chip">Accounts: {accountCount}</div>
          <div className="chip">Open invoices: {openInvoices}</div>
        </div>
        <p className="small">Bookkeeping is double-entry. No, you can’t “just wing it.”</p>
      </div>
    </div>
    </>
  );
}
