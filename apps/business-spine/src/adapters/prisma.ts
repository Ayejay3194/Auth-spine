import { PrismaClient } from '@prisma/client';
import { AuditEvent, ToolRegistry, ToolResult } from "../core/types.js";
import { uid } from "../core/util.js";

const prisma = new PrismaClient();

type Booking = { id: string; clientId: string; service: string; startISO: string; endISO: string; status: "booked"|"cancelled" };
type Client = { id: string; name: string; email?: string; phone?: string; tags: string[]; notes: string[]; doNotBook?: boolean };
type Invoice = { id: string; clientId: string; amount: number; status: "open"|"paid"|"void"|"refunded"; createdISO: string; memo?: string };
type Promo = { id: string; code: string; percentOff: number; expiresISO?: string; active: boolean };

function ok<T>(data: T): ToolResult<T> { return { ok: true, data }; }
function fail(code: string, message: string, details?: unknown): ToolResult { return { ok: false, error: { code, message, details } }; }

function findClientByNameOrEmail(q: string): Promise<Client | undefined> {
  const s = q.toLowerCase();
  return prisma.client.findFirst({
    where: {
      user: {
        email: { contains: s, mode: 'insensitive' }
      }
    },
    include: { user: true }
  }).then((c: any) => c ? {
    id: c.id,
    name: c.user?.name || '',
    email: c.user?.email || undefined,
    phone: c.phone || undefined,
    tags: [],
    notes: [],
    doNotBook: false
  } : undefined);
}

export async function prismaAuditWriter(evt: AuditEvent) {
  await prisma.auditEvent.create({
    data: {
      actorUserId: evt.actorUserId,
      role: (evt.actorRole as any),
      type: evt.action,
      details: {
        target: evt.target,
        inputSummary: evt.inputSummary || null,
        outcome: evt.outcome,
        reason: evt.reason,
        prevHash: evt.prevHash,
        hash: evt.hash,
        tenantId: evt.tenantId,
        tsISO: evt.tsISO
      } as any
    }
  });
}

export const prismaHashChain = {
  async getPrevHash() {
    // Hash chain tracking not implemented in current schema
    return undefined;
  },
  async addHash(hash: string, prevHash?: string) {
    // Hash chain tracking not implemented in current schema
  }
};

export const tools: ToolRegistry = {
  "booking.create": async ({ input }) => {
    try {
      const { clientQuery, service, startISO, durationMin, providerId, serviceId } = input as any;
      const client = await findClientByNameOrEmail(String(clientQuery ?? ""));
      if (!client) return fail("client_not_found", "Client not found");
      if (client.doNotBook) return fail("blocked_client", "Client is flagged as do-not-book");
      
      const start = new Date(String(startISO));
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + Number(durationMin ?? 60));
      
      const booking = await prisma.booking.create({
        data: {
          clientId: client.id,
          providerId: String(providerId),
          serviceId: String(serviceId || service),
          startAt: start,
          endAt: end,
          status: "pending"
        }
      });
      
      return ok(booking);
    } catch (error) {
      return fail("database_error", "Failed to create booking", error);
    }
  },

  "booking.cancel": async ({ input }) => {
    try {
      const { bookingId } = input as any;
      const booking = await prisma.booking.update({
        where: { id: String(bookingId) },
        data: { status: "cancelled" }
      });
      return ok(booking);
    } catch (error) {
      return fail("not_found", "Booking not found", error);
    }
  },

  "booking.list": async ({ input }) => {
    try {
      const { dateISO } = input as any;
      const bookings = await prisma.booking.findMany({
        where: dateISO ? {
          startAt: {
            gte: new Date(String(dateISO)),
            lt: new Date(new Date(String(dateISO)).getTime() + 86400000)
          }
        } : undefined
      });
      return ok(bookings);
    } catch (error) {
      return fail("database_error", "Failed to list bookings", error);
    }
  },

  "crm.findClient": async ({ input }) => {
    try {
      const { clientQuery } = input as any;
      const c = await findClientByNameOrEmail(String(clientQuery ?? ""));
      if (!c) return fail("client_not_found", "Client not found");
      return ok(c);
    } catch (error) {
      return fail("database_error", "Failed to find client", error);
    }
  },

  "crm.addNote": async ({ input }) => {
    try {
      const { clientQuery, note } = input as any;
      const c = await findClientByNameOrEmail(String(clientQuery ?? ""));
      if (!c) return fail("client_not_found", "Client not found");
      
      const updated = await prisma.client.update({
        where: { id: c.id },
        data: {
          preferences: { note: String(note) }
        },
        include: { user: true }
      });
      
      return ok({
        id: updated.id,
        name: updated.user?.name || '',
        email: updated.user?.email || undefined,
        phone: updated.phone || undefined,
        tags: [],
        notes: []
      });
    } catch (error) {
      return fail("database_error", "Failed to add note", error);
    }
  },

  "crm.tagClient": async ({ input }) => {
    try {
      const { clientQuery, tag } = input as any;
      const c = await findClientByNameOrEmail(String(clientQuery ?? ""));
      if (!c) return fail("client_not_found", "Client not found");
      
      const updated = await prisma.client.update({
        where: { id: c.id },
        data: {
          preferences: { tag: String(tag) }
        },
        include: { user: true }
      });
      
      return ok({
        id: updated.id,
        name: updated.user?.name || '',
        email: updated.user?.email || undefined,
        phone: updated.phone || undefined,
        tags: [],
        notes: []
      });
    } catch (error) {
      return fail("database_error", "Failed to tag client", error);
    }
  },

  "crm.flagDoNotBook": async ({ input }) => {
    try {
      const { clientQuery, flag } = input as any;
      const c = await findClientByNameOrEmail(String(clientQuery ?? ""));
      if (!c) return fail("client_not_found", "Client not found");
      
      const updated = await prisma.client.update({
        where: { id: c.id },
        data: { preferences: { doNotBook: Boolean(flag) } },
        include: { user: true }
      });
      
      return ok({
        id: updated.id,
        name: updated.user?.name || '',
        email: updated.user?.email || undefined,
        phone: updated.phone || undefined,
        tags: [],
        notes: [],
        doNotBook: Boolean(flag)
      });
    } catch (error) {
      return fail("database_error", "Failed to flag client", error);
    }
  },

  "payments.createInvoice": async ({ input }) => {
    try {
      const { clientQuery, amount, memo } = input as any;
      const c = await findClientByNameOrEmail(String(clientQuery ?? ""));
      if (!c) return fail("client_not_found", "Client not found");
      
      return ok({
        id: "inv_" + Math.random().toString(36).substr(2, 9),
        clientId: c.id,
        amount: Number(amount),
        status: "open",
        memo: memo ? String(memo) : undefined
      });
    } catch (error) {
      return fail("database_error", "Failed to create invoice", error);
    }
  },

  "payments.markPaid": async ({ input }) => {
    try {
      const { invoiceId } = input as any;
      return ok({
        id: String(invoiceId),
        status: "paid"
      });
    } catch (error) {
      return fail("not_found", "Invoice not found", error);
    }
  },

  "payments.refund": async ({ input }) => {
    try {
      const { invoiceId, amount } = input as any;
      return ok({ invoiceId: String(invoiceId), refunded: Number(amount) });
    } catch (error) {
      return fail("database_error", "Failed to refund invoice", error);
    }
  },

  "marketing.createPromo": async ({ input }) => {
    try {
      const { code, percentOff, expiresISO } = input as any;
      return ok({
        id: "promo_" + Math.random().toString(36).substr(2, 9),
        code: String(code).toUpperCase(),
        percentOff: Number(percentOff),
        expiresISO: expiresISO ? String(expiresISO) : undefined,
        active: true
      });
    } catch (error) {
      return fail("database_error", "Failed to create promo", error);
    }
  },

  "marketing.endPromo": async ({ input }) => {
    try {
      const { code } = input as any;
      return ok({
        code: String(code).toUpperCase(),
        active: false
      });
    } catch (error) {
      return fail("database_error", "Failed to end promo", error);
    }
  },

  "analytics.weekSummary": async ({ input }) => {
    try {
      const { nowISO } = input as any;
      return ok({
        booked: 0,
        cancels: 0,
        noShowRate: 0,
        paidLast7Days: 0
      });
    } catch (error) {
      return fail("database_error", "Failed to get analytics", error);
    }
  },

  "admin.showAudit": async () => {
    try {
      const logs = await prisma.auditEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 25
      });
      return ok(logs);
    } catch (error) {
      return fail("database_error", "Failed to retrieve audit logs", error);
    }
  }
};

export async function initializePrisma() {
  try {
    await prisma.$connect();
    console.log('Prisma connected successfully');
  } catch (error) {
    console.error('Failed to connect to Prisma:', error);
    throw error;
  }
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
