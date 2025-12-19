import PageView from "@/app/_components/PageView";

import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { createCustomer, createInvoice, recordInvoicePayment, applyTaxToInvoice } from "@/lib/actions/books";
import { fmt } from "@/lib/money";

export default async function Invoices() {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");

  const [customers, invoices, taxRates] = await Promise.all([
    db.customer.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    db.invoice.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { customer: true, payments: true, lines: true } }),
    db.salesTaxRate.findMany({ orderBy: { name: "asc" } })
  ]);

  const exampleLines = JSON.stringify([{ description: "Consulting", qty: 1, unitCents: 15000 }], null, 2);

  return (
    <>
      <PageView name="invoices_view" />
    <div className="grid">
      <div className="panel grid">
        <div>
          <div className="h1">Invoices (A/R)</div>
          <div className="small">Create customers, issue invoices, record payments (posts Dr Cash Cr A/R).</div>
        </div>
        <div className="grid grid2">
          <div className="panel">
            <div className="h2">New customer</div>
            <form className="form" action={createCustomer}>
              <input className="input" name="name" placeholder="Customer name" required />
              <input className="input" name="email" placeholder="Email (optional)" />
              <button className="button">Create</button>
            </form>
          </div>
          <div className="panel">
            <div className="h2">New invoice</div>
            <form className="form" action={createInvoice}>
              <select className="input" name="customerId" required defaultValue={customers[0]?.id ?? ""}>
                {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <input className="input" type="date" name="dueDate" />
              <input className="input" name="memo" placeholder="Memo" />
              <textarea className="input" name="linesJson" rows={6} defaultValue={exampleLines} />
              <div className="small">Lines JSON: description, qty, unitCents</div>
              <button className="button">Issue invoice</button>
            </form>
          </div>
        </div>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Customer</th><th>Status</th><th>Total</th><th>Paid</th><th>Actions</th></tr></thead>
          <tbody>
            {invoices.map(inv => {
              const paid = inv.payments.reduce((s,p)=>s+p.amountCents,0);
              return (
                <tr key={inv.id}>
                  <td>{inv.customer.name}</td>
                  <td><span className={"pill " + (inv.status==="PAID"?"good": inv.status==="ISSUED"?"warn":"")}>{inv.status}</span></td>
                  <td>{fmt(inv.totalCents)}</td>
                  <td>{fmt(paid)}</td>
                  <td>
                    {inv.status !== "PAID" && (
                      <div className="grid" style={{gap:8}}>

                    <form className="row" action={applyTaxToInvoice}>
                      <input type="hidden" name="invoiceId" value={inv.id} />
                      <select className="input" name="taxRateName" defaultValue={taxRates[0]?.name ?? ""}>
                        {taxRates.map(t => (<option key={t.id} value={t.name}>{t.name} ({(t.rateBps/100).toFixed(2)}%)</option>))}
                      </select>
                      <button className="button">Apply tax</button>
                    </form>

                      <form className="row" action={recordInvoicePayment}>
                        <input type="hidden" name="invoiceId" value={inv.id} />
                        <input className="input" name="amountCents" placeholder="Amount cents" defaultValue={String(inv.totalCents - paid)} />
                        <input className="input" name="method" placeholder="method (cash/ach/card)" />
                        <button className="button">Record payment</button>
                      </form>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}
