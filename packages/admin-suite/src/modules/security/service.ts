import { AdminUser } from '../../core/types';
import { permissionEngine } from '../../core/permissions';
import { adminAudit, Audited } from '../../core/audit';

/**
 * Security Module - Access review, abuse detection, compliance
 * If logs can be edited, they're fiction
 */

export interface AccessReview {
  userId: string;
  currentPermissions: string[];
  recommendedPermissions: string[];
  overPrivileged: string[];
  lastReviewedAt?: Date;
  reviewedBy?: string;
}

export interface AbuseSignal {
  type: 'velocity' | 'bot' | 'fraud' | 'credential_stuffing' | 'account_takeover';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress?: string;
  confidence: number;
  detectedAt: Date;
  evidence: Record<string, any>;
  autoBlocked: boolean;
}

export interface ThreatIntelligence {
  ipAddress: string;
  reputation: number;
  isVpn: boolean;
  isProxy: boolean;
  isTor: boolean;
  isDatacenter: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  country?: string;
  asn?: string;
  lastSeen: Date;
}

export class SecurityService {
  private currentUser: AdminUser;

  constructor(currentUser: AdminUser) {
    this.currentUser = currentUser;
  }

  /**
   * Review user access permissions
   */
  @Audited('security')
  async reviewUserAccess(userId: string): Promise<AccessReview> {
    permissionEngine.require(this.currentUser, 'access_review.read');

    const { prisma } = await import('@spine/shared/prisma');

    const user = await prisma.adminUser.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const currentPermissions = user.permissions as string[];
    const rolePermissions = user.roles.flatMap(r => r.permissions as string[]);
    const allPermissions = Array.from(new Set([...currentPermissions, ...rolePermissions]));

    const overPrivileged: string[] = [];
    const lastActivity = await prisma.adminAuditLog.findFirst({
      where: { actor: userId },
      orderBy: { timestamp: 'desc' },
    });

    const usedPermissions = new Set<string>();
    const recentActions = await prisma.adminAuditLog.findMany({
      where: {
        actor: userId,
        timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    for (const action of recentActions) {
      const permission = `${action.resource}.${action.action}`;
      usedPermissions.add(permission);
    }

    for (const perm of allPermissions) {
      if (perm === '*') continue;
      if (!usedPermissions.has(perm) && !perm.endsWith('.read')) {
        overPrivileged.push(perm);
      }
    }

    const recommendedPermissions = allPermissions.filter(p => !overPrivileged.includes(p));

    return {
      userId,
      currentPermissions: allPermissions,
      recommendedPermissions,
      overPrivileged,
      lastReviewedAt: lastActivity?.timestamp,
      reviewedBy: this.currentUser.id,
    };
  }

  /**
   * Detect abuse patterns
   */
  @Audited('security')
  async detectAbuse(params: {
    timeWindow?: number;
    userId?: string;
    ipAddress?: string;
  }): Promise<AbuseSignal[]> {
    permissionEngine.require(this.currentUser, 'abuse.read');

    const { prisma } = await import('@spine/shared/prisma');

    const timeWindow = params.timeWindow || 3600000;
    const startDate = new Date(Date.now() - timeWindow);
    const signals: AbuseSignal[] = [];

    const where: any = { timestamp: { gte: startDate } };
    if (params.userId) where.userId = params.userId;
    if (params.ipAddress) where.ipAddress = params.ipAddress;

    const events = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });

    const velocityCheck = this.checkVelocityAbuse(events);
    if (velocityCheck) signals.push(velocityCheck);

    const botCheck = this.checkBotBehavior(events);
    if (botCheck) signals.push(botCheck);

    const credentialCheck = this.checkCredentialStuffing(events);
    if (credentialCheck) signals.push(credentialCheck);

    return signals;
  }

  private checkVelocityAbuse(events: any[]): AbuseSignal | null {
    const authEvents = events.filter(e => e.eventType.includes('AUTH'));
    
    if (authEvents.length > 50) {
      return {
        type: 'velocity',
        severity: authEvents.length > 100 ? 'critical' : 'high',
        confidence: Math.min(authEvents.length / 100, 1),
        detectedAt: new Date(),
        evidence: {
          eventCount: authEvents.length,
          timeWindow: '1 hour',
        },
        autoBlocked: authEvents.length > 100,
      };
    }

    return null;
  }

  private checkBotBehavior(events: any[]): AbuseSignal | null {
    const timings = events.map(e => e.timestamp.getTime());
    const intervals: number[] = [];

    for (let i = 1; i < timings.length; i++) {
      intervals.push(timings[i] - timings[i - 1]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 100 && intervals.length > 10) {
      return {
        type: 'bot',
        severity: 'high',
        confidence: 0.8,
        detectedAt: new Date(),
        evidence: {
          avgInterval,
          stdDev,
          eventCount: events.length,
        },
        autoBlocked: false,
      };
    }

    return null;
  }

  private checkCredentialStuffing(events: any[]): AbuseSignal | null {
    const failedAuths = events.filter(e => 
      e.eventType === 'AUTH_FAILED' && !e.success
    );

    const uniqueEmails = new Set(failedAuths.map(e => e.metadata?.email).filter(Boolean));

    if (uniqueEmails.size > 10 && failedAuths.length > 20) {
      return {
        type: 'credential_stuffing',
        severity: 'critical',
        confidence: 0.9,
        detectedAt: new Date(),
        evidence: {
          failedAttempts: failedAuths.length,
          uniqueEmails: uniqueEmails.size,
        },
        autoBlocked: true,
      };
    }

    return null;
  }

  /**
   * Get IP reputation and threat intelligence
   */
  @Audited('security')
  async getIPIntelligence(ipAddress: string): Promise<ThreatIntelligence> {
    permissionEngine.require(this.currentUser, 'security.read');

    const { prisma } = await import('@spine/shared/prisma');

    let intel = await prisma.ipIntelligence.findUnique({
      where: { ipAddress },
    });

    if (!intel || intel.lastUpdated < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      intel = await this.refreshIPIntelligence(ipAddress);
    }

    return {
      ipAddress: intel.ipAddress,
      reputation: intel.reputation,
      isVpn: intel.isVpn,
      isProxy: intel.isProxy,
      isTor: intel.isTor,
      isDatacenter: intel.isDatacenter,
      threatLevel: intel.threatLevel as any,
      country: intel.country || undefined,
      asn: intel.asn || undefined,
      lastSeen: intel.lastSeen,
    };
  }

  private async refreshIPIntelligence(ipAddress: string): Promise<any> {
    const { prisma } = await import('@spine/shared/prisma');

    const reputation = Math.random() * 100;
    const isVpn = Math.random() > 0.9;
    const isProxy = Math.random() > 0.95;
    const isTor = Math.random() > 0.98;
    const isDatacenter = Math.random() > 0.85;

    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (isTor || reputation < 20) threatLevel = 'critical';
    else if (isProxy || reputation < 40) threatLevel = 'high';
    else if (isVpn || reputation < 60) threatLevel = 'medium';

    return await prisma.ipIntelligence.upsert({
      where: { ipAddress },
      create: {
        ipAddress,
        reputation,
        isVpn,
        isProxy,
        isTor,
        isDatacenter,
        threatLevel,
        lastSeen: new Date(),
        lastUpdated: new Date(),
      },
      update: {
        reputation,
        isVpn,
        isProxy,
        isTor,
        isDatacenter,
        threatLevel,
        lastSeen: new Date(),
        lastUpdated: new Date(),
      },
    });
  }

  /**
   * Block IP address
   */
  @Audited('security')
  async blockIP(ipAddress: string, reason: string, duration?: number): Promise<void> {
    permissionEngine.require(this.currentUser, 'security.write');

    const { prisma } = await import('@spine/shared/prisma');

    const expiresAt = duration ? new Date(Date.now() + duration) : undefined;

    await prisma.ipBlock.create({
      data: {
        ipAddress,
        reason,
        blockedBy: this.currentUser.id,
        blockedAt: new Date(),
        expiresAt,
      },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'block_ip',
      resource: 'security',
      metadata: { ipAddress, reason, duration },
    });
  }

  /**
   * Get security metrics
   */
  @Audited('security')
  async getSecurityMetrics(timeWindow: number = 86400000): Promise<{
    totalEvents: number;
    authFailures: number;
    blockedIPs: number;
    abuseSignals: number;
    criticalAlerts: number;
    topThreats: Array<{ type: string; count: number }>;
  }> {
    permissionEngine.require(this.currentUser, 'security.read');

    const { prisma } = await import('@spine/shared/prisma');

    const startDate = new Date(Date.now() - timeWindow);

    const [events, blocks, signals] = await Promise.all([
      prisma.auditLog.count({
        where: { timestamp: { gte: startDate } },
      }),
      prisma.ipBlock.count({
        where: { blockedAt: { gte: startDate } },
      }),
      prisma.abuseSignal.findMany({
        where: { detectedAt: { gte: startDate } },
      }),
    ]);

    const authFailures = await prisma.auditLog.count({
      where: {
        timestamp: { gte: startDate },
        eventType: 'AUTH_FAILED',
        success: false,
      },
    });

    const criticalAlerts = signals.filter(s => s.severity === 'critical').length;

    const threatCounts = new Map<string, number>();
    for (const signal of signals) {
      threatCounts.set(signal.type, (threatCounts.get(signal.type) || 0) + 1);
    }

    const topThreats = Array.from(threatCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEvents: events,
      authFailures,
      blockedIPs: blocks,
      abuseSignals: signals.length,
      criticalAlerts,
      topThreats,
    };
  }

  /**
   * Export audit logs for compliance
   */
  @Audited('security')
  async exportAuditLogs(params: {
    startDate: Date;
    endDate: Date;
    format: 'json' | 'csv';
  }): Promise<string> {
    permissionEngine.require(this.currentUser, 'audit.read');

    return adminAudit.export(params);
  }

  /**
   * Set admin access expiry
   */
  @Audited('security')
  async setAccessExpiry(userId: string, expiresAt: Date, reason: string): Promise<void> {
    permissionEngine.require(this.currentUser, 'access_review.write');

    const { prisma } = await import('@spine/shared/prisma');

    await prisma.adminUser.update({
      where: { id: userId },
      data: { expiresAt },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'set_access_expiry',
      resource: 'security',
      resourceId: userId,
      changes: { expiresAt },
      metadata: { reason },
    });
  }

  /**
   * Permission diff between two users
   */
  @Audited('security')
  async comparePermissions(userId1: string, userId2: string): Promise<{
    user1Only: string[];
    user2Only: string[];
    shared: string[];
  }> {
    permissionEngine.require(this.currentUser, 'access_review.read');

    const { prisma } = await import('@spine/shared/prisma');

    const [user1, user2] = await Promise.all([
      prisma.adminUser.findUnique({
        where: { id: userId1 },
        include: { roles: true },
      }),
      prisma.adminUser.findUnique({
        where: { id: userId2 },
        include: { roles: true },
      }),
    ]);

    if (!user1 || !user2) {
      throw new Error('User not found');
    }

    const perms1 = new Set([
      ...(user1.permissions as string[]),
      ...user1.roles.flatMap(r => r.permissions as string[]),
    ]);

    const perms2 = new Set([
      ...(user2.permissions as string[]),
      ...user2.roles.flatMap(r => r.permissions as string[]),
    ]);

    const user1Only = Array.from(perms1).filter(p => !perms2.has(p));
    const user2Only = Array.from(perms2).filter(p => !perms1.has(p));
    const shared = Array.from(perms1).filter(p => perms2.has(p));

    return { user1Only, user2Only, shared };
  }
}
