
"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { buildItemsFromApprovedTimesheets } from "@/lib/payroll/engine";

const CreateSchema = z.object({
  payGroupName: z.string().min(1),
  notes: z.string().optional(),
  periodStart: z.string().min(10),
  periodEnd: z.string().min(10)
});

export async function createPayRun(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "PAYROLL");

  const parsed = CreateSchema.parse({
    payGroupName: String(formData.get("payGroupName") || ""),
    notes: String(formData.get("notes") || ""),
    periodStart: String(formData.get("periodStart") || ""),
    periodEnd: String(formData.get("periodEnd") || "")
  });

  const pg = await db.payGroup.upsert({
    where: { name: parsed.payGroupName },
    update: {},
    create: { name: parsed.payGroupName, cadence: "BIWEEKLY" }
  });

  const run = await db.payRun.create({
    data: {
      payGroupId: pg.id,
      status: "DRAFT",
      notes: parsed.notes || undefined,
      periodStart: new Date(parsed.periodStart),
      periodEnd: new Date(parsed.periodEnd)
    }
  });

  await audit(viewer, "CREATE", "PayRun", run.id, null, run);
  redirect(`/payroll/runs/${run.id}`);
}

const GenSchema = z.object({ id: z.string().min(1) });

export async function generateItems(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "PAYROLL");
  const parsed = GenSchema.parse({ id: String(formData.get("id")) });

  const run = await db.payRun.findUnique({ where: { id: parsed.id } });
  if (!run || !run.periodStart || !run.periodEnd) throw new Error("RUN_MISSING_PERIOD");

  const before = await db.payRun.findUnique({ where: { id: parsed.id }, include: { items: true, exceptions: true } });

  await db.payRunItem.deleteMany({ where: { payRunId: parsed.id } });
  await db.payException.deleteMany({ where: { payRunId: parsed.id } });

  const { items, exceptions } = await buildItemsFromApprovedTimesheets(parsed.id, run.periodStart, run.periodEnd);

  if (items.length) await db.payRunItem.createMany({ data: items.map(i => ({ ...i, payRunId: parsed.id })) });
  if (exceptions.length) await db.payException.createMany({ data: exceptions.map(x => ({ ...x, payRunId: parsed.id })) });

  const after = await db.payRun.findUnique({ where: { id: parsed.id }, include: { items: true, exceptions: true } });
  await audit(viewer, "GENERATE_ITEMS", "PayRun", parsed.id, before, after);

  redirect(`/payroll/runs/${parsed.id}`);
}
