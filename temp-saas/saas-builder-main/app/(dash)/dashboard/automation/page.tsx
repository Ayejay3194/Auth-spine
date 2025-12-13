export default function AutomationDash() {
  return (
    <main style={{ padding: 24 }}>
      <h2>Automation</h2>
      <p>Seed presets: POST /api/automation/presets/seed</p>
      <p>Delivery worker: src/notifications/worker.ts (runOnce)</p>
    </main>
  );
}
