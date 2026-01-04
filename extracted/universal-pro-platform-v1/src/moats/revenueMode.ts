export class RevenueMode {
  activate(targetCents: number) {
    return {
      active: true,
      targetCents,
      priceDropPercent: 20,
      prioritizeHighTicket: true,
      message: `Revenue mode on. Target: $${(targetCents / 100).toFixed(0)} this week.`,
    };
  }
}
