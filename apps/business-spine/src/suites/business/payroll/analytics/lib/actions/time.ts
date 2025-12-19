
"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";

const CreateTimesheetSchema = z.object({
  employeeId: z.string().min(1),
  periodStart: z.string().min(10),
  periodEnd: z.string().min(10)
});

export async function createTimesheet(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "HR");

  const parsed = CreateTimesheetSchema.parse({
    employeeId: String(formData.get("employeeId")),
    periodStart: String(formData.get("periodStart")),
    periodEnd: String(formData.get("periodEnd"))
  });

  const created = await db.timesheet.create({
    data: { employeeId: parsed.employeeId, periodStart: new Date(parsed.periodStart), periodEnd: new Date(parsed.periodEnd), status: "DRAFT" }
  });

  await audit(viewer, "CREATE", "Timesheet", created.id, null, created);
  redirect(`/time/timesheets/${created.id}`);
}

export async function attachEntryToTimesheet(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "EMPLOYEE");
  const timesheetId = String(formData.get("timesheetId"));
  const entryId = String(formData.get("entryId"));

  const before = await db.timeEntry.findUnique({ where: { id: entryId } });
  const after = await db.timeEntry.update({ where: { id: entryId }, data: { timesheetId } });

  await audit(viewer, "ATTACH", "TimeEntry", entryId, before, after);
  redirect(`/time/timesheets/${timesheetId}`);
}

export async function submitTimesheet(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "EMPLOYEE");

  const id = String(formData.get("id"));
  const before = await db.timesheet.findUnique({ where: { id } });
  const after = await db.timesheet.update({ where: { id }, data: { status: "SUBMITTED", submittedAt: new Date() } });

  await audit(viewer, "SUBMIT", "Timesheet", id, before, after);
  redirect(`/time/timesheets/${id}`);
}

export async function approveTimesheet(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "MANAGER");

  const id = String(formData.get("id"));
  const before = await db.timesheet.findUnique({ where: { id } });
  const after = await db.timesheet.update({ where: { id }, data: { status: "APPROVED", approvedAt: new Date(), decidedById: viewer.id } });

  await audit(viewer, "APPROVE", "Timesheet", id, before, after);
  redirect("/time/approvals");
}

export async function rejectTimesheet(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "MANAGER");

  const id = String(formData.get("id"));
  const before = await db.timesheet.findUnique({ where: { id } });
  const after = await db.timesheet.update({ where: { id }, data: { status: "REJECTED", decidedById: viewer.id } });

  await audit(viewer, "REJECT", "Timesheet", id, before, after);
  redirect("/time/approvals");
}
