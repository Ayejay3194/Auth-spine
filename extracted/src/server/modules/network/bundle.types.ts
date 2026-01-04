import type { ID, ISODateTime, Money } from "@/src/server/core/types";

export type Bundle = {
  id: ID;
  name: string;
  serviceIds: ID[];
  price: Money;
  revenueSplit: Record<ID, number>;
  createdAt: ISODateTime;
};
