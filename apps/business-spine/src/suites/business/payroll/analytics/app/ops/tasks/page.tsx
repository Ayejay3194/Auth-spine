
import { db } from "@/lib/db";

export default async function Tasks() {
  const tasks = await db.task.findMany({ take: 50, orderBy: { createdAt: "desc" } });
  return (
    <div className="grid">
      <div className="panel">
        <div className="h1">Ops Tasks</div>
        <div className="small">Basic list.</div>
      </div>
      <div className="panel">
        <table className="table">
          <thead><tr><th>Title</th><th>Status</th></tr></thead>
          <tbody>
            {tasks.map(t => (<tr key={t.id}><td>{t.title}</td><td>{t.status}</td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
