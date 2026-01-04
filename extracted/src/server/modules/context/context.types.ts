export type BookingSessionStage =
  | "NEW"
  | "AWAITING_VERTICAL_CONFIRM"
  | "AWAITING_INTAKE"
  | "AWAITING_SLOT_CHOICE"
  | "AWAITING_DEPOSIT";

export type ProposedSlot = { label: string; startAt: string; endAt: string };

export type BookingSession = {
  phoneE164: string;
  stage: BookingSessionStage;

  detectedVertical?: string;
  verticalConfidence?: number;

  professionalId?: string;
  serviceId?: string;

  intake?: Record<string, string>;

  proposedSlots?: ProposedSlot[];
  pendingSlot?: ProposedSlot;

  cardOnFile?: boolean;

  updatedAt: string;
};
