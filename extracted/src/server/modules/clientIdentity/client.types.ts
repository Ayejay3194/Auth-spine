import type { ID, ISODateTime, RelationshipState } from "@/src/server/core/types";

export type Client = {
  id: ID;
  phoneE164: string;
  email?: string;
  name?: string;
  birthday?: string; // YYYY-MM-DD
  relationshipState: RelationshipState;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
