export interface Tenant {
    id: string;
    name: string;
    domain: string;
    subdomain: string;
    branding: {
        logo: string;
        colors: Record<string, string>;
        customDomain?: string;
        favicon?: string;
    };
    features: string[];
    subscription: {
        plan: 'free' | 'pro' | 'enterprise';
        status: 'active' | 'inactive' | 'suspended';
        billingCycle: 'monthly' | 'yearly';
        nextBillingDate: Date;
    };
    settings: {
        timezone: string;
        language: string;
        currency: string;
        dateFormat: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare function getTenantFromRequest(request: any): string;
export declare function registerTenant(tenant: Tenant): void;
export declare function getTenant(tenantId: string): Tenant | undefined;
export declare function getTenantByDomain(domain: string): Tenant | undefined;
export declare function getTenantBranding(tenantId: string): {};
export declare function isTenantFeatureEnabled(tenantId: string, feature: string): boolean;
export declare function getTenantSettings(tenantId: string): {
    timezone: string;
    language: string;
    currency: string;
    dateFormat: string;
};
export declare function updateTenantSubscription(tenantId: string, subscription: Partial<Tenant['subscription']>): void;
export declare function listTenants(): Tenant[];
export declare function deleteTenant(tenantId: string): boolean;
//# sourceMappingURL=tenant.d.ts.map