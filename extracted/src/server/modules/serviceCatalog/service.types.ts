import type { ID, ISODateTime, Money, LocationType, Vertical } from "@/src/server/core/types";

export type Service = {
  id: ID;
  professionalId: ID;
  vertical: Vertical;
  name: string;
  durationMin: number;
  price: Money;
  locationType: LocationType;
  metadata: Record<string, unknown>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
