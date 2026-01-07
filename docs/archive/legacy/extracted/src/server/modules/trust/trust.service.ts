import type { BookingRepo } from "@/src/server/modules/booking/booking.repo";
import type { TrustLevel } from "@/src/server/core/types";

export class TrustService {
  constructor(private bookings: BookingRepo) {}

  async getTrustLevel(clientId: string): Promise<TrustLevel> {
    const history = await this.bookings.listByClient(clientId);
    const okCount = history.filter(b => b.status === "COMPLETED" || b.status === "CONFIRMED").length;
    return okCount >= 3 ? "TRUSTED" : "DEPOSIT_REQUIRED";
  }
}
