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
  if (!before) throw new Error("Pay run not found");

  const after = await db.payRun.update({ 
    where: { id }, 
    data: { status: "REVIEW", reviewedAt: new Date(), reviewedBy: viewer.id } 
  });
  
  await audit(viewer, "MOVE_TO_REVIEW", "PayRun", id, before, after);
  redirect(`/payroll/runs/${id}`);
}

export async function approvePayRun(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "PAYROLL_ADMIN");
  const id = String(formData.get("id"));

  const before = await db.payRun.findUnique({ where: { id } });
  if (!before) throw new Error("Pay run not found");

  const after = await db.payRun.update({ 
    where: { id }, 
    data: { status: "APPROVED", approvedAt: new Date(), approvedBy: viewer.id } 
  });
  
  await audit(viewer, "APPROVE", "PayRun", id, before, after);
  redirect(`/payroll/runs/${id}`);
}

export async function rejectPayRun(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "PAYROLL_ADMIN");
  const id = String(formData.get("id"));
  const reason = String(formData.get("reason") || "");

  const before = await db.payRun.findUnique({ where: { id } });
  if (!before) throw new Error("Pay run not found");

  const after = await db.payRun.update({ 
    where: { id }, 
    data: { status: "REJECTED", rejectedAt: new Date(), rejectedBy: viewer.id, rejectionReason: reason } 
  });
  
  await audit(viewer, "REJECT", "PayRun", id, before, after);
  redirect(`/payroll/runs/${id}`);
}

export async function deletePayRun(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "PAYROLL_ADMIN");
  const id = String(formData.get("id"));

  const before = await db.payRun.findUnique({ where: { id } });
  if (!before) throw new Error("Pay run not found");

  // Delete related items first
  await db.payRunItem.deleteMany({ where: { payRunId: id } });
  await db.payException.deleteMany({ where: { payRunId: id } });
  
  // Delete the pay run
  await db.payRun.delete({ where: { id } });
  
  await audit(viewer, "DELETE", "PayRun", id, before, null);
  redirect(`/payroll/runs`);
}
