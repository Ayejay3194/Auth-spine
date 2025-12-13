import { runAssistant } from "../../assistant/run";
import { AssistantContext } from "../../assistant/types";

function sampleContext(): AssistantContext {
  const now = new Date();
  const practitioner = { id: "p1", displayName: "AJ", timezone: "America/New_York", role: "owner" as const };

  const clients = [
    { id: "c1", email: "sarah@example.com", createdAt: new Date(now.getTime()-1000*60*60*24*120), tags: ["active"], marketingSource: "instagram" },
    { id: "c2", email: "maria@example.com", createdAt: new Date(now.getTime()-1000*60*60*24*240), tags: [], marketingSource: "google" },
  ];

  const services = [
    { id: "s_cut", practitionerId: "p1", title: "Cut", type: "LIVE" as const, basePriceCents: 5000, durationMin: 45, category: "cut", buffers: { beforeMin: 0, afterMin: 10 } },
    { id: "s_color", practitionerId: "p1", title: "Color / Balayage", type: "LIVE" as const, basePriceCents: 18000, durationMin: 180, category: "color", buffers: { beforeMin: 0, afterMin: 15 } },
  ];

  const bookings = [
    { id: "b1", serviceId: "s_color", practitionerId: "p1", clientId: "c1", startAt: new Date(now.getTime()+1000*60*60*24*2), endAt: new Date(now.getTime()+1000*60*60*24*2 + 1000*60*60*3), status: "BOOKED" as const, createdAt: new Date(now.getTime()-1000*60*60*24*1), pricePaidCents: 18000 },
    { id: "b2", serviceId: "s_cut", practitionerId: "p1", clientId: "c2", startAt: new Date(now.getTime()+1000*60*60*24*2 + 1000*60*60*5), endAt: new Date(now.getTime()+1000*60*60*24*2 + 1000*60*60*5 + 1000*60*45), status: "BOOKED" as const, createdAt: new Date(now.getTime()-1000*60*60*6), pricePaidCents: 5000 },
    { id: "b3", serviceId: "s_color", practitionerId: "p1", clientId: "c2", startAt: new Date(now.getTime()-1000*60*60*24*70), endAt: new Date(now.getTime()-1000*60*60*24*70 + 1000*60*60*3), status: "COMPLETED" as const, createdAt: new Date(now.getTime()-1000*60*60*24*71), pricePaidCents: 18000, notes: "overrun:+30" },
    { id: "b4", serviceId: "s_cut", practitionerId: "p1", clientId: "c2", startAt: new Date(now.getTime()-1000*60*60*24*10), endAt: new Date(now.getTime()-1000*60*60*24*10 + 1000*60*45), status: "NO_SHOW" as const, createdAt: new Date(now.getTime()-1000*60*60*24*11), pricePaidCents: 5000 },
  ];

  const orders = [
    { id: "o1", serviceId: "s_color", practitionerId: "p1", clientId: "c1", status: "PAID" as const, createdAt: new Date(now.getTime()-1000*60*60*24*2), amountCents: 18000, platformFeeCents: 3600 },
    { id: "o2", serviceId: "s_cut", practitionerId: "p1", clientId: "c2", status: "PAID" as const, createdAt: new Date(now.getTime()-1000*60*60*24*9), amountCents: 5000, platformFeeCents: 1000 },
  ];

  const messages = [
    { id: "m1", clientId: "c1", channel: "sms" as const, kind: "reminder" as const, sentAt: new Date(now.getTime()-1000*60*60*24*5), openedAt: new Date(now.getTime()-1000*60*60*24*5 + 1000*60*3) },
    { id: "m2", clientId: "c1", channel: "sms" as const, kind: "promo" as const, sentAt: new Date(now.getTime()-1000*60*60*24*4), openedAt: new Date(now.getTime()-1000*60*60*24*4 + 1000*60*10) },
    { id: "m3", clientId: "c1", channel: "sms" as const, kind: "promo" as const, sentAt: new Date(now.getTime()-1000*60*60*24*3), openedAt: new Date(now.getTime()-1000*60*60*24*3 + 1000*60*6) },
    { id: "m4", clientId: "c1", channel: "sms" as const, kind: "promo" as const, sentAt: new Date(now.getTime()-1000*60*60*24*2) },
    { id: "m5", clientId: "c1", channel: "sms" as const, kind: "promo" as const, sentAt: new Date(now.getTime()-1000*60*60*24*1) },
  ];

  const inventory = [{ id: "i_dev", name: "Developer", unit: "ml" as const, onHand: 1500, reorderPoint: 400, reorderQuantity: 1000, costCentsPerUnit: 1 }];
  const serviceUsage = [{ serviceId: "s_color", itemId: "i_dev", unitsPerService: 200 }];

  return { now, practitioner, clients: clients as any, services: services as any, bookings: bookings as any, orders: orders as any, messages: messages as any, inventory: inventory as any, serviceUsage: serviceUsage as any };
}

export default function DemoPage() {
  const ctx = sampleContext();
  const suggestions = runAssistant(ctx);

  return (
    <main>
      <h1>Demo Runner</h1>
      <p>Sample data → engine suggestions (with explainable “why”).</p>
      <div style={{ display: "grid", gap: 12 }}>
        {suggestions.map(s => (
          <div key={s.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <strong>{s.title}</strong>
              <span>{s.severity.toUpperCase()}</span>
            </div>
            <p style={{ marginTop: 8 }}>{s.message}</p>
            <details><summary>Why</summary><ul>{s.why.map((w,i)=><li key={i}>{w}</li>)}</ul></details>
            {s.actions?.length ? (
              <details><summary>Actions</summary><ul>{s.actions.map((a,i)=><li key={i}><code>{a.intent}</code> - {a.label}</li>)}</ul></details>
            ) : null}
          </div>
        ))}
      </div>
    </main>
  );
}
