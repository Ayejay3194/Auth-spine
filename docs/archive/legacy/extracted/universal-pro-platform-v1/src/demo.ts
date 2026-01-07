import fs from "node:fs";
import path from "node:path";
import { UniversalPlatformApp } from "./app.js";
import type { VerticalConfig } from "./platform/verticalConfig.js";

function loadCfg(file: string): VerticalConfig {
  return JSON.parse(fs.readFileSync(path.resolve("data/verticals", file), "utf-8"));
}

const app = new UniversalPlatformApp();
app.loadVerticalConfigs([
  loadCfg("beauty.json"),
  loadCfg("fitness.json"),
  loadCfg("consulting.json"),
  loadCfg("education.json"),
  loadCfg("home_services.json"),
  loadCfg("health_therapy.json"),
]);

const client = app.clients.create({ name: "AJ", phone: "+15551234567", trustScore: 82 });

const hair = app.pros.create({ vertical: "beauty", displayName: "Sarah", businessName: "Sarah Studio", payout: { provider: "mock" } });
const trainer = app.pros.create({ vertical: "fitness", displayName: "Mike", businessName: "Mike Training", payout: { provider: "mock" } });

app.bootstrapServicesForProfessional(hair.id);
app.bootstrapServicesForProfessional(trainer.id);

console.log("\nHair services:", app.services.byProfessional(hair.id).map(s => s.name));
console.log("Trainer services:", app.services.byProfessional(trainer.id).map(s => s.name));

const msg = "Ugh I need a haircut soon";
console.log("\nDetected vertical:", app.conversation.detectVertical(msg));

const now = app.clock.nowUtc();
if (app.ghostBooking.detectPassiveIntent(msg)) {
  const proposal = app.ghostBooking.propose(now);
  const outbound = app.messaging.send(client.id, "sms", proposal.message, now);
  console.log("\nGhost booking proposal:", outbound.text);
  console.log("Finalize:", app.ghostBooking.finalizeNoReply().message);
}

const svc = app.services.byProfessional(hair.id)[0];
const quote = app.pricing.quote(svc, 0);

const start = new Date(Date.now() + 7*24*3600*1000).toISOString();
const end = new Date(Date.now() + 7*24*3600*1000 + svc.durationMin*60*1000).toISOString();

const held = app.booking.hold({
  clientId: client.id,
  professionalId: hair.id,
  service: svc,
  vertical: "beauty",
  startAtUtc: start,
  endAtUtc: end,
  total: quote.total,
}, now);

const confirmed = app.booking.confirm(held.id);
const pi = app.payments.createPaymentIntent({ bookingId: confirmed.id, amount: confirmed.total, atUtc: now });

console.log("\nBooking confirmed:", confirmed.id, confirmed.vertical, confirmed.total);
console.log("Payment:", pi.status, pi.amount);

app.memory.add(client.id, { key: "pref.small_talk", value: "no", confidence: 0.9 }, now);
console.log("\nPrefers minimal talk:", app.memory.prefersMinimalTalk(client.id));

console.log("\nRevenue mode example:", app.revenue.activate(50000));
