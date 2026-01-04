export default function Page() {
  return (
    <main className="card">
      <h1>Universal Professional Platform V1</h1>
      <p className="small">
        Kernel: booking + payments + CRM + trust + referrals. Verticals are configs. Compliance is policy rules.
      </p>

      <div style={{display:"flex", gap: 12, flexWrap:"wrap", marginTop: 12}}>
        <a href="/onboarding"><button>Onboarding (config-driven)</button></a>
        <a href="/test"><button>Test Console</button></a>
        <a href="/api/verticals"><button>GET /api/verticals</button></a>
        <a href="/api/registry"><button>GET /api/registry</button></a>
      </div>

      <hr/>

      <div className="grid">
        <div className="card col6">
          <h3>What ships in this zip</h3>
          <ul className="small">
            <li>Vertical config system (JSON + TS types + loader)</li>
            <li>Config-driven onboarding UI</li>
            <li>Compliance evaluator (policy rules)</li>
            <li>Referral policy + bundle suggestion stubs</li>
            <li>Modules 33–47 (event-driven kernel subset)</li>
          </ul>
        </div>
        <div className="card col6">
          <h3>Quick smoke</h3>
          <p className="small">Run dev server, then click:</p>
          <ul className="small">
            <li><code>/onboarding</code> to create a professional profile draft</li>
            <li><code>/api/compliance/evaluate</code> to validate an action against vertical rules</li>
            <li><code>/api/smoke</code> to publish core events</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
