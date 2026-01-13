
"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getViewer, requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";

const Schema = z.object({
  employeeNo: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  department: z.string().optional(),
  location: z.string().optional(),
  payType: z.enum(["SALARY","HOURLY"]),
  rateCents: z.coerce.number().int().nonnegative()
});

export async function createEmployee(formData: FormData) {
  const viewer = await getViewer();
  requireRole(viewer.role, "HR");
  const data = Schema.parse({
    employeeNo: String(formData.get("employeeNo") || ""),
    firstName: String(formData.get("firstName") || ""),
    lastName: String(formData.get("lastName") || ""),
    department: String(formData.get("department") || ""),
    location: String(formData.get("location") || ""),
    payType: formData.get("payType"),
    rateCents: formData.get("rateCents")
  });

  const created = await db.employee.create({
    data: {
      employeeNo: data.employeeNo || undefined,
      firstName: data.firstName,
      lastName: data.lastName,
      department: data.department || undefined,
      location: data.location || undefined,
      payType: data.payType,
      rateCents: data.rateCents
    }
  });

  await audit(viewer, "CREATE", "Employee", created.id, null, created);
  redirect("/hr/employees");
}
