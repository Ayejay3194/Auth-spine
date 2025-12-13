import { Policy, AssistantContext, Confirmation } from "./types.js";

export const defaultPolicy: Policy = ({ ctx, action, sensitivity, input }) => {
  // Admin can do anything
  if (ctx.actor.role === "admin" || ctx.actor.role === "owner") {
    return { allow: true };
  }

  // High sensitivity actions require confirmation for non-admins
  if (sensitivity === "high") {
    return {
      allow: true,
      requireConfirmation: {
        required: true,
        message: `This action (${action}) is high sensitivity. Please confirm to proceed.`,
        token: `confirm_${action}_${Date.now()}`
      }
    };
  }

  // Medium sensitivity actions have role-based restrictions
  if (sensitivity === "medium") {
    const restrictedActions = ["refund", "delete", "admin", "security"];
    if (restrictedActions.some(restricted => action.includes(restricted))) {
      const allowedRoles = ["staff", "admin", "owner", "manager"];
      if (!allowedRoles.includes(ctx.actor.role)) {
        return {
          allow: false,
          reason: "This action requires staff or admin privileges"
        };
      }
    }
  }

  // Financial actions require accountant or higher
  if (action.includes("invoice") || action.includes("payment") || action.includes("refund")) {
    const financialRoles = ["accountant", "admin", "owner"];
    if (!financialRoles.includes(ctx.actor.role)) {
      return {
        allow: false,
        reason: "Financial actions require accountant or admin privileges"
      };
    }
  }

  return { allow: true };
};

export const strictPolicy: Policy = ({ ctx, action, sensitivity, input }) => {
  // Only admins can do high sensitivity actions
  if (sensitivity === "high") {
    const adminRoles = ["admin", "owner"];
    if (!adminRoles.includes(ctx.actor.role)) {
      return {
        allow: false,
        reason: "High sensitivity actions require admin privileges"
      };
    }
  }

  // Medium sensitivity requires staff or higher
  if (sensitivity === "medium") {
    const staffRoles = ["staff", "admin", "owner", "manager"];
    if (!staffRoles.includes(ctx.actor.role)) {
      return {
        allow: false,
        reason: "This action requires staff or higher privileges"
      };
    }
  }

  return { allow: true };
};
