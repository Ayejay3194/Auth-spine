import { AuditEvent, ToolRegistry } from "../core/types.js";
type Booking = {
    id: string;
    clientId: string;
    service: string;
    startISO: string;
    endISO: string;
    status: "booked" | "cancelled";
};
type Client = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    tags: string[];
    notes: string[];
    doNotBook?: boolean;
};
type Invoice = {
    id: string;
    clientId: string;
    amount: number;
    status: "open" | "paid" | "void" | "refunded";
    createdISO: string;
    memo?: string;
};
type Promo = {
    id: string;
    code: string;
    percentOff: number;
    expiresISO?: string;
    active: boolean;
};
export declare const db: {
    bookings: Map<string, Booking>;
    clients: Map<string, Client>;
    invoices: Map<string, Invoice>;
    promos: Map<string, Promo>;
    audit: AuditEvent[];
    auditPrevHash: string | undefined;
};
export declare function memoryAuditWriter(evt: AuditEvent): Promise<void>;
export declare const memoryHashChain: {
    getPrevHash(): Promise<string | undefined>;
    setPrevHash(h: string): Promise<void>;
};
export declare const tools: ToolRegistry;
export {};
//# sourceMappingURL=memory.d.ts.map