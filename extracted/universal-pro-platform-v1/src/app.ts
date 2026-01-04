import { SystemClock } from "./core/clock.js";
import { AppError } from "./core/errors.js";

import { ClientProfileStore } from "./platform/clientProfiles.js";
import { ProfessionalStore } from "./platform/professionals.js";
import { ServiceCatalog } from "./platform/services.js";
import { BookingEngine } from "./platform/bookingEngine.js";
import { PricingEngine } from "./platform/pricing.js";
import { MessagingService } from "./platform/messaging.js";
import { MockPayments } from "./platform/payments.js";

import type { VerticalConfig } from "./platform/verticalConfig.js";
import { validateConfig } from "./platform/verticalConfig.js";
import { ContextRouter } from "./conversation/contextRouter.js";

import { GhostBooking } from "./moats/ghostBooking.js";
import { RelationshipMemory } from "./moats/relationshipMemory.js";
import { PredictiveRebooking } from "./moats/predictiveRebooking.js";
import { SocialProof } from "./moats/socialProof.js";
import { InvisibleWaitlist } from "./moats/invisibleWaitlist.js";
import { SkillGraph } from "./moats/skillGraph.js";
import { AutoUpsell } from "./moats/autoUpsell.js";
import { RevenueMode } from "./moats/revenueMode.js";

export class UniversalPlatformApp {
  clock = new SystemClock();

  clients = new ClientProfileStore();
  pros = new ProfessionalStore();
  services = new ServiceCatalog();

  booking = new BookingEngine();
  pricing = new PricingEngine();
  messaging = new MessagingService();
  payments = new MockPayments();

  ghostBooking = new GhostBooking();
  memory = new RelationshipMemory();
  rebooking = new PredictiveRebooking();
  social = new SocialProof();
  waitlist = new InvisibleWaitlist();
  skill = new SkillGraph();
  upsell = new AutoUpsell();
  revenue = new RevenueMode();

  private configs: VerticalConfig[] = [];
  conversation!: ContextRouter;

  loadVerticalConfigs(configs: VerticalConfig[]) {
    configs.forEach(validateConfig);
    this.configs = configs;
    this.conversation = new ContextRouter(configs);
  }

  bootstrapServicesForProfessional(proId: string) {
    const pro = this.pros.get(proId);
    if (!pro) throw new AppError("Professional not found", "NOT_FOUND", 404);

    const cfg = this.configs.find(c => c.vertical === pro.vertical);
    if (!cfg) throw new AppError("Vertical config not loaded", "NO_VERTICAL_CONFIG", 500);

    for (const tpl of cfg.serviceTemplates) {
      this.services.create({
        professionalId: pro.id,
        name: tpl.name,
        durationMin: tpl.defaultDurationMin,
        price: { currency: "USD", amountCents: tpl.defaultPriceCents },
        locationType: tpl.locationType,
        recurrence: "one_time",
        metadata: tpl.metadata ?? {},
      });
    }
  }
}
