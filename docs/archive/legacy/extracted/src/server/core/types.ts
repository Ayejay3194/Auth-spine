export type ID = string;
export type ISODateTime = string;

export type Money = { amount: number; currency: "usd" };

export type AppError =
  | { kind: "VALIDATION"; message: string; meta?: unknown }
  | { kind: "NOT_FOUND"; message: string; meta?: unknown }
  | { kind: "CONFLICT"; message: string; meta?: unknown }
  | { kind: "UNAUTHORIZED"; message: string; meta?: unknown }
  | { kind: "FORBIDDEN"; message: string; meta?: unknown }
  | { kind: "INTERNAL"; message: string; meta?: unknown };

export type Result<T> = { ok: true; value: T } | { ok: false; error: AppError };

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
export type RelationshipState = "NEW" | "RETURNING" | "LOYAL";

export type TrustLevel = "DEPOSIT_REQUIRED" | "TRUSTED";

export type Vertical =
  | "beauty"
  | "fitness"
  | "consulting"
  | "education"
  | "home_services"
  | "health"
  | "other";

export type LocationType = "in_person" | "virtual" | "mobile";

export type PercentBps = number; // basis points
