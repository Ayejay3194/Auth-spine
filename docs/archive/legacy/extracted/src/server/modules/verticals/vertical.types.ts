import type { Vertical, LocationType } from "@/src/server/core/types";

export type VerticalServiceTemplate = {
  name: string;
  default_duration_min: number;
  default_price_cents: number;
  location_type: LocationType;
  metadata?: Record<string, unknown>;
};

export type VerticalConfig = {
  vertical: Vertical;
  service_templates: VerticalServiceTemplate[];
  required_fields: string[];
  booking_cadence_hint: string;
  conversation_context: {
    keywords: string[];
    intake_questions: Array<{ key: string; prompt: string }>;
  };
  compliance_rules: string[];
};
