import { InMemoryEventBus } from "../core/event-bus";
import { ModuleRegistry } from "../core/registry";
import type { ModuleContext } from "../core/types";
import { InMemoryStore } from "../core/store";
import { SimpleFlags } from "../core/flags";
import { SimplePrivacy } from "../core/privacy";
import { ConsoleLogger } from "../core/logger";
import { NoopScorer } from "../core/scoring";
import { InMemoryWorkflow } from "../core/workflow";

import { ContextCollapsePreventionEngine } from "../modules/33-context-collapse";
import { AntiChurnImmuneSystem } from "../modules/34-anti-churn";
import { InvisibleQualityControlLayer } from "../modules/35-quality-control";
import { DemandShapingEngine } from "../modules/36-demand-shaping";
import { TrustVelocitySystem } from "../modules/37-trust-velocity";
import { ReputationArmor } from "../modules/38-reputation-armor";
import { CashFlowOptimizationEngine } from "../modules/39-cashflow";
import { CompetitiveIntelligenceShadowSystem } from "../modules/40-competitive-intel";
import { InvisibleBrandGovernance } from "../modules/41-brand-governance";
import { NetworkEffectAccelerator } from "../modules/42-network-accelerator";
import { ZeroUIBookingFlow } from "../modules/43-zero-ui-booking";
import { ArtistBurnoutDetection } from "../modules/44-burnout";
import { ComplianceAutopilot } from "../modules/45-compliance";
import { ModuleCompositionIntelligence } from "../modules/46-composition-intel";
import { PlatformEvolutionEngine } from "../modules/47-evolution";

let singleton: { ctx: ModuleContext; registry: ModuleRegistry } | null = null;

export async function getPlatform() {
  if (singleton) return singleton;

  const ctx: ModuleContext = {
    now: () => new Date().toISOString(),
    flags: new SimpleFlags(new Set(["demand.slot_gating", "brand.auto_apply_copy"])),
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
    new AntiChurnImmuneSystem(),
    new InvisibleQualityControlLayer(),
    new DemandShapingEngine(),
    new TrustVelocitySystem(),
    new ReputationArmor(),
    new CashFlowOptimizationEngine(),
    new CompetitiveIntelligenceShadowSystem(),
    new InvisibleBrandGovernance(),
    new NetworkEffectAccelerator(),
    new ZeroUIBookingFlow(),
    new ArtistBurnoutDetection(),
    new ComplianceAutopilot(),
    new ModuleCompositionIntelligence(),
    new PlatformEvolutionEngine()
  );

  await registry.start();

  singleton = { ctx, registry };
  return singleton;
}
