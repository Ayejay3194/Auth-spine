export declare function hashPassword(password: string, saltRounds?: number): Promise<string>;
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
export declare function validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
};
export declare function generateSecurePassword(length?: number): string;
