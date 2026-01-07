import type { ID, ISODateTime, Vertical } from "@/src/server/core/types";

export type Professional = {
  id: ID;
  vertical: Vertical;
  businessName: string;
  phoneE164?: string;
  email?: string;
  requiredFields: Record<string, string>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
