import PageView from "@/app/_components/PageView";

import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { createBankAccount, addBankTxn, importBankCsv } from "@/lib/actions/books";
import { fmt } from "@/lib/money";

export default async function Banking() {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");

  const [banks, txns] = await Promise.all([
    db.bankAccount.findMany({ orderBy: { createdAt: "desc" } }),
    db.bankTxn.findMany({ take: 100, orderBy: { postedAt: "desc" }, include: { bankAccount: true } })
  ]);

  return (
    <>
      <PageView name="banking_view" />
    <div className="grid">
      <div className="panel">
        <div className="h1">Banking</div>
        <div className="small">Manual bank transactions (V1). Reconciliation is next.</div>
        <hr />
        <div className="grid grid2">
          <div className="panel">
            <div className="h2">New bank account</div>
            <form className="form" action={createBankAccount}>
              <input className="input" name="name" placeholder="Bank account name" required />
              <input className="input" name="currency" defaultValue="USD" />
              <button className="button">Create</button>
            </form>
          </div>

          <div className="panel">
            <div className="h2">Paste-import CSV (V1)</div>
            <form className="form" action={importBankCsv}>
              <select className="input" name="bankAccountId" required defaultValue={banks[0]?.id ?? ""}>
                {banks.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
              </select>
              <textarea className="input" name="csvText" rows={8} placeholder={"postedAt,description,amountCents,type\n2025-12-01,Coffee,-550,WITHDRAWAL\n2025-12-02,Client payment,15000,DEPOSIT"} />
              <div className="small">Columns: postedAt, description, amountCents, type(optional).</div>
              <button className="button">Import</button>
            </form>
          </div>

          <div className="panel">
            <div className="h2">Add bank txn</div>
            <form className="form" action={addBankTxn}>
              <select className="input" name="bankAccountId" required defaultValue={banks[0]?.id ?? ""}>
                {banks.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
              </select>
              <select className="input" name="type" defaultValue="DEPOSIT">
                <option value="DEPOSIT">DEPOSIT</option>
                <option value="WITHDRAWAL">WITHDRAWAL</option>
                <option value="TRANSFER">TRANSFER</option>
              </select>
              <input className="input" name="description" placeholder="Description" required />
              <input className="input" name="amountCents" placeholder="Amount cents (deposit +, withdrawal - is fine too)" required />
              <button className="button">Add</button>
            </form>
          </div>
        </div>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Bank</th><th>Posted</th><th>Type</th><th>Description</th><th>Amount</th></tr></thead>
          <tbody>
            {txns.map(t => (
              <tr key={t.id}>
                <td>{t.bankAccount.name}</td>
                <td>{t.postedAt.toISOString()}</td>
                <td>{t.type}</td>
                <td>{t.description}</td>
                <td>{fmt(t.amountCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}
