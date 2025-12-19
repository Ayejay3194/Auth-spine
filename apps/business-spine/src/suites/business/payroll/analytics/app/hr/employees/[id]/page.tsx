
import { db } from "@/lib/db";

export default async function EmployeeDetail({ params }: { params: { id: string } }) {
  const e = await db.employee.findUnique({ where: { id: params.id } });
  if (!e) return <div className="panel">Not found.</div>;
  return (
    <div className="panel">
      <div className="h1">{e.firstName} {e.lastName}</div>
      <div className="kpi">
        <div className="chip">Employee #: {e.employeeNo ?? "-"}</div>
        <div className="chip">Dept: {e.department ?? "-"}</div>
        <div className="chip">Location: {e.location ?? "-"}</div>
        <div className="chip">Pay: {e.payType} ${(e.rateCents/100).toFixed(2)}</div>
      </div>
    </div>
  );
}
