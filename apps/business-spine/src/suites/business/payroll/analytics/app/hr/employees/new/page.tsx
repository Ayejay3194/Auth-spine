
import { createEmployee } from "@/lib/actions/hr";

export default function NewEmployee() {
  return (
    <div className="panel">
      <div className="h1">Add employee</div>
      <form className="form" action={createEmployee}>
        <input className="input" name="employeeNo" placeholder="Employee No (optional)" />
        <div className="row">
          <input className="input" name="firstName" placeholder="First name" required />
          <input className="input" name="lastName" placeholder="Last name" required />
        </div>
        <div className="row">
          <input className="input" name="department" placeholder="Department" />
          <input className="input" name="location" placeholder="Location" />
        </div>
        <div className="row">
          <select className="input" name="payType" defaultValue="SALARY">
            <option value="SALARY">Salary</option>
            <option value="HOURLY">Hourly</option>
          </select>
          <input className="input" name="rateCents" placeholder="Rate cents (e.g. 2800=$28/hr; salary: 450000=$4500/period)" required />
        </div>
        <button className="button" type="submit">Create</button>
      </form>
    </div>
  );
}
