
import { db } from "@/lib/db";
import { generateItems } from "@/lib/actions/payroll";

export default async function Run({ params }: { params: { id: string } }) {
  const run = await db.payRun.findUnique({ where: { id: params.id }, include: { payGroup: true, items: { include: { employee: true } }, exceptions: true } });
  if (!run) return <div className="panel">Not found.</div>;

  return (
    <div className="grid">
      <div className="panel row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="h1">Run: {run.payGroup.name}</div>
          <div className="small">Status: {run.status}</div>
        </div>
        {run.items.length === 0 && (
          <form action={generateItems}><input type="hidden" name="id" value={run.id} /><button className="button">Generate items</button></form>
        )}
      </div>

      <div className="panel">
        <h2 className="h2">Exceptions</h2>
        {run.exceptions.length === 0 ? (
          <div className="small">None.</div>
        ) : (
          <table className="table">
            <thead><tr><th>Kind</th><th>Message</th><th>Created</th></tr></thead>
            <tbody>
              {run.exceptions.map(x => (<tr key={x.id}><td>{x.kind}</td><td>{x.message}</td><td>{x.createdAt.toISOString()}</td></tr>))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <h2 className="h2">Items</h2>
        <table className="table">
          <thead><tr><th>Employee</th><th>Gross</th><th>Taxes</th><th>Deductions</th><th>Net</th></tr></thead>
          <tbody>
            {run.items.map(i => (
              <tr key={i.id}>
                <td>{i.employee.firstName} {i.employee.lastName}</td>
                <td>${(i.grossCents/100).toFixed(2)}</td>
                <td>${(i.taxesCents/100).toFixed(2)}</td>
                <td>${(i.deductionsCents/100).toFixed(2)}</td>
                <td>${(i.netCents/100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
