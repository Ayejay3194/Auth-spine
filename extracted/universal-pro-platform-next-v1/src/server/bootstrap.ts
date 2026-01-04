import { InMemoryEventBus } from "@/core/event-bus";
import { ModuleRegistry } from "@/core/registry";
import type { ModuleContext } from "@/core/types";
import { InMemoryStore } from "@/core/store";
import { SimpleFlags } from "@/core/flags";
import { SimplePrivacy } from "@/core/privacy";
import { ConsoleLogger } from "@/core/logger";
import { NoopScorer } from "@/core/scoring";
import { InMemoryWorkflow } from "@/core/workflow";

import { ContextCollapsePreventionEngine } from "@/modules/33-context-collapse";
import { TrustVelocitySystem } from "@/modules/37-trust-velocity";
import { ComplianceAutopilot } from "@/modules/45-compliance";
import { ModuleCompositionIntelligence } from "@/modules/46-composition-intel";
import { PlatformEvolutionEngine } from "@/modules/47-evolution";

let singleton: { ctx: ModuleContext; registry: ModuleRegistry } | null = null;

export async function getPlatform() {
  if (singleton) return singleton;

  const ctx: ModuleContext = {
    now: () => new Date().toISOString(),
    flags: new SimpleFlags(new Set(["brand.auto_apply_copy"])),
    events: new InMemoryEventBus(),
    store: new InMemoryStore(),
    scorer: new NoopScorer(),
    workflow: new InMemoryWorkflow(),
    privacy: new SimplePrivacy(true),
    logger: new ConsoleLogger(),
  };

  const registry = new ModuleRegistry(ctx);
  registry.register(
    new ContextCollapsePreventionEngine(),
    new TrustVelocitySystem(),
    new ComplianceAutopilot(),
    new ModuleCompositionIntelligence(),
    new PlatformEvolutionEngine()
  );
  await registry.start();

  singleton = { ctx, registry };
  return singleton;
}
