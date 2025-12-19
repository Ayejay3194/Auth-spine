
import { headers } from "next/headers";
import { db } from "@/lib/db";

export type Viewer = { id: string; email: string; role: string };

export async function getViewer(): Promise<Viewer> {
  const h = headers();
  const email = h.get("x-user-email") || "admin@demo.com";
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    const created = await db.user.create({ data: { email, role: "EMPLOYEE" } });
    return { id: created.id, email: created.email, role: created.role };
  }
  return { id: user.id, email: user.email, role: user.role };
}

const roleOrder = ["EMPLOYEE", "MANAGER", "HR", "PAYROLL", "ACCOUNTANT", "ADMIN"] as const;

export function requireRole(viewerRole: string, minRole: (typeof roleOrder)[number]) {
  const a = roleOrder.indexOf(viewerRole as any);
  const b = roleOrder.indexOf(minRole as any);
  if (a < b) throw new Error("FORBIDDEN");
}
