export type VerticalKey =
  | "beauty"
  | "fitness"
  | "consulting"
  | "education"
  | "home_services"
  | "health"
  | (string & {});

export type LocationType = "in_person" | "virtual" | "mobile";

export interface ServiceTemplate {
  code: string;
  name: string;
  defaultDurationMin: number;
  defaultPriceMinor: number;
  locationTypes: LocationType[];
  capacity?: { min: number; max: number };
  metadata?: Record<string, unknown>;
}

export type IntakeQuestion =
  | { id: string; prompt: string; type: "text" }
  | { id: string; prompt: string; type: "text_optional" }
  | { id: string; prompt: string; type: "image_optional" }
  | { id: string; prompt: string; type: "enum"; options: string[] };

export interface ComplianceRule {
  id: string;
  when: string;
  blockIfMissingConsent?: string;
  requireFields?: string[];
  blockIfTermsMatch?: string[];
  regionScope?: { country?: string; state?: string };
}

export interface VerticalConfig {
  vertical: VerticalKey;
  label: string;
  serviceTemplates: ServiceTemplate[];
  requiredProfessionalFields: string[];
  cadenceHints?: Array<Record<string, unknown>>;
  conversation: {
    intentModel: string;
    intakeQuestions: IntakeQuestion[];
  };
  compliance: {
    consentsRequired: string[];
    rules: ComplianceRule[];
  };
  pricingGuidance?: Record<string, unknown>;
}
