import { parseSmsIntent } from "./sms.parser";
import { ContextService } from "@/src/server/modules/context/context.service";
import { ClientIdentityService } from "@/src/server/modules/clientIdentity/client.service";
import { CalendarService } from "@/src/server/modules/calendar/calendar.service";
import { TrustService } from "@/src/server/modules/trust/trust.service";
import { PaymentsService } from "@/src/server/modules/payments/payments.service";
import { BookingService } from "@/src/server/modules/booking/booking.service";
import { VerticalRegistry } from "@/src/server/modules/verticals/vertical.registry";
import type { Vertical } from "@/src/server/core/types";
import type { ServiceRepo } from "@/src/server/modules/serviceCatalog/service.repo";
import type { ProfessionalRepo } from "@/src/server/modules/professional/professional.repo";

export class SmsBookingService {
  constructor(
    private ctx: ContextService,
    private clients: ClientIdentityService,
    private calendar: CalendarService,
    private trust: TrustService,
    private payments: PaymentsService,
    private booking: BookingService,
    private verticals: VerticalRegistry,
    private pros: ProfessionalRepo,
    private services: ServiceRepo
  ) {}

  async handleInbound(input: { fromE164: string; toE164: string; body: string }) {
    const intent = parseSmsIntent(input.body);
    if (intent.kind === "RESET") {
      await this.ctx.reset(input.fromE164);
      return "Reset. Tell me what you need and when.";
    }

    const session = await this.ctx.getOrCreate(input.fromE164);

    if (intent.kind === "UNKNOWN") {
      return "Text what you need. Example: “Haircut Thursday” or “Tax consult next week”. (Text RESET to start over.)";
    }

    const client = await this.clients.resolveClient(input.fromE164);
    if (!client.ok) return "Something broke. Try again.";

    const professionalId = session.professionalId ?? (process.env.DEFAULT_PROFESSIONAL_ID ?? "pro_001");

    if (!session.detectedVertical) {
      const det = this.verticals.detectFromText(input.body);
      await this.ctx.patch(input.fromE164, {
        detectedVertical: det.vertical,
        verticalConfidence: det.confidence,
        professionalId,
        stage: det.confidence < 0.6 ? "AWAITING_VERTICAL_CONFIRM" : "AWAITING_INTAKE"
      });
      if (det.confidence < 0.6) {
        return `This sounds like ${det.vertical}. Reply YES to confirm, or type: beauty, fitness, consulting, education, home services, health.`;
      }
    }

    const s1 = await this.ctx.getOrCreate(input.fromE164);
    if (s1.stage === "AWAITING_VERTICAL_CONFIRM") {
      const t = input.body.trim().toLowerCase();
      const isYes = t === "yes" || t === "y";
      const mapped: Record<string, Vertical> = {
        beauty: "beauty",
        fitness: "fitness",
        consulting: "consulting",
        education: "education",
        "home services": "home_services",
        home: "home_services",
        health: "health"
      };

      if (isYes) {
        await this.ctx.patch(input.fromE164, { stage: "AWAITING_INTAKE", verticalConfidence: 0.9 });
      } else if (mapped[t]) {
        await this.ctx.patch(input.fromE164, { detectedVertical: mapped[t], stage: "AWAITING_INTAKE", verticalConfidence: 0.9 });
      } else {
        return "Reply YES or type one of: beauty, fitness, consulting, education, home services, health.";
      }
    }

    const s2 = await this.ctx.getOrCreate(input.fromE164);
    const detectedVertical = s2.detectedVertical as Vertical | undefined;
    if (!detectedVertical) return "Tell me what you need and when.";

    const cfg = this.verticals.get(detectedVertical);
    if (!cfg.ok) return "Unsupported category right now.";

    const pro = await this.pros.getById(professionalId);
    if (!pro) return "No professional is configured yet.";

    const vertical = pro.vertical;

    if (!s2.intake) {
      await this.ctx.patch(input.fromE164, { stage: "AWAITING_INTAKE", intake: {} });
    }

    const s3 = await this.ctx.getOrCreate(input.fromE164);
    if (s3.stage === "AWAITING_INTAKE") {
      const q = cfg.value.conversation_context.intake_questions[0];
      if (q && !s3.intake?.[q.key]) {
        const maybeAnswer = input.body.trim();
        if (maybeAnswer.length > 0 && !/\b(book|schedule|need|i want)\b/i.test(maybeAnswer) && maybeAnswer.length < 80) {
          await this.ctx.patch(input.fromE164, { intake: { ...(s3.intake ?? {}), [q.key]: maybeAnswer }, stage: "AWAITING_SLOT_CHOICE" });
        } else {
          return q.prompt;
        }
      } else {
        await this.ctx.patch(input.fromE164, { stage: "AWAITING_SLOT_CHOICE" });
      }
    }

    const s4 = await this.ctx.getOrCreate(input.fromE164);
    if (s4.stage === "AWAITING_SLOT_CHOICE" && s4.proposedSlots?.length) {
      const msg = input.body.toLowerCase();
      const chosen =
        s4.proposedSlots.find(s => msg.includes("2pm") && s.label.toLowerCase().includes("2")) ??
        s4.proposedSlots.find(s => msg.includes("4pm") && s.label.toLowerCase().includes("4")) ??
        s4.proposedSlots.find(s => msg.includes("first") && s === s4.proposedSlots?.[0]) ??
        s4.proposedSlots.find(s => msg.includes("second") && s === s4.proposedSlots?.[1]);

      if (!chosen) return `I have ${s4.proposedSlots.map(s => s.label).join(" or ")}. Which works?`;

      const trust = await this.trust.getTrustLevel(client.value.clientId);

      if (trust === "DEPOSIT_REQUIRED" && !s4.cardOnFile) {
        const link = await this.payments.createDepositLink({ professionalId, clientId: client.value.clientId, amountCents: 2000 });
        await this.ctx.patch(input.fromE164, { stage: "AWAITING_DEPOSIT", pendingSlot: chosen });
        return `I can do ${chosen.label}. I’ll need a $20 deposit: ${link}`;
      }

      const serviceId = s4.serviceId ?? (await pickDefaultServiceId(this.services, professionalId));
      const created = await this.booking.createBooking({
        professionalId,
        clientId: client.value.clientId,
        serviceId,
        vertical,
        startAt: chosen.startAt,
        endAt: chosen.endAt,
        requestedVia: "SMS"
      });

      if (!created.ok) return "That slot got taken. Want the next opening?";

      await this.ctx.reset(input.fromE164);
      return `You’re booked for ${chosen.label}. See you then.`;
    }

    const serviceId = (await this.ctx.getOrCreate(input.fromE164)).serviceId ?? (await pickDefaultServiceId(this.services, professionalId));
    const svc = await this.services.getById(serviceId);
    const duration = svc?.durationMin ?? 60;

    const slots = await this.calendar.getNextAvailableSlots(professionalId, 2, duration);
    if (!slots.length) return "No openings right now. Try another day?";
    await this.ctx.patch(input.fromE164, { stage: "AWAITING_SLOT_CHOICE", proposedSlots: slots, professionalId, serviceId });

    return `I have ${slots.map(s => s.label).join(" or ")}. Which works?`;
  }
}

async function pickDefaultServiceId(services: ServiceRepo, professionalId: string) {
  const list = await services.listByProfessional(professionalId);
  return list[0]?.id ?? "svc_default";
}
