import { uid } from "../core/util.js";
import { diagnosticsTool } from "./diagnostics.js";
import { getAstrologyChart, readAstrologyPlacement, getDailyTransit, getCompatibility, interpretHouse, explainAspect } from "./astrology.js";
export const db = {
    bookings: new Map(),
    clients: new Map(),
    invoices: new Map(),
    promos: new Map(),
    audit: [],
    // hash chain state
    auditPrevHash: undefined,
};
// Seed a couple clients
const c1 = { id: uid("client"), name: "Alex Johnson", email: "alex@example.com", phone: "555-222-1212", tags: ["vip"], notes: [] };
const c2 = { id: uid("client"), name: "Sam Rivera", email: "sam@example.com", tags: [], notes: [], phone: "555-333-4444" };
db.clients.set(c1.id, c1);
db.clients.set(c2.id, c2);
export async function memoryAuditWriter(evt) {
    db.audit.push(evt);
}
export const memoryHashChain = {
    async getPrevHash() { return db.auditPrevHash; },
    async setPrevHash(h) { db.auditPrevHash = h; },
};
// Helpers
function ok(data) { return { ok: true, data }; }
function fail(code, message, details) { return { ok: false, error: { code, message, details } }; }
function findClientByNameOrEmail(q) {
    const s = q.toLowerCase();
    for (const c of db.clients.values()) {
        if (c.name.toLowerCase().includes(s))
            return c;
        if (c.email && c.email.toLowerCase() === s)
            return c;
    }
    return undefined;
}
export const tools = {
    // Booking
    "booking.create": async ({ input }) => {
        const { clientQuery, service, startISO, durationMin } = input;
        const client = findClientByNameOrEmail(String(clientQuery ?? ""));
        if (!client)
            return fail("client_not_found", "Client not found");
        if (client.doNotBook)
            return fail("blocked_client", "Client is flagged as do-not-book");
        const start = new Date(String(startISO));
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + Number(durationMin ?? 60));
        const b = { id: uid("booking"), clientId: client.id, service: String(service), startISO: start.toISOString(), endISO: end.toISOString(), status: "booked" };
        db.bookings.set(b.id, b);
        return ok(b);
    },
    "booking.cancel": async ({ input }) => {
        const { bookingId } = input;
        const b = db.bookings.get(String(bookingId));
        if (!b)
            return fail("not_found", "Booking not found");
        b.status = "cancelled";
        db.bookings.set(b.id, b);
        return ok(b);
    },
    "booking.list": async ({ input }) => {
        const { dateISO } = input;
        const items = [...db.bookings.values()].filter(b => !dateISO || b.startISO.startsWith(String(dateISO)));
        return ok(items);
    },
    // CRM
    "crm.findClient": async ({ input }) => {
        const { clientQuery } = input;
        const c = findClientByNameOrEmail(String(clientQuery ?? ""));
        if (!c)
            return fail("client_not_found", "Client not found");
        return ok(c);
    },
    "crm.addNote": async ({ input }) => {
        const { clientQuery, note } = input;
        const c = findClientByNameOrEmail(String(clientQuery ?? ""));
        if (!c)
            return fail("client_not_found", "Client not found");
        c.notes.push(String(note));
        return ok(c);
    },
    "crm.tagClient": async ({ input }) => {
        const { clientQuery, tag } = input;
        const c = findClientByNameOrEmail(String(clientQuery ?? ""));
        if (!c)
            return fail("client_not_found", "Client not found");
        if (!c.tags.includes(String(tag)))
            c.tags.push(String(tag));
        return ok(c);
    },
    "crm.flagDoNotBook": async ({ input }) => {
        const { clientQuery, flag } = input;
        const c = findClientByNameOrEmail(String(clientQuery ?? ""));
        if (!c)
            return fail("client_not_found", "Client not found");
        c.doNotBook = Boolean(flag);
        return ok(c);
    },
    // Payments
    "payments.createInvoice": async ({ input }) => {
        const { clientQuery, amount, memo } = input;
        const c = findClientByNameOrEmail(String(clientQuery ?? ""));
        if (!c)
            return fail("client_not_found", "Client not found");
        const inv = { id: uid("invoice"), clientId: c.id, amount: Number(amount), status: "open", createdISO: new Date().toISOString(), memo: memo ? String(memo) : undefined };
        db.invoices.set(inv.id, inv);
        return ok(inv);
    },
    "payments.markPaid": async ({ input }) => {
        const { invoiceId } = input;
        const inv = db.invoices.get(String(invoiceId));
        if (!inv)
            return fail("not_found", "Invoice not found");
        inv.status = "paid";
        return ok(inv);
    },
    "payments.refund": async ({ input }) => {
        const { invoiceId, amount } = input;
        const inv = db.invoices.get(String(invoiceId));
        if (!inv)
            return fail("not_found", "Invoice not found");
        if (inv.status !== "paid")
            return fail("invalid_state", "Can only refund a paid invoice");
        const amt = Number(amount ?? inv.amount);
        inv.status = "refunded";
        return ok({ invoiceId: inv.id, refunded: amt });
    },
    // Marketing
    "marketing.createPromo": async ({ input }) => {
        const { code, percentOff, expiresISO } = input;
        const p = { id: uid("promo"), code: String(code).toUpperCase(), percentOff: Number(percentOff), expiresISO: expiresISO ? String(expiresISO) : undefined, active: true };
        db.promos.set(p.id, p);
        return ok(p);
    },
    "marketing.endPromo": async ({ input }) => {
        const { code } = input;
        const c = String(code).toUpperCase();
        const p = [...db.promos.values()].find(x => x.code === c);
        if (!p)
            return fail("not_found", "Promo not found");
        p.active = false;
        return ok(p);
    },
    // Analytics
    "analytics.weekSummary": async ({ input }) => {
        const { nowISO } = input;
        const now = new Date(String(nowISO));
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const bookings = [...db.bookings.values()].filter(b => new Date(b.startISO) >= weekAgo && new Date(b.startISO) <= now);
        const cancels = bookings.filter(b => b.status === "cancelled").length;
        const booked = bookings.filter(b => b.status === "booked").length;
        const paid = [...db.invoices.values()].filter(i => i.status === "paid").reduce((a, b) => a + b.amount, 0);
        return ok({ booked, cancels, noShowRate: booked + cancels ? cancels / (booked + cancels) : 0, paidLast7Days: paid });
    },
    // Admin/Security
    "admin.showAudit": async () => ok(db.audit.slice(-25)),
    // Diagnostics
    "runDiagnostics": diagnosticsTool,
    "checkDatabase": async ({ ctx }) => {
        // Simple DB check
        try {
            const clientCount = db.clients.size;
            const bookingCount = db.bookings.size;
            return ok({
                status: "ok",
                details: {
                    clients: clientCount,
                    bookings: bookingCount,
                    invoices: db.invoices.size,
                    promos: db.promos.size,
                }
            });
        }
        catch (error) {
            return fail("DB_CHECK_FAILED", error instanceof Error ? error.message : "Unknown error");
        }
    },
    "checkRedis": async () => {
        // Mock Redis check
        return ok({
            status: "ok",
            details: { connected: true, mode: "standalone" }
        });
    },
    "checkQueue": async () => {
        // Mock Queue check
        return ok({
            status: "ok",
            details: { active: 0, waiting: 0, completed: 0, failed: 0 }
        });
    },
    // Astrology
    "getAstrologyChart": getAstrologyChart,
    "readAstrologyPlacement": readAstrologyPlacement,
    "getDailyTransit": getDailyTransit,
    "getCompatibility": getCompatibility,
    "interpretHouse": interpretHouse,
    "explainAspect": explainAspect,
};
