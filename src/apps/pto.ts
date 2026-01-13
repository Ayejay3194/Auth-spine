
"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function approvePto(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "MANAGER");
  const id = String(formData.get("id"));
  const before = await db.ptoRequest.findUnique({ where: { id } });
  const after = await db.ptoRequest.update({ where: { id }, data: { status: "APPROVED", decidedAt: new Date() } });
  await audit(viewer, "APPROVE", "PtoRequest", id, before, after);
  redirect("/time/pto");
}

export async function denyPto(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "MANAGER");
  const id = String(formData.get("id"));
  const before = await db.ptoRequest.findUnique({ where: { id } });
  const after = await db.ptoRequest.update({ where: { id }, data: { status: "DENIED", decidedAt: new Date() } });
  await audit(viewer, "DENY", "PtoRequest", id, before, after);
  redirect("/time/pto");
}
