
import Link from "next/link";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/auth";

export default async function EmployeesPage() {
  await getViewer();
  const employees = await db.employee.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <div className="grid">
      <div className="panel row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="h1">Employees</div>
          <div className="small">HR module.</div>
        </div>
        <Link className="button" href="/hr/employees/new">Add employee</Link>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Name</th><th>Dept</th><th>Location</th><th>Pay</th></tr></thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id}>
                <td><Link href={`/hr/employees/${e.id}`}>{e.firstName} {e.lastName}</Link></td>
                <td>{e.department ?? "-"}</td>
                <td>{e.location ?? "-"}</td>
                <td>{e.payType} ${(e.rateCents/100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
