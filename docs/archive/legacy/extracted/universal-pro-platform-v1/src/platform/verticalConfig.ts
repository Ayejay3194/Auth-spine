import type { Vertical, LocationType } from "../core/types.js";

export type ServiceTemplate = {
  name: string;
  defaultDurationMin: number;
  defaultPriceCents: number;
  locationType: LocationType;
  metadata?: Record<string, any>;
};

export type VerticalConfig = {
  vertical: Vertical;
  serviceTemplates: ServiceTemplate[];
  requiredFields: string[];
  bookingCadenceHint: string;
  complianceRules: string[];
  conversationHints: string[];
};

export function validateConfig(cfg: VerticalConfig) {
  if (!cfg.vertical) throw new Error("vertical required");
  if (!Array.isArray(cfg.serviceTemplates)) throw new Error("serviceTemplates must be array");
  return true;
}
