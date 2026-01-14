import { AdminUser, ModerationFlag } from '../../core/types';
import { permissionEngine } from '../../core/permissions';
import { adminAudit, Audited } from '../../core/audit';
import { randomBytes } from 'crypto';

/**
 * Moderation Module - Content lifecycle, flags, pattern detection
 * Blind moderation destroys platforms. Context is mandatory.
 */

export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  content: any;
  createdAt: Date;
  createdBy: string;
}

export interface ModerationAction {
  id: string;
  flagId: string;
  action: 'hide' | 'shadow_hide' | 'freeze' | 'delete' | 'restore' | 'dismiss';
  reason: string;
  performedBy: string;
  performedAt: Date;
  reversible: boolean;
}

export interface PatternDetection {
  type: 'repeat_offender' | 'brigade' | 'spam_wave' | 'coordinated_attack';
  confidence: number;
  affectedUsers: string[];
  affectedContent: string[];
  detectedAt: Date;
  metadata?: Record<string, any>;
}

export class ModerationService {
  private currentUser: AdminUser;

  constructor(currentUser: AdminUser) {
    this.currentUser = currentUser;
  }

  /**
   * Get moderation queue with priority scoring
   */
  @Audited('moderation')
  async getModerationQueue(filter: {
    status?: ModerationFlag['status'];
    severity?: ModerationFlag['severity'];
    assignedTo?: string;
    overdueSLA?: boolean;
    limit?: number;
  }): Promise<{
    flags: ModerationFlag[];
    total: number;
    overdueSLA: number;
  }> {
    permissionEngine.require(this.currentUser, 'moderation.read');

    const { prisma } = await import('@spine/shared/prisma');

    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.severity) where.severity = filter.severity;
    if (filter.assignedTo) where.assignedTo = filter.assignedTo;
    
    if (filter.overdueSLA) {
      where.slaDeadline = { lt: new Date() };
      where.status = { in: ['pending', 'reviewing'] };
    }

    const [flags, total, overdue] = await Promise.all([
      prisma.moderationFlag.findMany({
        where,
        orderBy: [
          { severity: 'desc' },
          { createdAt: 'asc' },
        ],
        take: filter.limit || 50,
      }),
      prisma.moderationFlag.count({ where }),
      prisma.moderationFlag.count({
        where: {
          slaDeadline: { lt: new Date() },
          status: { in: ['pending', 'reviewing'] },
        },
      }),
    ]);

    return {
      flags: flags.map(f => ({
        id: f.id,
        resourceType: f.resourceType,
        resourceId: f.resourceId,
        flagType: f.flagType,
        severity: f.severity as any,
        status: f.status as any,
        reporter: f.reporter || undefined,
        assignedTo: f.assignedTo || undefined,
        context: (f.context as any) || undefined,
        createdAt: f.createdAt,
        resolvedAt: f.resolvedAt || undefined,
        resolution: f.resolution || undefined,
        slaDeadline: f.slaDeadline || undefined,
      })),
      total,
      overdueSLA: overdue,
    };
  }

  /**
   * Get flag with full context - no blind moderation
   */
  @Audited('moderation')
  async getFlagContext(flagId: string): Promise<{
    flag: ModerationFlag;
    content: any;
    contentHistory: ContentVersion[];
    relatedFlags: ModerationFlag[];
    userHistory: {
      totalFlags: number;
      resolvedFlags: number;
      activeFlags: number;
      recentActions: ModerationAction[];
    };
  }> {
    permissionEngine.require(this.currentUser, 'moderation.read');

    const { prisma } = await import('@spine/shared/prisma');

    const flag = await prisma.moderationFlag.findUnique({
      where: { id: flagId },
    });

    if (!flag) {
      throw new Error('Flag not found');
    }

    const [content, contentHistory, relatedFlags, userFlags, recentActions] = await Promise.all([
      (prisma as any)[flag.resourceType].findUnique({
        where: { id: flag.resourceId },
      }),
      prisma.contentVersion.findMany({
        where: { contentId: flag.resourceId },
        orderBy: { version: 'desc' },
        take: 10,
      }),
      prisma.moderationFlag.findMany({
        where: {
          resourceId: flag.resourceId,
          id: { not: flagId },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.moderationFlag.groupBy({
        by: ['status'],
        where: {
          reporter: flag.reporter || undefined,
        },
        _count: true,
      }),
      prisma.moderationAction.findMany({
        where: {
          flag: {
            reporter: flag.reporter || undefined,
          },
        },
        orderBy: { performedAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalFlags = userFlags.reduce((sum, g) => sum + g._count, 0);
    const resolvedFlags = userFlags.find(g => g.status === 'resolved')?._count || 0;
    const activeFlags = userFlags.find(g => g.status === 'pending')?._count || 0;

    return {
      flag: {
        id: flag.id,
        resourceType: flag.resourceType,
        resourceId: flag.resourceId,
        flagType: flag.flagType,
        severity: flag.severity as any,
        status: flag.status as any,
        reporter: flag.reporter || undefined,
        assignedTo: flag.assignedTo || undefined,
        context: (flag.context as any) || undefined,
        createdAt: flag.createdAt,
        resolvedAt: flag.resolvedAt || undefined,
        resolution: flag.resolution || undefined,
        slaDeadline: flag.slaDeadline || undefined,
      },
      content,
      contentHistory: contentHistory.map(v => ({
        id: v.id,
        contentId: v.contentId,
        version: v.version,
        content: v.content,
        createdAt: v.createdAt,
        createdBy: v.createdBy,
      })),
      relatedFlags: relatedFlags.map(f => ({
        id: f.id,
        resourceType: f.resourceType,
        resourceId: f.resourceId,
        flagType: f.flagType,
        severity: f.severity as any,
        status: f.status as any,
        createdAt: f.createdAt,
      })) as ModerationFlag[],
      userHistory: {
        totalFlags,
        resolvedFlags,
        activeFlags,
        recentActions: recentActions.map(a => ({
          id: a.id,
          flagId: a.flagId,
          action: a.action as any,
          reason: a.reason,
          performedBy: a.performedBy,
          performedAt: a.performedAt,
          reversible: a.reversible,
        })),
      },
    };
  }

  /**
   * Perform moderation action
   */
  @Audited('moderation')
  async performAction(params: {
    flagId: string;
    action: ModerationAction['action'];
    reason: string;
  }): Promise<ModerationAction> {
    permissionEngine.require(this.currentUser, 'moderation.write');

    if (!params.reason || params.reason.length < 10) {
      throw new Error('Moderation action requires detailed reason (min 10 chars)');
    }

    const { prisma } = await import('@spine/shared/prisma');

    const flag = await prisma.moderationFlag.findUnique({
      where: { id: params.flagId },
    });

    if (!flag) {
      throw new Error('Flag not found');
    }

    const action: ModerationAction = {
      id: randomBytes(16).toString('hex'),
      flagId: params.flagId,
      action: params.action,
      reason: params.reason,
      performedBy: this.currentUser.id,
      performedAt: new Date(),
      reversible: ['hide', 'shadow_hide', 'freeze'].includes(params.action),
    };

    await prisma.moderationAction.create({
      data: {
        id: action.id,
        flagId: action.flagId,
        action: action.action,
        reason: action.reason,
        performedBy: action.performedBy,
        performedAt: action.performedAt,
        reversible: action.reversible,
      },
    });

    if (params.action === 'dismiss') {
      await prisma.moderationFlag.update({
        where: { id: params.flagId },
        data: {
          status: 'dismissed',
          resolvedAt: new Date(),
          resolution: params.reason,
        },
      });
    } else {
      await prisma.moderationFlag.update({
        where: { id: params.flagId },
        data: {
          status: 'resolved',
          resolvedAt: new Date(),
          resolution: `${params.action}: ${params.reason}`,
        },
      });

      await this.applyContentAction(flag.resourceType, flag.resourceId, params.action);
    }

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'moderation_action',
      resource: 'moderation',
      resourceId: params.flagId,
      changes: { action: params.action },
      metadata: { reason: params.reason, resourceType: flag.resourceType },
    });

    return action;
  }

  private async applyContentAction(
    resourceType: string,
    resourceId: string,
    action: ModerationAction['action']
  ): Promise<void> {
    const { prisma } = await import('@spine/shared/prisma');
    const model = (prisma as any)[resourceType];

    switch (action) {
      case 'hide':
        await model.update({
          where: { id: resourceId },
          data: { hidden: true, hiddenAt: new Date() },
        });
        break;
      case 'shadow_hide':
        await model.update({
          where: { id: resourceId },
          data: { shadowHidden: true, shadowHiddenAt: new Date() },
        });
        break;
      case 'freeze':
        await model.update({
          where: { id: resourceId },
          data: { frozen: true, frozenAt: new Date() },
        });
        break;
      case 'delete':
        await model.update({
          where: { id: resourceId },
          data: { deleted: true, deletedAt: new Date() },
        });
        break;
      case 'restore':
        await model.update({
          where: { id: resourceId },
          data: {
            hidden: false,
            shadowHidden: false,
            frozen: false,
            deleted: false,
          },
        });
        break;
    }
  }

  /**
   * Detect patterns - repeat offenders, brigades
   */
  @Audited('moderation')
  async detectPatterns(timeWindow: number = 86400000): Promise<PatternDetection[]> {
    permissionEngine.require(this.currentUser, 'moderation.read');

    const { prisma } = await import('@spine/shared/prisma');

    const startDate = new Date(Date.now() - timeWindow);
    const patterns: PatternDetection[] = [];

    const flags = await prisma.moderationFlag.findMany({
      where: {
        createdAt: { gte: startDate },
      },
    });

    const userFlagCounts = new Map<string, number>();
    const contentFlagCounts = new Map<string, number>();

    for (const flag of flags) {
      if (flag.reporter) {
        userFlagCounts.set(flag.reporter, (userFlagCounts.get(flag.reporter) || 0) + 1);
      }
      contentFlagCounts.set(flag.resourceId, (contentFlagCounts.get(flag.resourceId) || 0) + 1);
    }

    for (const [userId, count] of userFlagCounts.entries()) {
      if (count >= 5) {
        patterns.push({
          type: 'repeat_offender',
          confidence: Math.min(count / 10, 1),
          affectedUsers: [userId],
          affectedContent: [],
          detectedAt: new Date(),
          metadata: { flagCount: count },
        });
      }
    }

    for (const [contentId, count] of contentFlagCounts.entries()) {
      if (count >= 10) {
        patterns.push({
          type: 'brigade',
          confidence: Math.min(count / 20, 1),
          affectedUsers: [],
          affectedContent: [contentId],
          detectedAt: new Date(),
          metadata: { flagCount: count },
        });
      }
    }

    return patterns;
  }

  /**
   * Assign flag to moderator
   */
  @Audited('moderation')
  async assignFlag(flagId: string, moderatorId: string): Promise<void> {
    permissionEngine.require(this.currentUser, 'moderation.write');

    const { prisma } = await import('@spine/shared/prisma');

    await prisma.moderationFlag.update({
      where: { id: flagId },
      data: {
        assignedTo: moderatorId,
        status: 'reviewing',
      },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'assign_flag',
      resource: 'moderation',
      resourceId: flagId,
      changes: { assignedTo: moderatorId },
    });
  }

  /**
   * Get content version history
   */
  @Audited('moderation')
  async getContentHistory(contentId: string): Promise<ContentVersion[]> {
    permissionEngine.require(this.currentUser, 'moderation.read');

    const { prisma } = await import('@spine/shared/prisma');

    const versions = await prisma.contentVersion.findMany({
      where: { contentId },
      orderBy: { version: 'desc' },
    });

    return versions.map(v => ({
      id: v.id,
      contentId: v.contentId,
      version: v.version,
      content: v.content,
      createdAt: v.createdAt,
      createdBy: v.createdBy,
    }));
  }
}
