
"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { buildPayRunItems, validateItems } from "@/lib/payroll/calc";

const CreateSchema = z.object({ payGroupName: z.string().min(1), notes: z.string().optional() });

export async function createPayRun(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "PAYROLL");

  const parsed = CreateSchema.parse({
    payGroupName: String(formData.get("payGroupName") || ""),
    notes: String(formData.get("notes") || "")
  });

  const pg = await db.payGroup.upsert({
    where: { name: parsed.payGroupName },
    update: {},
    create: { name: parsed.payGroupName, cadence: "BIWEEKLY" }
  });

  const run = await db.payRun.create({ data: { payGroupId: pg.id, status: "DRAFT", notes: parsed.notes || undefined } });
  await audit(viewer, "CREATE", "PayRun", run.id, null, run);
  redirect(`/payroll/runs/${run.id}`);
}

export async function generateItems(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "PAYROLL");
  const id = String(formData.get("id"));

  const before = await db.payRun.findUnique({ where: { id } });

  const items = await buildPayRunItems(id);
  await db.payRunItem.createMany({ data: items });

  const exceptions = validateItems(items.map(i => ({ employeeId: i.employeeId, netCents: i.netCents })));
  if (exceptions.length) await db.payException.createMany({ data: exceptions.map(x => ({ ...x, payRunId: id })) });

  const after = await db.payRun.findUnique({ where: { id }, include: { items: true, exceptions: true } });
  await audit(viewer, "GENERATE_ITEMS", "PayRun", id, before, after);
  redirect(`/payroll/runs/${id}`);
}

export async function moveRunToReview(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "PAYROLL");
  const id = String(formData.get("id"));
  const before = await db.payRun.findUnique({ where: { id } });
  const after = await db.payRun.update({ where: { id }, data: { status: "REVIEW" } });
  await audit(viewer, "MOVE_TO_REVIEW", "PayRun", id, before, after);
  redirect("/payroll/runs");
}

export async function finalizeRun(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "PAYROLL");
  const id = String(formData.get("id"));

  const run = await db.payRun.findUnique({ where: { id }, include: { exceptions: true } });
  if (!run) throw new Error("NOT_FOUND");
  if (run.exceptions.length) throw new Error("HAS_EXCEPTIONS");

  const before = await db.payRun.findUnique({ where: { id } });
  const after = await db.payRun.update({ where: { id }, data: { status: "FINALIZED", finalizedAt: new Date() } });
  await audit(viewer, "FINALIZE", "PayRun", id, before, after);
  redirect("/payroll/runs");
}
