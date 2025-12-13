    import { Spine, Intent, AssistantContext, Extraction, FlowStep } from "../../core/types.js";
    import { detectByPatterns } from "../../core/intent.js";
    import { extractEmail, extractId, extractMoney, extractDateTime, requireFields } from "../../core/entities.js";
    import { patterns } from "./intents.js";

    const REQUIRED: Record<string, string[]> = {
  "show_audit": []
};
    const MAP: Record<string, { tool: string; action: string; sensitivity: "low"|"medium"|"high" }> = {
  "show_audit": {
    "tool": "admin.showAudit",
    "action": "admin.showAudit",
    "sensitivity": "high"
  }
};

    function baseEntities(text: string, ctx: AssistantContext): Record<string, unknown> {
      const email = extractEmail(text);
      const money = extractMoney(text);
      const bookingId = extractId(text, "booking");
      const invoiceId = extractId(text, "invoice");
      const dt = extractDateTime(text, ctx.nowISO);

      const out: Record<string, unknown> = {
        email: email ?? undefined,
        amount: money ?? undefined,
        bookingId: bookingId ?? undefined,
        invoiceId: invoiceId ?? undefined,
        dateISO: dt.dateISO,
        time: dt.time,
        dateTimeISO: dt.dateTimeISO,
      };

      // clientQuery: email wins; else "for NAME"
      const m = text.match(/\bfor\s+([a-z][a-z\s'-]{1,40})\b/i);
      if (m) out.clientQuery = m[1].trim();
      if (email) out.clientQuery = email;

      return out;
    }

    export const spine: Spine = {
      name: "admin_security",
      description: "Admin/Security: audit trail",
      detectIntent: (text, _ctx) => detectByPatterns(text, patterns),
      extractEntities: (intent: Intent, text: string, ctx: AssistantContext): Extraction => {
        const entities = baseEntities(text, ctx);

        // per-intent extraction
        if (intent.name === "book") {
          const svc = text.match(/\b(?:service|for)\s+([a-z][a-z\s'-]{2,40})\b/i);
          if (svc) (entities as any).service = svc[1].trim();

          const dm = text.match(/\b(\d{1,3})\s*(?:min|mins|minutes)\b/i);
          if (dm) (entities as any).durationMin = Number(dm[1]);
          const dh = text.match(/\b(\d+(?:\.\d+)?)\s*h\b/i);
          if (dh) (entities as any).durationMin = Math.round(Number(dh[1]) * 60);
          if (!(entities as any).durationMin) (entities as any).durationMin = 60;

          if ((entities as any).dateTimeISO) (entities as any).startISO = (entities as any).dateTimeISO;
        }

        if (intent.name === "create_invoice") {
          const mm = text.match(/\bmemo\s+(.+)$/i);
          if (mm) (entities as any).memo = mm[1].trim();
        }

        if (intent.name === "refund") {
          // refund amount optional; if missing, refund full
          (entities as any).amount = (entities as any).amount ?? undefined;
        }

        if (intent.name === "create_promo") {
          const cm = text.match(/\bcode\s+([a-z0-9]{3,20})\b/i);
          if (cm) (entities as any).code = cm[1].toUpperCase();
          const pm = text.match(/\b(\d{1,2})%\b/);
          if (pm) (entities as any).percentOff = Number(pm[1]);

          const ex = text.match(/\bexpires?\s+(.+)$/i);
          if (ex) {
            const dt2 = extractDateTime(ex[1], ctx.nowISO);
            if (dt2.dateTimeISO) (entities as any).expiresISO = dt2.dateTimeISO;
            else if (dt2.dateISO) (entities as any).expiresISO = new Date(dt2.dateISO + "T23:59:59Z").toISOString();
          }
        }

        if (intent.name === "add_note") {
          const nm = text.match(/\bnote\s+(.+)$/i);
          if (nm) (entities as any).note = nm[1].trim();
        }

        if (intent.name === "tag_client") {
          const tm = text.match(/\btag\s+([a-z0-9_-]{2,30})\b/i);
          if (tm) (entities as any).tag = tm[1].trim().toLowerCase();
        }

        if (intent.name === "flag_donotbook") {
          (entities as any).flag = true;
        }

        if (intent.name === "week_report") {
          (entities as any).nowISO = ctx.nowISO;
        }

        const req = REQUIRED[intent.name] ?? [];
        const missing = requireFields(entities, req);
        return { entities, missing };
      },
      buildFlow: (intent, extraction, _ctx): FlowStep[] => {
        if (extraction.missing.length) {
          return [{ kind: "ask", prompt: `Missing: ${extraction.missing.join(", ")}`, missing: extraction.missing }];
        }
        const m = MAP[intent.name];
        if (!m) return [{ kind: "respond", message: `No mapping for intent: ${intent.name}` }];

        return [{
          kind: "execute",
          action: m.action,
          sensitivity: m.sensitivity,
          tool: m.tool,
          input: extraction.entities,
        }];
      },
    };
