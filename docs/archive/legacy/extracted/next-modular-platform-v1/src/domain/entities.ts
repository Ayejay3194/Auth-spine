import type { ID, ISODateTime, Money } from "../core/types";

export interface User {
  id: ID;
  createdAt: ISODateTime;
  tz?: string;
}

export interface Artist {
  id: ID;
  createdAt: ISODateTime;
  region?: { country?: string; state?: string; city?: string; zip?: string };
  license?: { number?: string; expiresAt?: ISODateTime; regionCode?: string };
}

export interface BookingDraft {
  id: ID;
  userId: ID;
  artistId: ID;
  serviceId?: ID;
  desiredTime?: ISODateTime;
  notes?: string;
  status: "draft" | "pending" | "confirmed" | "cancelled";
  lastTouchedAt: ISODateTime;
}

export interface ReviewDraft {
  id: ID;
  userId: ID;
  artistId: ID;
  rating?: number;
  text?: string;
  createdAt: ISODateTime;
}

export interface PortfolioAsset {
  id: ID;
  artistId: ID;
  url: string;
  uploadedAt: ISODateTime;
  meta?: { width?: number; height?: number; mime?: string };
}

export interface ServiceListing {
  id: ID;
  artistId: ID;
  title: string;
  description: string;
  basePrice: Money;
  durationMinutes: number;
  requiredLicenseTypes?: string[];
}
