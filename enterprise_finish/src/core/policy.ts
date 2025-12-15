import type { Role } from "@prisma/client";

export function assertRole(role: Role, allow: Role[]) {
  if (!allow.includes(role)) throw new Error(`Forbidden: role ${role}`);
}

export function needsConfirm(action: string): boolean {
  return [
    "booking.cancel",
    "payments.refund",
    "marketing.send",
    "automation.disable",
  ].includes(action);
}
