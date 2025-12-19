
import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { createAccount } from "@/lib/actions/books";

export default async function Accounts() {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const accounts = await db.account.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="grid">
      <div className="panel">
        <div className="h1">Chart of Accounts</div>
        <div className="small">Seeded with basic defaults. Add more as needed.</div>
        <hr />
        <form className="form" action={createAccount}>
          <div className="row">
            <input className="input" name="code" placeholder="Code (e.g. 6100)" required />
            <input className="input" name="name" placeholder="Name (e.g. Payroll Expense)" required />
            <select className="input" name="type" defaultValue="EXPENSE">
              <option value="ASSET">ASSET</option>
              <option value="LIABILITY">LIABILITY</option>
              <option value="EQUITY">EQUITY</option>
              <option value="INCOME">INCOME</option>
              <option value="EXPENSE">EXPENSE</option>
            </select>
          </div>
          <button className="button" type="submit">Create account</button>
        </form>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Active</th></tr></thead>
          <tbody>
            {accounts.map(a => (
              <tr key={a.id}>
                <td>{a.code}</td>
                <td>{a.name}</td>
                <td>{a.type}</td>
                <td>{a.isActive ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
