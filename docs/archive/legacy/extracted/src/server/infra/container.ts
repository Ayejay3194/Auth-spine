import { InMemoryEventBus } from "@/src/server/core/eventBus";

import { InMemoryBookingRepo } from "@/src/server/modules/booking/booking.repo.memory";
import { BookingService } from "@/src/server/modules/booking/booking.service";

import { InMemoryContextRepo } from "@/src/server/modules/context/context.repo.memory";
import { ContextService } from "@/src/server/modules/context/context.service";

import { InMemoryClientRepo } from "@/src/server/modules/clientIdentity/client.repo.memory";
import { ClientIdentityService } from "@/src/server/modules/clientIdentity/client.service";

import { CalendarService } from "@/src/server/modules/calendar/calendar.service";

import { TrustService } from "@/src/server/modules/trust/trust.service";
import { PaymentsService } from "@/src/server/modules/payments/payments.service";

import { RemindersService } from "@/src/server/modules/reminders/reminders.service";
import { Orchestrator } from "@/src/server/modules/orchestrator/orchestrator";

import { VerticalRegistry } from "@/src/server/modules/verticals/vertical.registry";

import { InMemoryProfessionalRepo } from "@/src/server/modules/professional/professional.repo.memory";
import { ProfessionalService } from "@/src/server/modules/professional/professional.service";

import { InMemoryServiceRepo } from "@/src/server/modules/serviceCatalog/service.repo.memory";
import { ServiceCatalogService } from "@/src/server/modules/serviceCatalog/service.service";

import { SmsBookingService } from "@/src/server/modules/sms/sms.service";

let singleton: ReturnType<typeof build> | null = null;

function build() {
  const bus = new InMemoryEventBus();

  const bookingRepo = new InMemoryBookingRepo();
  const contextRepo = new InMemoryContextRepo();
  const clientRepo = new InMemoryClientRepo();

  const verticals = new VerticalRegistry();

  const proRepo = new InMemoryProfessionalRepo();
  const serviceRepo = new InMemoryServiceRepo();

  const booking = new BookingService(bookingRepo, bus);
  const context = new ContextService(contextRepo);
  const clients = new ClientIdentityService(clientRepo);
  const calendar = new CalendarService(bookingRepo);
  const trust = new TrustService(bookingRepo);
  const payments = new PaymentsService();

  const reminders = new RemindersService();
  const orchestrator = new Orchestrator(bus, reminders);
  orchestrator.wire();

  const professionals = new ProfessionalService(proRepo, verticals);
  const catalog = new ServiceCatalogService(serviceRepo, proRepo, verticals);

  const seedPromise = seedDefaults(proRepo, catalog);

  const sms = new SmsBookingService(context, clients, calendar, trust, payments, booking, verticals, proRepo, serviceRepo);

  return { bus, bookingRepo, booking, context, clients, calendar, trust, payments, reminders, orchestrator, verticals, proRepo, professionals, serviceRepo, catalog, sms, seedPromise };
}

async function seedDefaults(proRepo: InMemoryProfessionalRepo, catalog: ServiceCatalogService) {
  const existing = await proRepo.getById(process.env.DEFAULT_PROFESSIONAL_ID ?? "pro_001");
  if (existing) return;

  const vertical = (process.env.DEFAULT_VERTICAL as any) ?? "beauty";
  const pro = await proRepo.create({
    vertical,
    businessName: "Default Pro (seed)",
    requiredFields: vertical === "beauty" ? { license_number: "seed" } : {}
  });

  process.env.DEFAULT_PROFESSIONAL_ID = pro.id;

  await catalog.seedDefaultsForProfessional(pro.id);
}

export function getContainer() {
  if (!singleton) singleton = build();
  return singleton;
}
