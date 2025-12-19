
import { createPayRun } from "@/lib/actions/payroll";

export default function NewRun() {
  return (
    <div className="panel">
      <div className="h1">New payroll run</div>
      <form className="form" action={createPayRun}>
        <input className="input" name="payGroupName" placeholder="Pay group name" required />
        <input className="input" name="notes" placeholder="Notes (optional)" />
        <button className="button" type="submit">Create</button>
      </form>
    </div>
  );
}
