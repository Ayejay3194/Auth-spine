import { Engine } from "../assistant/engine";
import { AssistantContext } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";

export class OnboardingEngine implements Engine {
  name="onboarding";
  run(ctx: AssistantContext) {
    return [makeSuggestion({
      engine:this.name,title:"Onboarding autopilot sequences",
      message:"Define Day 0/1/2 + day-before + day-after message sequences triggered by first booking.",
      severity:"info",practitionerId:ctx.practitioner.id,
      why:["Timeline + templates + channel preferences. Deterministic automation."],
      actions:[{label:"Open onboarding builder",intent:"open_dashboard",payload:{tab:"onboarding"}}]
    })];
  }
}
