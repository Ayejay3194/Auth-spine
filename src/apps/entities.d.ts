/**
 * Deterministic entity extraction.
 * - Dates: supports "today", "tomorrow", "next mon", "2025-12-13", "12/13", "dec 13"
 * - Times: "3pm", "15:30"
 * - Money: "$50", "50 dollars"
 * - Emails/phones
 * - IDs: booking_*, invoice_*
 *
 * This is intentionally conservative: when unsure, mark missing.
 */
export declare function extractEmail(text: string): string | null;
export declare function extractPhone(text: string): string | null;
export declare function extractMoney(text: string): number | null;
export declare function extractId(text: string, prefix: string): string | null;
export declare function extractDateTime(text: string, nowISO: string): {
    dateISO?: string;
    time?: string;
    dateTimeISO?: string;
};
export declare function requireFields(entities: Record<string, unknown>, required: string[]): string[];
//# sourceMappingURL=entities.d.ts.map