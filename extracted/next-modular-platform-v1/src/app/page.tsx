export default function Page() {
  return (
    <main className="card">
      <h1>Modular Platform V1</h1>
      <p className="small">
        This is a minimal Next.js app that boots your module registry and exposes a test API.
      </p>

      <div className="row">
        <a href="/test"><button>Open Test Console</button></a>
        <a href="/api/registry"><button>GET /api/registry</button></a>
        <a href="/api/smoke"><button>POST /api/smoke</button></a>
      </div>

      <p className="small">
        Tip: run <code>npm i</code> then <code>npm run dev</code>, open <code>http://localhost:3000</code>.
      </p>
    </main>
  );
}
