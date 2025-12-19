
import { getViewer, requireRole } from "@/lib/auth";
import { computeTrialBalance } from "@/lib/books/engine";
import { fmt } from "@/lib/money";

export default async function Reports() {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");

  const tb = await computeTrialBalance();

  const assets = tb.filter(r => r.type==="ASSET").reduce((s,r)=>s+r.balance,0);
  const liabilities = tb.filter(r => r.type==="LIABILITY").reduce((s,r)=>s+r.balance,0);
  const equity = tb.filter(r => r.type==="EQUITY").reduce((s,r)=>s+r.balance,0);
  const income = tb.filter(r => r.type==="INCOME").reduce((s,r)=>s+r.balance,0);
  const expense = tb.filter(r => r.type==="EXPENSE").reduce((s,r)=>s+r.balance,0);
  const netIncome = income - expense;

  return (
    <div className="grid">
      <div className="panel">
        <div className="h1">Reports</div>
        <div className="small">Trial Balance, P&L, Balance Sheet (basic).</div>
      </div>

      <div className="panel">
        <div className="h2">Profit & Loss</div>
        <div className="kpi">
          <div className="chip">Income: {fmt(income)}</div>
          <div className="chip">Expenses: {fmt(expense)}</div>
          <div className="chip">Net income: {fmt(netIncome)}</div>
        </div>
      </div>

      <div className="panel">
        <div className="h2">Balance Sheet (very basic)</div>
        <div className="kpi">
          <div className="chip">Assets: {fmt(assets)}</div>
          <div className="chip">Liabilities: {fmt(liabilities)}</div>
          <div className="chip">Equity: {fmt(equity)}</div>
        </div>
        <div className="small">Convention here uses debit-positive balances. Don’t panic.</div>
      </div>

      <div className="panel">
        <div className="h2">Trial Balance</div>
        <table className="table">
          <thead><tr><th>Code</th><th>Account</th><th>Type</th><th>Debits</th><th>Credits</th><th>Balance</th></tr></thead>
          <tbody>
            {tb.map(r => (
              <tr key={r.accountId}>
                <td>{r.code}</td>
                <td>{r.name}</td>
                <td>{r.type}</td>
                <td>{fmt(r.debit)}</td>
                <td>{fmt(r.credit)}</td>
                <td>{fmt(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
