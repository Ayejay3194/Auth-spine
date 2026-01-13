export interface DataExportRequest {
    userId: string;
    format: 'json' | 'csv';
    createdAt: Date;
}
export interface DataDeletionRequest {
    userId: string;
    reason: string;
    createdAt: Date;
}
export declare function exportUserData(userId: string, format?: 'json' | 'csv'): Promise<{
    ok: boolean;
    error: string;
    data?: undefined;
} | {
    ok: boolean;
    data: string;
    error?: undefined;
} | {
    ok: boolean;
    data: {
        profile: any;
        bookings: any;
        invoices: any;
        exportedAt: string;
    };
    error?: undefined;
}>;
export declare function deleteUserData(userId: string, reason: string): Promise<{
    ok: boolean;
    error?: undefined;
} | {
    ok: boolean;
    error: string;
}>;
export declare function getDataRetentionPolicy(): Promise<{
    retentionDays: number;
    autoDeleteAfterDays: number;
    archiveAfterDays: number;
    lastReviewDate: string;
}>;
export declare function consentManagement(userId: string, consentType: string, granted: boolean): Promise<{
    ok: boolean;
    error: string;
    data?: undefined;
} | {
    ok: boolean;
    data: {
        userId: string;
        consentType: string;
        granted: boolean;
        grantedAt: string;
    };
    error?: undefined;
}>;
export declare function checkDataRetention(): Promise<{
    ok: boolean;
    usersToDelete: any;
    cutoffDate: string;
    error?: undefined;
} | {
    ok: boolean;
    error: string;
    usersToDelete?: undefined;
    cutoffDate?: undefined;
}>;
//# sourceMappingURL=gdpr.d.ts.map