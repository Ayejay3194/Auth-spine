import type { PercentBps } from "@/src/server/core/types";

export class PaymentsService {
  private platformFeeBps: PercentBps = Number(process.env.PLATFORM_FEE_BPS ?? 800);

  getPlatformFeeBps() {
    return this.platformFeeBps;
  }

  calcPlatformFee(amountCents: number) {
    return Math.round((amountCents * this.platformFeeBps) / 10_000);
  }

  async createDepositLink(_input: { professionalId: string; clientId: string; amountCents: number }): Promise<string> {
    return "https://example.com/deposit (stub)";
  }

  async handleStripeEvent(_event: unknown): Promise<void> {}

  async chargeNoShowFee(_bookingId: string): Promise<void> {}
}
