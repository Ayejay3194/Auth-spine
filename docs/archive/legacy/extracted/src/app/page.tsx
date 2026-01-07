export default function Page() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24, lineHeight: 1.5, maxWidth: 860 }}>
      <h1>Universal Pro Platform (Next-only scaffold)</h1>
      <p>
        V1 booking wedge + universal multi-vertical core. Modular TS code so your tooling stops making up architecture.
      </p>

      <h2>Endpoints</h2>
      <ul>
        <li><code>POST /api/sms/inbound</code> (Twilio webhook)</li>
        <li><code>GET /api/verticals</code> (vertical configs)</li>
        <li><code>POST /api/professional/onboard</code> (onboarding + seed services)</li>
        <li><code>GET /api/service?professionalId=...</code> (service catalog)</li>
      </ul>

      <h2>How to add a vertical</h2>
      <ol>
        <li>Add <code>src/server/modules/verticals/configs/&lt;vertical&gt;.json</code></li>
        <li>Import it in <code>vertical.registry.ts</code></li>
      </ol>
    </main>
  );
}
