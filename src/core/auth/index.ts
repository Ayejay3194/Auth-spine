/**
 * Core Authentication Module
 * Optimized, performance-focused authentication system
 */

// Simple event emitter implementation
interface EventListener {
  (event: string, ...args: any[]): void;
}

class SimpleEventEmitter {
  private listeners = new Map<string, EventListener[]>();

  on(event: string, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(event, ...args));
    }
  }

  off(event: string, listener: EventListener): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
}

// Enhanced type definitions
export interface AuthConfig {
  providers: AuthProvider[];
  session?: SessionConfig;
  callbacks?: CallbackConfig;
  secret?: string;
  debug?: boolean;
}

export interface AuthProvider {
  id: string;
  name: string;
  type: 'oauth' | 'credentials' | 'email';
  clientId?: string;
  clientSecret?: string;
  authorization?: AuthorizationConfig;
  options?: Record<string, any>;
}

export interface SessionConfig {
  strategy?: 'jwt' | 'database';
  maxAge?: number;
  updateAge?: number;
  generateSessionToken?: boolean;
}

export interface CallbackConfig {
  signIn?: (user: User, account: Account, profile: Profile) => Promise<boolean>;
  signOut?: (session: Session) => Promise<boolean>;
  jwt?: (token: JWT, user: User) => Promise<JWT>;
  redirect?: (url: string, baseUrl?: string) => void;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
  permissions?: string[];
  metadata?: Record<string, any>;
}

export interface Account {
  provider: string;
  type: string;
  providerAccountId: string;
  userId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
}

export interface Profile {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  username?: string;
  provider?: string;
}

export interface Session {
  user: User;
  expires: Date;
  accessToken?: string;
  refreshToken?: string;
  provider?: string;
}

export interface JWT {
  payload: JWTPayload;
  header: JWTHeader;
  signature: string;
}

export interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
  aud?: string;
  iss?: string;
  name?: string;
  email?: string;
  picture?: string;
  role?: string;
}

export interface JWTHeader {
  alg: string;
  typ: string;
  kid?: string;
}

export interface AuthorizationConfig {
  url: string;
  params?: Record<string, string>;
  scope?: string;
  responseType?: string;
  state?: string;
}

// Enhanced error types
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthenticationError extends AuthError {
  constructor(message: string, code: string = 'AUTH_FAILED') {
    super(message, code, 401);
  }
}

export class AuthorizationError extends AuthError {
  constructor(message: string, code: string = 'AUTHZ_FAILED') {
    super(message, code, 403);
  }
}

// Performance-optimized session store
export class SessionStore extends SimpleEventEmitter {
  private sessions = new Map<string, Session>();
  private readonly maxSessions = 1000;
  private readonly cleanupInterval = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super();
    this.startCleanup();
  }

  private startCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  private cleanup(): void {
    const now = new Date();
    for (const [id, session] of this.sessions.entries()) {
      if (session.expires <= now) {
        this.sessions.delete(id);
        this.emit('sessionExpired', { sessionId: id });
      }
    }

    // Remove oldest sessions if too many
    if (this.sessions.size > this.maxSessions) {
      const entries = Array.from(this.sessions.entries())
        .sort(([, a], [, b]) => a.expires.getTime() - b.expires.getTime());
      
      const toRemove = entries.slice(0, this.sessions.size - this.maxSessions);
      toRemove.forEach(([id]) => {
        this.sessions.delete(id);
        this.emit('sessionEvicted', { sessionId: id });
      });
    }
  }

  create(session: Session): string {
    const sessionId = this.generateSessionId();
    this.sessions.set(sessionId, session);
    this.emit('sessionCreated', { sessionId, session });
    return sessionId;
  }

  get(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    if (session.expires <= new Date()) {
      this.sessions.delete(sessionId);
      this.emit('sessionExpired', { sessionId });
      return null;
    }
    
    return session;
  }

  update(sessionId: string, updates: Partial<Session>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(sessionId, updatedSession);
    this.emit('sessionUpdated', { sessionId, session: updatedSession });
    return true;
  }

  delete(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      this.emit('sessionDeleted', { sessionId });
    }
    return deleted;
  }

  private generateSessionId(): string {
    return Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 36).toString(36)
    ).join('');
  }

  clear(): void {
    this.sessions.clear();
    this.emit('sessionsCleared');
  }

  size(): number {
    return this.sessions.size;
  }

  getAll(): Session[] {
    return Array.from(this.sessions.values());
  }
}

// Optimized authentication manager
export class AuthManager {
  private config: AuthConfig;
  private sessionStore: SessionStore;
  private providers = new Map<string, AuthProvider>();
  private initialized = false;

  constructor(config: AuthConfig) {
    this.config = {
      debug: false,
      ...config
    };
    this.sessionStore = new SessionStore();
    this.initializeProviders();
  }

  private initializeProviders(): void {
    this.config.providers.forEach(provider => {
      this.providers.set(provider.id, provider);
    });
    this.initialized = true;
  }

  async signIn(providerId: string, credentials?: Record<string, any>): Promise<Session> {
    if (!this.initialized) {
      throw new AuthenticationError('AuthManager not initialized');
    }

    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new AuthenticationError(`Provider ${providerId} not found`);
    }

    try {
      // Simulate authentication (in production, this would call actual provider)
      const user = await this.authenticateWithProvider(provider, credentials);
      const account = await this.createAccount(provider, user);
      
      // Create session
      const session: Session = {
        user,
        expires: this.calculateExpiration(),
        provider: provider.id,
        accessToken: this.generateAccessToken(),
        refreshToken: this.generateRefreshToken()
      };

      // Store session
      const sessionId = this.sessionStore.create(session);
      
      // Trigger callback
      if (this.config.callbacks?.signIn) {
        await this.config.callbacks.signIn(user, account, {} as Profile);
      }

      if (this.config.debug) {
        console.log(`[AuthManager] User signed in: ${user.id} via ${provider.name}`);
      }

      return session;
    } catch (error: any) {
      throw new AuthenticationError(`Sign in failed: ${error.message}`);
    }
  }

  async signOut(sessionId: string): Promise<boolean> {
    const session = this.sessionStore.get(sessionId);
    if (!session) {
      return false;
    }

    try {
      // Trigger callback
      if (this.config.callbacks?.signOut) {
        await this.config.callbacks.signOut(session);
      }

      // Remove session
      this.sessionStore.delete(sessionId);

      if (this.config.debug) {
        console.log(`[AuthManager] User signed out: ${session.user.id}`);
      }

      return true;
    } catch (error: any) {
      throw new AuthenticationError(`Sign out failed: ${error.message}`);
    }
  }

  async validateSession(sessionId: string): Promise<Session | null> {
    const session = this.sessionStore.get(sessionId);
    if (!session) {
      return null;
    }

    // Additional validation can be added here
    return session;
  }

  async refreshSession(sessionId: string): Promise<Session | null> {
    const session = this.sessionStore.get(sessionId);
    if (!session || !session.refreshToken) {
      return null;
    }

    try {
      // Simulate token refresh (in production, this would validate with provider)
      const newAccessToken = this.generateAccessToken();
      const newRefreshToken = this.generateRefreshToken();
      
      const updatedSession: Session = {
        ...session,
        expires: this.calculateExpiration(),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };

      this.sessionStore.update(sessionId, updatedSession);
      
      if (this.config.debug) {
        console.log(`[AuthManager] Session refreshed: ${session.user.id}`);
      }

      return updatedSession;
    } catch (error: any) {
      // Refresh failed, remove session
      this.sessionStore.delete(sessionId);
      return null;
    }
  }

  private async authenticateWithProvider(provider: AuthProvider, credentials?: Record<string, any>): Promise<User> {
    // Simulate authentication (in production, this would call actual provider APIs)
    return {
      id: `user_${Date.now()}`,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      permissions: ['read', 'write']
    };
  }

  private async createAccount(provider: AuthProvider, user: User): Promise<Account> {
    // Simulate account creation
    return {
      provider: provider.id,
      type: provider.type,
      providerAccountId: user.id,
      userId: user.id,
      accessToken: this.generateAccessToken(),
      expiresAt: this.calculateExpiration()
    };
  }

  private calculateExpiration(): Date {
    const maxAge = this.config.session?.maxAge || 24 * 60 * 60 * 1000; // 24 hours default
    return new Date(Date.now() + maxAge);
  }

  private generateAccessToken(): string {
    return `access_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private generateRefreshToken(): string {
    return `refresh_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  // Utility methods
  getSessionStore(): SessionStore {
    return this.sessionStore;
  }

  getConfig(): AuthConfig {
    return { ...this.config };
  }

  getProviders(): AuthProvider[] {
    return Array.from(this.providers.values());
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Factory function
export function createAuthManager(config: AuthConfig): AuthManager {
  return new AuthManager(config);
}

// Default configuration
export const defaultAuthConfig: AuthConfig = {
  providers: [],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    generateSessionToken: true
  },
  debug: false
};

// Utility functions
export function createAuthProvider(config: Partial<AuthProvider>): AuthProvider {
  return {
    id: config.id || 'default',
    name: config.name || 'Default Provider',
    type: config.type || 'oauth',
    ...config
  };
}

export function createSessionConfig(config: Partial<SessionConfig>): SessionConfig {
  return {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 * 1000,
    generateSessionToken: true,
    ...config
  };
}

// Re-exports
export { SessionStore, AuthManager, createAuthManager, defaultAuthConfig };
export type { AuthConfig, AuthProvider, Session, User, Account, Profile, JWT, JWTPayload, JWTHeader };
