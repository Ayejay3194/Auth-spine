import { Orchestrator } from "./orchestrator.js";
import { tools } from "../adapters/memory.js";
import { bookingSpine, crmSpine, paymentsSpine, marketingSpine, analyticsSpine, admin_securitySpine, diagnosticsSpine, astrologySpine } from "../spines/index.js";

export function createDefaultOrchestrator() {
  return new Orchestrator({
    spines: [bookingSpine, crmSpine, paymentsSpine, marketingSpine, analyticsSpine, admin_securitySpine, diagnosticsSpine, astrologySpine],
    tools,
  });
}
