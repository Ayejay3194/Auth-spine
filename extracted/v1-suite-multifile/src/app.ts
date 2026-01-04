import { EventBus } from "./core/bus.js";
import { AnalyticsSink } from "./core/analytics.js";
import { SystemClock } from "./core/clock.js";
import type { AssistantRequest, AssistantResponse } from "./core/types.js";

import { NLUModule } from "./modules/nlu.js";
import { DecisionModule } from "./modules/decisions.js";

export class App {
  bus = new EventBus();
  analytics = new AnalyticsSink();
  clock = new SystemClock();

  nlu = new NLUModule();
  decisions = new DecisionModule();

  async handleAssistant(req: AssistantRequest): Promise<AssistantResponse> {
    const nlu = req.nlu ?? this.nlu.parse(req.text);
    return this.decisions.respond(nlu);
  }
}
