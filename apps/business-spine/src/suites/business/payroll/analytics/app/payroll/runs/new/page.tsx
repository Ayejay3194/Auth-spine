
import { createPayRun } from "@/lib/actions/payroll";

export default function NewRun() {
  const now = new Date();
  const start = new Date(now); start.setDate(start.getDate() - 14);
  const end = new Date(now);
  const toLocal = (d: Date) => {
    const pad = (n:number)=> String(n).padStart(2,"0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  return (
    <div className="panel">
      <div className="h1">New payroll run</div>
      <form className="form" action={createPayRun}>
        <input className="input" name="payGroupName" defaultValue="Default Biweekly" required />
        <div className="row">
          <input className="input" type="datetime-local" name="periodStart" defaultValue={toLocal(start)} required />
          <input className="input" type="datetime-local" name="periodEnd" defaultValue={toLocal(end)} required />
        </div>
        <input className="input" name="notes" placeholder="Notes" />
        <button className="button" type="submit">Create</button>
      </form>
    </div>
  );
}
