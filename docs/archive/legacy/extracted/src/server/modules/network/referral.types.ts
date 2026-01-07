import type { ID, ISODateTime } from "@/src/server/core/types";

export type Referral = {
  id: ID;
  fromProfessionalId: ID;
  toProfessionalId: ID;
  clientId: ID;
  note?: string;
  createdAt: ISODateTime;
};
