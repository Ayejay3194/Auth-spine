import { Policy } from "./types.js";
import { uid } from "./util.js";

const HIGH_ACTIONS = new Set([
  "payments.refund",
  "payments.voidInvoice",
  "crm.deleteClient",
  "admin.exportData",
  "admin.deleteAccount",
]);

export const defaultPolicy: Policy = ({ ctx, action, sensitivity }) => {
  const role = ctx.actor.role;

  // Basic RBAC
  const ownerOnly = action.startsWith("admin.") || action.startsWith("security.");
  if (ownerOnly && role !== "owner" && role !== "admin") {
    return { allow: false, reason: "Only owner/admin can do that." };
  }

  // Accountants can view, not change bookings/clients
  if (role === "accountant" && (action.startsWith("booking.") || action.startsWith("crm."))) {
    return { allow: false, reason: "Accountant role is read-only for booking/clients." };
  }

  // Confirm for high sensitivity or explicit high actions
  if (sensitivity === "high" || HIGH_ACTIONS.has(action)) {
    return {
      allow: true,
      requireConfirmation: {
        required: true,
        message: `Confirm action: ${action}. Reply with the confirmation token to proceed.`,
        token: uid("confirm"),
      },
    };
  }

  // Staff can do medium booking ops but not money ops
  if (role === "staff" && action.startsWith("payments.")) {
    return { allow: false, reason: "Staff can’t run payments actions." };
  }

  return { allow: true };
};
