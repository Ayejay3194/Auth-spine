export interface ReferralPolicy {
  eligibleVerticalPairs: Array<{ from: string; to: string } | { from: "*"; to: "*" }>;
  attributionWindowDays: number;
  payout: {
    kind: "first_transaction_percent" | "first_month_percent" | "fixed_minor";
    value: number;
    capMinor?: number;
  };
  antiFraud: {
    requireClientVerifiedPayment: boolean;
    requireCompletedBooking: boolean;
    maxPayoutsPerClientPerYear?: number;
  };
}

export const defaultReferralPolicy: ReferralPolicy = {
  eligibleVerticalPairs: [{ from: "*", to: "*" }],
  attributionWindowDays: 180,
  payout: { kind: "first_transaction_percent", value: 0.10, capMinor: 50000 },
  antiFraud: { requireClientVerifiedPayment: true, requireCompletedBooking: true, maxPayoutsPerClientPerYear: 5 }
};
