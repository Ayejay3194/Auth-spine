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
      OR: [
        { name: { contains: s, mode: 'insensitive' } },
        { email: { equals: s, mode: 'insensitive' } }
      ]
    }
  }).then(c => c ? {
    id: c.id,
    name: c.name,
    email: c.email || undefined,
    phone: c.phone || undefined,
    tags: c.tags,
    notes: c.notes,
    doNotBook: c.doNotBook || undefined
  } : undefined);
}

export async function prismaAuditWriter(evt: AuditEvent) {
  await prisma.auditLog.create({
    data: {
      action: evt.action,
      actor: evt.actor,
      timestamp: evt.timestamp,
      details: evt.details,
      prevHash: evt.prevHash
    }
  });
}

export const prismaHashChain = {
  async getPrevHash() {
    const latest = await prisma.hashChain.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    return latest?.hash;
  },
  async setPrevHash(h: string) {
    await prisma.hashChain.create({
      data: { hash: h }
    });
  }
};

export const tools: ToolRegistry = {
  "booking.create": async ({ input }) => {
    try {
      const { clientQuery, service, startISO, durationMin } = input as any;
      const client = await findClientByNameOrEmail(String(clientQuery ?? ""));
      if (!client) return fail("client_not_found", "Client not found");
      if (client.doNotBook) return fail("blocked_client", "Client is flagged as do-not-book");
      
      const start = new Date(String(startISO));
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + Number(durationMin ?? 60));
      
      const booking = await prisma.booking.create({
        data: {
          clientId: client.id,
          service: String(service),
          startISO: start.toISOString(),
          endISO: end.toISOString(),
          status: "booked"
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
          startISO: { startsWith: String(dateISO) }
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
          notes: { push: String(note) }
        }
      });
      
      return ok({
        id: updated.id,
        name: updated.name,
        email: updated.email || undefined,
        phone: updated.phone || undefined,
        tags: updated.tags,
        notes: updated.notes
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
          tags: c.tags.includes(String(tag)) ? c.tags : [...c.tags, String(tag)]
        }
      });
      
      return ok({
        id: updated.id,
        name: updated.name,
        email: updated.email || undefined,
        phone: updated.phone || undefined,
        tags: updated.tags,
        notes: updated.notes
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
        data: { doNotBook: Boolean(flag) }
      });
      
      return ok({
        id: updated.id,
        name: updated.name,
        email: updated.email || undefined,
        phone: updated.phone || undefined,
        tags: updated.tags,
        notes: updated.notes,
        doNotBook: updated.doNotBook || undefined
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
      
      const invoice = await prisma.invoice.create({
        data: {
          clientId: c.id,
          amount: Number(amount),
          status: "open",
          memo: memo ? String(memo) : undefined
        }
      });
      
      return ok(invoice);
    } catch (error) {
      return fail("database_error", "Failed to create invoice", error);
    }
  },

  "payments.markPaid": async ({ input }) => {
    try {
      const { invoiceId } = input as any;
      const invoice = await prisma.invoice.update({
        where: { id: String(invoiceId) },
        data: { status: "paid" }
      });
      return ok(invoice);
    } catch (error) {
      return fail("not_found", "Invoice not found", error);
    }
  },

  "payments.refund": async ({ input }) => {
    try {
      const { invoiceId, amount } = input as any;
      const invoice = await prisma.invoice.findUnique({
        where: { id: String(invoiceId) }
      });
      
      if (!invoice) return fail("not_found", "Invoice not found");
      if (invoice.status !== "paid") return fail("invalid_state", "Can only refund a paid invoice");
      
      const amt = Number(amount ?? invoice.amount);
      const updated = await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "refunded" }
      });
      
      return ok({ invoiceId: updated.id, refunded: amt });
    } catch (error) {
      return fail("database_error", "Failed to refund invoice", error);
    }
  },

  "marketing.createPromo": async ({ input }) => {
    try {
      const { code, percentOff, expiresISO } = input as any;
      const promo = await prisma.promo.create({
        data: {
          code: String(code).toUpperCase(),
          percentOff: Number(percentOff),
          expiresISO: expiresISO ? String(expiresISO) : undefined,
          active: true
        }
      });
      return ok(promo);
    } catch (error) {
      return fail("database_error", "Failed to create promo", error);
    }
  },

  "marketing.endPromo": async ({ input }) => {
    try {
      const { code } = input as any;
      const promo = await prisma.promo.findFirst({
        where: { code: String(code).toUpperCase() }
      });
      
      if (!promo) return fail("not_found", "Promo not found");
      
      const updated = await prisma.promo.update({
        where: { id: promo.id },
        data: { active: false }
      });
      
      return ok(updated);
    } catch (error) {
      return fail("database_error", "Failed to end promo", error);
    }
  },

  "analytics.weekSummary": async ({ input }) => {
    try {
      const { nowISO } = input as any;
      const now = new Date(String(nowISO));
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const bookings = await prisma.booking.findMany({
        where: {
          startISO: {
            gte: weekAgo.toISOString(),
            lte: now.toISOString()
          }
        }
      });
      
      const cancels = bookings.filter(b => b.status === "cancelled").length;
      const booked = bookings.filter(b => b.status === "booked").length;
      
      const invoices = await prisma.invoice.findMany({
        where: {
          status: "paid",
          createdAt: {
            gte: weekAgo,
            lte: now
          }
        }
      });
      
      const paid = invoices.reduce((a, b) => a + b.amount, 0);
      
      return ok({
        booked,
        cancels,
        noShowRate: booked + cancels ? cancels / (booked + cancels) : 0,
        paidLast7Days: paid
      });
    } catch (error) {
      return fail("database_error", "Failed to get analytics", error);
    }
  },

  "admin.showAudit": async () => {
    try {
      const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
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
