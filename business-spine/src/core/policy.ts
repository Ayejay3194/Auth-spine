import type { Role } from "@prisma/client";
import type { Policy } from "./types.js";

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

export const defaultPolicy: Policy = (args) => {
  return {
    allow: true,
    reason: "Default policy allows all actions"
  };
};
