import PageView from "@/app/_components/PageView";

import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { createVendor, createBill, payBill } from "@/lib/actions/books";
import { fmt } from "@/lib/money";

export default async function Bills() {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");

  const [vendors, bills] = await Promise.all([
    db.vendor.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    db.bill.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { vendor: true, payments: true, lines: true } })
  ]);

  const exampleLines = JSON.stringify([{ description: "Software subscription", amountCents: 9900 }], null, 2);

  return (
    <>
      <PageView name="bills_view" />
    <div className="grid">
      <div className="panel grid">
        <div>
          <div className="h1">Bills (A/P)</div>
          <div className="small">Create vendors, record bills, pay bills (posts Dr A/P Cr Cash).</div>
        </div>
        <div className="grid grid2">
          <div className="panel">
            <div className="h2">New vendor</div>
            <form className="form" action={createVendor}>
              <input className="input" name="name" placeholder="Vendor name" required />
              <input className="input" name="email" placeholder="Email (optional)" />
              <button className="button">Create</button>
            </form>
          </div>
          <div className="panel">
            <div className="h2">New bill</div>
            <form className="form" action={createBill}>
              <select className="input" name="vendorId" required defaultValue={vendors[0]?.id ?? ""}>
                {vendors.map(v => (<option key={v.id} value={v.id}>{v.name}</option>))}
              </select>
              <input className="input" name="memo" placeholder="Memo" />
              <textarea className="input" name="linesJson" rows={6} defaultValue={exampleLines} />
              <div className="small">Lines JSON: description, amountCents</div>
              <button className="button">Record bill</button>
            </form>
          </div>
        </div>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Vendor</th><th>Status</th><th>Total</th><th>Paid</th><th>Actions</th></tr></thead>
          <tbody>
            {bills.map(b => {
              const paid = b.payments.reduce((s,p)=>s+p.amountCents,0);
              return (
                <tr key={b.id}>
                  <td>{b.vendor.name}</td>
                  <td><span className={"pill " + (b.status==="PAID"?"good": b.status==="ISSUED"?"warn":"")}>{b.status}</span></td>
                  <td>{fmt(b.totalCents)}</td>
                  <td>{fmt(paid)}</td>
                  <td>
                    {b.status !== "PAID" && (
                      <form className="row" action={payBill}>
                        <input type="hidden" name="billId" value={b.id} />
                        <input className="input" name="amountCents" placeholder="Amount cents" defaultValue={String(b.totalCents - paid)} />
                        <input className="input" name="method" placeholder="method (cash/ach/card)" />
                        <button className="button">Pay bill</button>
                      </form>
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
