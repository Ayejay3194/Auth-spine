
"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { requireBalanced } from "@/lib/books/engine";
import { assertPeriodOpen } from "@/lib/books/periods";

const AccountSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["ASSET","LIABILITY","EQUITY","INCOME","EXPENSE"])
});

export async function createAccount(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const data = AccountSchema.parse({
    code: String(formData.get("code")||""),
    name: String(formData.get("name")||""),
    type: formData.get("type")
  });
  const created = await db.account.create({ data });
  await audit(viewer, "CREATE", "Account", created.id, null, created);
  redirect("/books/accounts");
}

const JournalSchema = z.object({
  memo: z.string().optional(),
  linesJson: z.string().min(2)
});


export async function createJournalEntry(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const parsed = JournalSchema.parse({
    memo: String(formData.get("memo")||""),
    linesJson: String(formData.get("linesJson")||"")
  });
  const lines = JSON.parse(parsed.linesJson) as Array<{ accountId: string; debitCents: number; creditCents: number; description?: string }>;
  requireBalanced(lines);

  const postedAt = new Date();
  await assertPeriodOpen(postedAt);

  const entry = await db.journalEntry.create({
    data: {
      postedAt,
      memo: parsed.memo || undefined,
      lines: { create: lines.map(l => ({ accountId: l.accountId, debitCents: l.debitCents||0, creditCents: l.creditCents||0, description: l.description })) }
    },
    include: { lines: true }
  });
  await audit(viewer, "CREATE", "JournalEntry", entry.id, null, entry);
  redirect("/books/journal");
}

const CustomerSchema = z.object({ name: z.string().min(1), email: z.string().email().optional().or(z.literal("")) });
export async function createCustomer(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const data = CustomerSchema.parse({ name: String(formData.get("name")||""), email: String(formData.get("email")||"") });
  const created = await db.customer.create({ data: { name: data.name, email: data.email || undefined } });
  await audit(viewer, "CREATE", "Customer", created.id, null, created);
  redirect("/books/invoices");
}

const VendorSchema = z.object({ name: z.string().min(1), email: z.string().email().optional().or(z.literal("")) });
export async function createVendor(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const data = VendorSchema.parse({ name: String(formData.get("name")||""), email: String(formData.get("email")||"") });
  const created = await db.vendor.create({ data: { name: data.name, email: data.email || undefined } });
  await audit(viewer, "CREATE", "Vendor", created.id, null, created);
  redirect("/books/bills");
}

const InvoiceCreateSchema = z.object({
  customerId: z.string().min(1),
  dueDate: z.string().optional(),
  memo: z.string().optional(),
  linesJson: z.string().min(2)
});

export async function createInvoice(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const parsed = InvoiceCreateSchema.parse({
    customerId: String(formData.get("customerId")||""),
    dueDate: String(formData.get("dueDate")||""),
    memo: String(formData.get("memo")||""),
    linesJson: String(formData.get("linesJson")||"")
  });
  const lines = JSON.parse(parsed.linesJson) as Array<{ description: string; qty: number; unitCents: number }>;
  const lineRows = lines.map(l => ({ description: l.description, qty: l.qty||1, unitCents: l.unitCents||0, amountCents: (l.qty||1)*(l.unitCents||0) }));
  const subtotal = lineRows.reduce((s, l) => s + l.amountCents, 0);
  const tax = 0;
  const total = subtotal + tax;

  const inv = await db.invoice.create({
    data: {
      customerId: parsed.customerId,
      status: "ISSUED",
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : undefined,
      memo: parsed.memo || undefined,
      subtotalCents: subtotal,
      taxCents: tax,
      totalCents: total,
      lines: { create: lineRows }
    },
    include: { lines: true }
  });

  await audit(viewer, "CREATE", "Invoice", inv.id, null, inv);
  await track({ viewer, event: "create_invoice", entity: "Invoice", entityId: inv.id, props: { totalCents: inv.totalCents } });
  redirect("/books/invoices");
}

export async function recordInvoicePayment(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const invoiceId = String(formData.get("invoiceId"));
  const amountCents = Number(formData.get("amountCents")||0);
  const method = String(formData.get("method")||"");

  const inv = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!inv) throw new Error("NOT_FOUND");

  const pay = await db.payment.create({ data: { kind: "AR", invoiceId, amountCents, method: method||undefined } });

  // Post journal: Dr Cash, Cr Income (V1), and set invoice PAID if fully paid
  const cash = await db.account.findFirst({ where: { code: "1000" } }); // Cash
  const ar = await db.account.findFirst({ where: { code: "1100" } }); // AR
  const income = await db.account.findFirst({ where: { code: "4000" } }); // Income
  if (!cash || !ar || !income) throw new Error("MISSING_DEFAULT_ACCOUNTS");

  // Simplified: treat payment as settling AR (Dr Cash Cr AR)
  const postedAt = new Date();
  await assertPeriodOpen(postedAt);
  const entry = await db.journalEntry.create({
    data: {
      postedAt,
      memo: `Payment for invoice ${invoiceId}`,
      source: `PAYMENT:${pay.id}`,
      lines: { create: [
        { accountId: cash.id, debitCents: amountCents, creditCents: 0, description: "Cash received" },
        { accountId: ar.id, debitCents: 0, creditCents: amountCents, description: "Reduce A/R" }
      ] }
    }
  });

  await db.payment.update({ where: { id: pay.id }, data: { sourceEntryId: entry.id } });

  const totalPaid = await db.payment.aggregate({ where: { invoiceId }, _sum: { amountCents: true } });
  const paid = (totalPaid._sum.amountCents || 0) >= inv.totalCents;
  if (paid) await db.invoice.update({ where: { id: invoiceId }, data: { status: "PAID" } });

  await audit(viewer, "RECORD_PAYMENT", "Invoice", invoiceId, null, { pay, entryId: entry.id });
  await track({ viewer, event: "record_invoice_payment", entity: "Invoice", entityId: invoiceId, props: { amountCents } });
  redirect("/books/invoices");
}

const BillCreateSchema = z.object({
  vendorId: z.string().min(1),
  memo: z.string().optional(),
  linesJson: z.string().min(2)
});

export async function createBill(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const parsed = BillCreateSchema.parse({
    vendorId: String(formData.get("vendorId")||""),
    memo: String(formData.get("memo")||""),
    linesJson: String(formData.get("linesJson")||"")
  });
  const lines = JSON.parse(parsed.linesJson) as Array<{ description: string; amountCents: number }>;
  const total = lines.reduce((s, l) => s + (l.amountCents||0), 0);

  const bill = await db.bill.create({
    data: { vendorId: parsed.vendorId, status: "ISSUED", memo: parsed.memo||undefined, totalCents: total, lines: { create: lines.map(l => ({ description: l.description, amountCents: l.amountCents||0 })) } },
    include: { lines: true }
  });

  await audit(viewer, "CREATE", "Bill", bill.id, null, bill);
  await track({ viewer, event: "create_bill", entity: "Bill", entityId: bill.id, props: { totalCents: bill.totalCents } });
  redirect("/books/bills");
}

export async function payBill(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const billId = String(formData.get("billId"));
  const amountCents = Number(formData.get("amountCents")||0);
  const method = String(formData.get("method")||"");

  const bill = await db.bill.findUnique({ where: { id: billId } });
  if (!bill) throw new Error("NOT_FOUND");

  const pay = await db.payment.create({ data: { kind: "AP", billId, amountCents, method: method||undefined } });

  const cash = await db.account.findFirst({ where: { code: "1000" } }); // Cash
  const ap = await db.account.findFirst({ where: { code: "2000" } }); // AP
  if (!cash || !ap) throw new Error("MISSING_DEFAULT_ACCOUNTS");

  const postedAt = new Date();
  await assertPeriodOpen(postedAt);
  const entry = await db.journalEntry.create({
    data: {
      postedAt,
      memo: `Bill payment ${billId}`,
      source: `PAYMENT:${pay.id}`,
      lines: { create: [
        { accountId: ap.id, debitCents: amountCents, creditCents: 0, description: "Reduce A/P" },
        { accountId: cash.id, debitCents: 0, creditCents: amountCents, description: "Cash paid" }
      ] }
    }
  });
  await db.payment.update({ where: { id: pay.id }, data: { sourceEntryId: entry.id } });

  const totalPaid = await db.payment.aggregate({ where: { billId }, _sum: { amountCents: true } });
  const paid = (totalPaid._sum.amountCents || 0) >= bill.totalCents;
  if (paid) await db.bill.update({ where: { id: billId }, data: { status: "PAID" } });

  await audit(viewer, "PAY_BILL", "Bill", billId, null, { pay, entryId: entry.id });
  await track({ viewer, event: "pay_bill", entity: "Bill", entityId: billId, props: { amountCents } });
  redirect("/books/bills");
}

const BankSchema = z.object({ name: z.string().min(1), currency: z.string().min(3).max(3) });
export async function createBankAccount(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const data = BankSchema.parse({ name: String(formData.get("name")||""), currency: String(formData.get("currency")||"USD") });
  const created = await db.bankAccount.create({ data });
  await audit(viewer, "CREATE", "BankAccount", created.id, null, created);
  redirect("/books/banking");
}

const BankTxnSchema = z.object({
  bankAccountId: z.string().min(1),
  type: z.enum(["DEPOSIT","WITHDRAWAL","TRANSFER"]),
  description: z.string().min(1),
  amountCents: z.coerce.number().int()
});
export async function addBankTxn(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const data = BankTxnSchema.parse({
    bankAccountId: String(formData.get("bankAccountId")||""),
    type: formData.get("type"),
    description: String(formData.get("description")||""),
    amountCents: formData.get("amountCents")
  });
  const created = await db.bankTxn.create({ data });
  await audit(viewer, "CREATE", "BankTxn", created.id, null, created);
  redirect("/books/banking");
}



const PeriodSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().min(10),
  endDate: z.string().min(10)
});

export async function createPeriod(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const data = PeriodSchema.parse({
    name: String(formData.get("name")||""),
    startDate: String(formData.get("startDate")||""),
    endDate: String(formData.get("endDate")||"")
  });
  const created = await db.period.create({ data: { name: data.name, startDate: new Date(data.startDate), endDate: new Date(data.endDate) } });
  await audit(viewer, "CREATE", "Period", created.id, null, created);
  redirect("/books/settings");
}

export async function closePeriod(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const id = String(formData.get("id"));
  const before = await db.period.findUnique({ where: { id } });
  const after = await db.period.update({ where: { id }, data: { isClosed: true, closedAt: new Date() } });
  await audit(viewer, "CLOSE", "Period", id, before, after);
  redirect("/books/settings");
}

const TaxSchema = z.object({ name: z.string().min(1), rateBps: z.coerce.number().int().nonnegative() });

export async function upsertSalesTaxRate(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const data = TaxSchema.parse({ name: String(formData.get("name")||""), rateBps: formData.get("rateBps") });
  const saved = await db.salesTaxRate.upsert({ where: { name: data.name }, update: { rateBps: data.rateBps }, create: data });
  await audit(viewer, "UPSERT", "SalesTaxRate", saved.id, null, saved);
  redirect("/books/settings");
}

const InvoiceTaxSchema = z.object({ invoiceId: z.string().min(1), taxRateName: z.string().min(1) });

export async function applyTaxToInvoice(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const data = InvoiceTaxSchema.parse({ invoiceId: String(formData.get("invoiceId")||""), taxRateName: String(formData.get("taxRateName")||"") });
  const inv = await db.invoice.findUnique({ where: { id: data.invoiceId }, include: { lines: true } });
  if (!inv) throw new Error("NOT_FOUND");
  const rate = await db.salesTaxRate.findUnique({ where: { name: data.taxRateName } });
  if (!rate) throw new Error("TAX_RATE_NOT_FOUND");
  const subtotal = inv.lines.reduce((s,l)=>s+l.amountCents,0);
  const tax = Math.round(subtotal * (rate.rateBps/10000));
  const total = subtotal + tax;
  const before = inv;
  const after = await db.invoice.update({ where: { id: inv.id }, data: { subtotalCents: subtotal, taxCents: tax, totalCents: total } });
  await audit(viewer, "APPLY_TAX", "Invoice", inv.id, before, after);
  redirect("/books/invoices");
}

const RecurringSchema = z.object({
  name: z.string().min(1),
  cadence: z.enum(["MONTHLY","WEEKLY"]),
  nextRunAt: z.string().min(10),
  memo: z.string().optional(),
  linesJson: z.string().min(2)
});

export async function createRecurringTemplate(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const data = RecurringSchema.parse({
    name: String(formData.get("name")||""),
    cadence: formData.get("cadence"),
    nextRunAt: String(formData.get("nextRunAt")||""),
    memo: String(formData.get("memo")||""),
    linesJson: String(formData.get("linesJson")||"")
  });
  const lines = JSON.parse(data.linesJson);
  requireBalanced(lines);
  const created = await db.recurringTemplate.create({
    data: { name: data.name, cadence: data.cadence, nextRunAt: new Date(data.nextRunAt), memo: data.memo||undefined, linesJson: lines }
  });
  await audit(viewer, "CREATE", "RecurringTemplate", created.id, null, created);
  redirect("/books/recurring");
}

export async function runRecurringNow(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const id = String(formData.get("id"));
  const tpl = await db.recurringTemplate.findUnique({ where: { id } });
  if (!tpl || !tpl.isActive) throw new Error("NOT_FOUND");
  const lines = tpl.linesJson as any[];
  requireBalanced(lines);
  const postedAt = new Date();
  await assertPeriodOpen(postedAt);

  const entry = await db.journalEntry.create({
    data: {
      postedAt,
      memo: tpl.memo || `Recurring: ${tpl.name}`,
      source: `RECURRING:${tpl.id}`,
      lines: { create: lines.map(l => ({ accountId: l.accountId, debitCents: l.debitCents||0, creditCents: l.creditCents||0, description: l.description })) }
    }
  });

  // bump nextRunAt
  const next = new Date(tpl.nextRunAt);
  if (tpl.cadence === "WEEKLY") next.setDate(next.getDate() + 7);
  else next.setMonth(next.getMonth() + 1);
  await db.recurringTemplate.update({ where: { id }, data: { nextRunAt: next } });

  await audit(viewer, "RUN", "RecurringTemplate", id, null, { entryId: entry.id, nextRunAt: next.toISOString() });
  redirect("/books/recurring");
}

const ReconcileCreateSchema = z.object({
  bankAccountId: z.string().min(1),
  statementStart: z.string().min(10),
  statementEnd: z.string().min(10)
});

export async function createReconciliationSession(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const data = ReconcileCreateSchema.parse({
    bankAccountId: String(formData.get("bankAccountId")||""),
    statementStart: String(formData.get("statementStart")||""),
    statementEnd: String(formData.get("statementEnd")||"")
  });
  const created = await db.reconciliationSession.create({ data: { bankAccountId: data.bankAccountId, statementStart: new Date(data.statementStart), statementEnd: new Date(data.statementEnd) } });
  await audit(viewer, "CREATE", "ReconciliationSession", created.id, null, created);
  redirect(`/books/reconcile/${created.id}`);
}

const MatchSchema = z.object({
  sessionId: z.string().min(1),
  bankTxnId: z.string().min(1),
  accountId: z.string().min(1)
});

export async function matchBankTxn(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const data = MatchSchema.parse({
    sessionId: String(formData.get("sessionId")||""),
    bankTxnId: String(formData.get("bankTxnId")||""),
    accountId: String(formData.get("accountId")||"")
  });

  const txn = await db.bankTxn.findUnique({ where: { id: data.bankTxnId } });
  if (!txn) throw new Error("NOT_FOUND");

  const cash = await db.account.findFirst({ where: { code: "1000" } });
  if (!cash) throw new Error("MISSING_CASH");

  const postedAt = new Date(txn.postedAt);
  await assertPeriodOpen(postedAt);

  // Create journal entry to mirror the bank txn:
  // If amount > 0: Dr Cash, Cr selected account (income/liability/etc)
  // If amount < 0: Dr selected account (expense/asset), Cr Cash
  const amt = txn.amountCents;
  const lines = amt >= 0
    ? [{ accountId: cash.id, debitCents: amt, creditCents: 0, description: "Bank deposit" },
       { accountId: data.accountId, debitCents: 0, creditCents: amt, description: "Offset" }]
    : [{ accountId: data.accountId, debitCents: -amt, creditCents: 0, description: "Offset" },
       { accountId: cash.id, debitCents: 0, creditCents: -amt, description: "Bank withdrawal" }];
  requireBalanced(lines);

  const entry = await db.journalEntry.create({
    data: {
      postedAt,
      memo: `Bank match: ${txn.description}`,
      source: `BANKTXN:${txn.id}`,
      lines: { create: lines.map(l => ({ accountId: l.accountId, debitCents: l.debitCents, creditCents: l.creditCents, description: l.description })) }
    }
  });

  await db.bankTxn.update({ where: { id: txn.id }, data: { matchedEntryId: entry.id } });
  const match = await db.bankMatch.create({ data: { sessionId: data.sessionId, bankTxnId: txn.id, journalEntryId: entry.id } });

  await audit(viewer, "MATCH", "BankTxn", txn.id, null, { entryId: entry.id, matchId: match.id });
  await track({ viewer, event: "reconcile_match", entity: "BankTxn", entityId: txn.id, props: { journalEntryId: entry.id } });
  redirect(`/books/reconcile/${data.sessionId}`);
}

const BankImportSchema = z.object({
  bankAccountId: z.string().min(1),
  csvText: z.string().min(5)
});

// Expected CSV: postedAt,description,amountCents,type
export async function importBankCsv(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "ACCOUNTANT");
  const data = BankImportSchema.parse({ bankAccountId: String(formData.get("bankAccountId")||""), csvText: String(formData.get("csvText")||"") });

  const rows = data.csvText.trim().split(/\r?\n/).filter(Boolean);
  const parsed: any[] = [];
  for (const row of rows) {
    const cols = row.split(",").map(c => c.trim());
    if (cols[0].toLowerCase().includes("posted")) continue;
    const [postedAt, description, amountCents, type] = cols;
    if (!postedAt || !description || !amountCents) continue;
    parsed.push({
      bankAccountId: data.bankAccountId,
      postedAt: new Date(postedAt),
      description,
      amountCents: Number(amountCents),
      type: (type || (Number(amountCents) >= 0 ? "DEPOSIT" : "WITHDRAWAL")) as any
    });
  }

  if (parsed.length) await db.bankTxn.createMany({ data: parsed });
  const job = await db.csvImportJob.create({ data: { kind: "BANK_TXN", status: "DONE", rowCount: parsed.length, rawSample: rows.slice(0,3).join("\n") } });
  await audit(viewer, "IMPORT", "CsvImportJob", job.id, null, job);
  await track({ viewer, event: "import_bank_csv", entity: "CsvImportJob", entityId: job.id, props: { rowCount: job.rowCount } });
  redirect("/books/banking");
}
