import { AdminUser, AccountState, ImpersonationSession } from '../../core/types';
import { permissionEngine } from '../../core/permissions';
import { adminAudit, Audited } from '../../core/audit';
import { randomBytes } from 'crypto';

/**
 * Identity Module - User search, impersonation, account states
 * Fast, fuzzy, unforgiving
 */

export interface UserSearchParams {
  query?: string;
  email?: string;
  id?: string;
  username?: string;
  ip?: string;
  deviceFingerprint?: string;
  state?: AccountState['state'];
  fuzzy?: boolean;
  limit?: number;
  offset?: number;
}

export interface UserSearchResult {
  id: string;
  email: string;
  username?: string;
  state: AccountState['state'];
  createdAt: Date;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  deviceCount?: number;
  flagCount?: number;
  metadata?: Record<string, any>;
}

export interface LoginHistoryEntry {
  id: string;
  userId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: [number, number];
  };
  success: boolean;
  failureReason?: string;
  ipReputation?: {
    score: number;
    isVpn: boolean;
    isProxy: boolean;
    isTor: boolean;
    threatLevel: 'low' | 'medium' | 'high';
  };
}

export class IdentityService {
  private currentUser: AdminUser;

  constructor(currentUser: AdminUser) {
    this.currentUser = currentUser;
  }

  /**
   * Search users - 3 second max or you failed
   */
  @Audited('users')
  async searchUsers(params: UserSearchParams): Promise<{
    users: UserSearchResult[];
    total: number;
    took: number;
  }> {
    permissionEngine.require(this.currentUser, 'users.read');

    const startTime = Date.now();

    try {
      const { prisma } = await import('@spine/shared-db/prisma');

      const where: any = {};

      if (params.id) {
        where.id = params.id;
      } else if (params.email) {
        where.email = params.fuzzy
          ? { contains: params.email, mode: 'insensitive' }
          : params.email;
      } else if (params.username) {
        where.username = params.fuzzy
          ? { contains: params.username, mode: 'insensitive' }
          : params.username;
      } else if (params.query) {
        where.OR = [
          { email: { contains: params.query, mode: 'insensitive' } },
          { username: { contains: params.query, mode: 'insensitive' } },
          { id: params.query },
        ];
      }

      if (params.state) {
        where.accountState = params.state;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          take: params.limit || 50,
          skip: params.offset || 0,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                devices: true,
                flags: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      const took = Date.now() - startTime;

      return {
        users: users.map(u => ({
          id: u.id,
          email: u.email,
          username: u.username || undefined,
          state: (u.accountState as any) || 'active',
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt || undefined,
          lastLoginIp: u.lastLoginIp || undefined,
          deviceCount: u._count.devices,
          flagCount: u._count.flags,
          metadata: (u.metadata as any) || undefined,
        })),
        total,
        took,
      };
    } catch (error) {
      throw new Error(`User search failed: ${error}`);
    }
  }

  /**
   * Get user details with full context
   */
  @Audited('users')
  async getUserDetails(userId: string): Promise<{
    user: UserSearchResult;
    accountState: AccountState | null;
    loginHistory: LoginHistoryEntry[];
    devices: Array<{ id: string; fingerprint: string; lastSeen: Date }>;
    flags: Array<{ id: string; type: string; createdAt: Date }>;
  }> {
    permissionEngine.require(this.currentUser, 'users.read');

    const { prisma } = await import('@spine/shared-db/prisma');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        devices: { take: 10, orderBy: { lastSeen: 'desc' } },
        flags: { take: 20, orderBy: { createdAt: 'desc' } },
        loginHistory: { take: 50, orderBy: { timestamp: 'desc' } },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const accountState = await prisma.accountState.findUnique({
      where: { userId },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username || undefined,
        state: (user.accountState as any) || 'active',
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt || undefined,
        lastLoginIp: user.lastLoginIp || undefined,
        metadata: (user.metadata as any) || undefined,
      },
      accountState: accountState
        ? {
            userId: accountState.userId,
            state: accountState.state as any,
            reason: accountState.reason || undefined,
            setBy: accountState.setBy,
            setAt: accountState.setAt,
            expiresAt: accountState.expiresAt || undefined,
            metadata: (accountState.metadata as any) || undefined,
          }
        : null,
      loginHistory: user.loginHistory.map(l => ({
        id: l.id,
        userId: l.userId,
        timestamp: l.timestamp,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        deviceFingerprint: l.deviceFingerprint || undefined,
        success: l.success,
        failureReason: l.failureReason || undefined,
        location: (l.location as any) || undefined,
        ipReputation: (l.ipReputation as any) || undefined,
      })),
      devices: user.devices.map(d => ({
        id: d.id,
        fingerprint: d.fingerprint,
        lastSeen: d.lastSeen,
      })),
      flags: user.flags.map(f => ({
        id: f.id,
        type: f.type,
        createdAt: f.createdAt,
      })),
    };
  }

  /**
   * Set account state with reason
   */
  @Audited('users')
  async setAccountState(
    userId: string,
    state: AccountState['state'],
    reason: string,
    expiresAt?: Date
  ): Promise<AccountState> {
    permissionEngine.require(this.currentUser, 'users.write');

    const { prisma } = await import('@spine/shared-db/prisma');

    const accountState = await prisma.accountState.upsert({
      where: { userId },
      create: {
        userId,
        state,
        reason,
        setBy: this.currentUser.id,
        setAt: new Date(),
        expiresAt,
      },
      update: {
        state,
        reason,
        setBy: this.currentUser.id,
        setAt: new Date(),
        expiresAt,
      },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'set_account_state',
      resource: 'users',
      resourceId: userId,
      changes: { state, reason },
      metadata: { expiresAt },
    });

    return {
      userId: accountState.userId,
      state: accountState.state as any,
      reason: accountState.reason || undefined,
      setBy: accountState.setBy,
      setAt: accountState.setAt,
      expiresAt: accountState.expiresAt || undefined,
      metadata: (accountState.metadata as any) || undefined,
    };
  }

  /**
   * Start impersonation session - with audit trail
   */
  @Audited('users')
  async startImpersonation(
    targetUserId: string,
    reason: string,
    durationMinutes: number = 30
  ): Promise<ImpersonationSession> {
    permissionEngine.require(this.currentUser, 'users.impersonate');

    if (!reason || reason.length < 10) {
      throw new Error('Impersonation requires detailed reason (min 10 chars)');
    }

    const { prisma } = await import('@spine/shared-db/prisma');

    const session: ImpersonationSession = {
      id: randomBytes(16).toString('hex'),
      adminId: this.currentUser.id,
      targetUserId,
      reason,
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000),
      actions: [],
    };

    await prisma.impersonationSession.create({
      data: {
        id: session.id,
        adminId: session.adminId,
        targetUserId: session.targetUserId,
        reason: session.reason,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        actions: [],
      },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'start_impersonation',
      resource: 'users',
      resourceId: targetUserId,
      metadata: { reason, durationMinutes },
    });

    return session;
  }

  /**
   * End impersonation session
   */
  @Audited('users')
  async endImpersonation(sessionId: string): Promise<void> {
    permissionEngine.require(this.currentUser, 'users.impersonate');

    const { prisma } = await import('@spine/shared-db/prisma');

    const session = await prisma.impersonationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Impersonation session not found');
    }

    if (session.adminId !== this.currentUser.id) {
      throw new Error('Cannot end another admin\'s impersonation session');
    }

    await prisma.impersonationSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'end_impersonation',
      resource: 'users',
      resourceId: session.targetUserId,
      metadata: { sessionId },
    });
  }

  /**
   * Get login history with IP reputation
   */
  @Audited('users')
  async getLoginHistory(
    userId: string,
    limit: number = 50
  ): Promise<LoginHistoryEntry[]> {
    permissionEngine.require(this.currentUser, 'users.read');

    const { prisma } = await import('@spine/shared-db/prisma');

    const history = await prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return history.map(h => ({
      id: h.id,
      userId: h.userId,
      timestamp: h.timestamp,
      ipAddress: h.ipAddress,
      userAgent: h.userAgent,
      deviceFingerprint: h.deviceFingerprint || undefined,
      success: h.success,
      failureReason: h.failureReason || undefined,
      location: (h.location as any) || undefined,
      ipReputation: (h.ipReputation as any) || undefined,
    }));
  }

  /**
   * Flag user for review
   */
  @Audited('users')
  async flagUser(
    userId: string,
    flagType: string,
    reason: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    permissionEngine.require(this.currentUser, 'users.flag');

    const { prisma } = await import('@spine/shared-db/prisma');

    await prisma.userFlag.create({
      data: {
        userId,
        type: flagType,
        reason,
        severity,
        createdBy: this.currentUser.id,
        createdAt: new Date(),
      },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'flag_user',
      resource: 'users',
      resourceId: userId,
      metadata: { flagType, reason, severity },
    });
  }
}
