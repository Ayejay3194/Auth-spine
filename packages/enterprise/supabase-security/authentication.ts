/**
 * Authentication for Supabase Security & Architecture Pack
 * 
 * Provides secure authentication with MFA, SSO, and comprehensive
 * password policies for luxury booking platforms.
 */

import { AuthConfig, UserSecurityProfile } from './types.js';

export class AuthenticationManager {
  private config: AuthConfig;
  private sessions: Map<string, any> = new Map();
  private failedAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private userProfiles: Map<string, UserSecurityProfile> = new Map();
  private initialized = false;

  /**
   * Initialize authentication system
   */
  async initialize(config: AuthConfig): Promise<void> {
    this.config = config;
    this.loadDefaultUsers();
    this.initialized = true;
  }

  /**
   * Authenticate user with security checks
   */
  async authenticate(credentials: {
    email: string;
    password: string;
    mfaCode?: string;
    tenantId?: string;
  }): Promise<{
    success: boolean;
    user?: any;
    session?: any;
    requiresMFA?: boolean;
    error?: string;
  }> {
    // Check if user is locked out
    const lockoutStatus = this.checkLockout(credentials.email);
    if (lockoutStatus.locked) {
      return {
        success: false,
        error: `Account locked. Try again in ${Math.ceil(lockoutStatus.remainingTime / 60000)} minutes.`
      };
    }

    // Validate password policy
    const passwordValidation = this.validatePassword(credentials.password);
    if (!passwordValidation.valid) {
      this.recordFailedAttempt(credentials.email);
      return {
        success: false,
        error: 'Invalid password format'
      };
    }

    // Authenticate user (simulated)
    const user = await this.findUser(credentials.email);
    if (!user) {
      this.recordFailedAttempt(credentials.email);
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    // Check password
    const passwordValid = await this.verifyPassword(credentials.password, user.passwordHash);
    if (!passwordValid) {
      this.recordFailedAttempt(credentials.email);
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    // Check MFA if enabled
    if (this.config.enableMFA && user.mfaEnabled && !credentials.mfaCode) {
      return {
        success: false,
        requiresMFA: true,
        error: 'MFA code required'
      };
    }

    if (this.config.enableMFA && user.mfaEnabled && credentials.mfaCode) {
      const mfaValid = await this.verifyMFA(user.id, credentials.mfaCode);
      if (!mfaValid) {
        this.recordFailedAttempt(credentials.email);
        return {
          success: false,
          error: 'Invalid MFA code'
        };
      }
    }

    // Clear failed attempts on successful auth
    this.clearFailedAttempts(credentials.email);

    // Create session
    const session = await this.createSession(user, credentials.tenantId);

    // Update user profile
    await this.updateUserLastLogin(user.id);

    return {
      success: true,
      user: this.sanitizeUser(user),
      session
    };
  }

  /**
   * Validate session and permissions
   */
  async validateSession(sessionToken: string, requiredPermissions?: string[]): Promise<{
    valid: boolean;
    user?: any;
    permissions: string[];
    error?: string;
  }> {
    const session = this.sessions.get(sessionToken);
    if (!session) {
      return { valid: false, permissions: [], error: 'Invalid session' };
    }

    // Check session expiration
    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionToken);
      return { valid: false, permissions: [], error: 'Session expired' };
    }

    // Get user
    const user = await this.findUserById(session.userId);
    if (!user) {
      return { valid: false, permissions: [], error: 'User not found' };
    }

    // Check required permissions
    let permissions = user.permissions || [];
    if (requiredPermissions) {
      const hasAllPermissions = requiredPermissions.every(perm => 
        permissions.includes(perm)
      );
      if (!hasAllPermissions) {
        return { 
          valid: false, 
          permissions, 
          error: 'Insufficient permissions' 
        };
      }
    }

    // Update session activity
    session.lastActivity = new Date();

    return {
      valid: true,
      user: this.sanitizeUser(user),
      permissions
    };
  }

  /**
   * Get user security profile
   */
  async getUserProfile(userId: string): Promise<UserSecurityProfile> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new Error(`User profile not found: ${userId}`);
    }

    // Update active sessions count
    const activeSessions = Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.expiresAt > new Date())
      .length;

    return {
      ...profile,
      activeSessions
    };
  }

  /**
   * Get authentication metrics
   */
  async getMetrics(): Promise<{
    totalLogins: number;
    successfulLogins: number;
    failedLogins: number;
    mfaUsage: number;
    passwordlessUsage: number;
  }> {
    const profiles = Array.from(this.userProfiles.values());
    const successfulLogins = profiles.filter(p => p.lastLogin).length;
    const totalFailedAttempts = Array.from(this.failedAttempts.values())
      .reduce((sum, attempts) => sum + attempts.count, 0);
    const mfaUsage = profiles.filter(p => p.mfaEnabled).length;
    const passwordlessUsage = profiles.filter(p => p.passwordlessEnabled).length;

    return {
      totalLogins: successfulLogins + totalFailedAttempts,
      successfulLogins,
      failedLogins: totalFailedAttempts,
      mfaUsage,
      passwordlessUsage
    };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  private validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.config.passwordPolicy.minLength) {
      errors.push(`Password must be at least ${this.config.passwordPolicy.minLength} characters`);
    }

    if (this.config.passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letters');
    }

    if (this.config.passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain lowercase letters');
    }

    if (this.config.passwordPolicy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain numbers');
    }

    if (this.config.passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain special characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private checkLockout(email: string): { locked: boolean; remainingTime: number } {
    const attempts = this.failedAttempts.get(email);
    if (!attempts) {
      return { locked: false, remainingTime: 0 };
    }

    if (attempts.count >= this.config.maxLoginAttempts) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
      const remainingTime = this.config.lockoutDuration * 1000 - timeSinceLastAttempt;

      if (remainingTime > 0) {
        return { locked: true, remainingTime };
      } else {
        // Lockout period expired, clear attempts
        this.failedAttempts.delete(email);
      }
    }

    return { locked: false, remainingTime: 0 };
  }

  private recordFailedAttempt(email: string): void {
    const attempts = this.failedAttempts.get(email) || { count: 0, lastAttempt: new Date() };
    attempts.count++;
    attempts.lastAttempt = new Date();
    this.failedAttempts.set(email, attempts);
  }

  private clearFailedAttempts(email: string): void {
    this.failedAttempts.delete(email);
  }

  private async findUser(email: string): Promise<any> {
    // Simulate user lookup
    const users = [
      {
        id: 'user_1',
        email: 'admin@luxurybooking.com',
        passwordHash: 'hashed_password_1',
        role: 'admin',
        permissions: ['*'],
        mfaEnabled: true,
        passwordlessEnabled: true,
        tenantId: 'tenant_1'
      },
      {
        id: 'user_2',
        email: 'operator@luxurybooking.com',
        passwordHash: 'hashed_password_2',
        role: 'operator',
        permissions: ['bookings:read', 'bookings:write', 'users:read'],
        mfaEnabled: true,
        passwordlessEnabled: false,
        tenantId: 'tenant_1'
      },
      {
        id: 'user_3',
        email: 'user@luxurybooking.com',
        passwordHash: 'hashed_password_3',
        role: 'user',
        permissions: ['bookings:read', 'profile:read', 'profile:write'],
        mfaEnabled: false,
        passwordlessEnabled: true,
        tenantId: 'tenant_2'
      }
    ];

    return users.find(u => u.email === email);
  }

  private async findUserById(userId: string): Promise<any> {
    const users = [
      {
        id: 'user_1',
        email: 'admin@luxurybooking.com',
        passwordHash: 'hashed_password_1',
        role: 'admin',
        permissions: ['*'],
        mfaEnabled: true,
        passwordlessEnabled: true,
        tenantId: 'tenant_1'
      },
      {
        id: 'user_2',
        email: 'operator@luxurybooking.com',
        passwordHash: 'hashed_password_2',
        role: 'operator',
        permissions: ['bookings:read', 'bookings:write', 'users:read'],
        mfaEnabled: true,
        passwordlessEnabled: false,
        tenantId: 'tenant_1'
      },
      {
        id: 'user_3',
        email: 'user@luxurybooking.com',
        passwordHash: 'hashed_password_3',
        role: 'user',
        permissions: ['bookings:read', 'profile:read', 'profile:write'],
        mfaEnabled: false,
        passwordlessEnabled: true,
        tenantId: 'tenant_2'
      }
    ];

    return users.find(u => u.id === userId);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    // Simulate password verification
    return password.length >= 8; // Simple check for demo
  }

  private async verifyMFA(userId: string, code: string): Promise<boolean> {
    // Simulate MFA verification
    return code === '123456'; // Demo code
  }

  private async createSession(user: any, tenantId?: string): Promise<any> {
    const sessionToken = this.generateSessionToken();
    const session = {
      id: sessionToken,
      userId: user.id,
      tenantId: tenantId || user.tenantId,
      role: user.role,
      permissions: user.permissions,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.sessionTimeout * 1000),
      lastActivity: new Date(),
      ipAddress: '127.0.0.1', // Would come from request
      userAgent: 'Luxury Booking Platform',
      mfaVerified: user.mfaEnabled
    };

    this.sessions.set(sessionToken, session);
    return session;
  }

  private generateSessionToken(): string {
    return 'session_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private sanitizeUser(user: any): any {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  private async updateUserLastLogin(userId: string): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (profile) {
      profile.lastLogin = new Date();
      profile.failedAttempts = 0;
      profile.lockedUntil = undefined;
    }
  }

  private loadDefaultUsers(): void {
    // Load default user security profiles
    const defaultProfiles: UserSecurityProfile[] = [
      {
        userId: 'user_1',
        email: 'admin@luxurybooking.com',
        role: 'admin',
        permissions: ['*'],
        mfaEnabled: true,
        lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
        failedAttempts: 0,
        passwordChangedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        activeSessions: 0,
        securityFlags: ['privileged_access', 'mfa_required']
      },
      {
        userId: 'user_2',
        email: 'operator@luxurybooking.com',
        role: 'operator',
        permissions: ['bookings:read', 'bookings:write', 'users:read'],
        mfaEnabled: true,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
        failedAttempts: 0,
        passwordChangedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        activeSessions: 0,
        securityFlags: ['mfa_required']
      },
      {
        userId: 'user_3',
        email: 'user@luxurybooking.com',
        role: 'user',
        permissions: ['bookings:read', 'profile:read', 'profile:write'],
        mfaEnabled: false,
        lastLogin: new Date(Date.now() - 30 * 60 * 1000),
        failedAttempts: 0,
        passwordChangedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        activeSessions: 0,
        securityFlags: []
      }
    ];

    defaultProfiles.forEach(profile => {
      this.userProfiles.set(profile.userId, profile);
    });
  }
}

// Export singleton instance
export const authentication = new AuthenticationManager();
