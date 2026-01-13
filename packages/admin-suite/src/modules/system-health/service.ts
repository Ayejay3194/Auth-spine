import { AdminUser, SystemJob, FeatureFlag } from '../../core/types';
import { permissionEngine } from '../../core/permissions';
import { adminAudit, Audited } from '../../core/audit';
import { randomBytes } from 'crypto';

/**
 * System Health Module - Monitoring, jobs, feature flags
 * If you can't kill a feature instantly, it's already too late
 */

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  lastCheck: Date;
  latency?: number;
  errorRate?: number;
  metadata?: Record<string, any>;
}

export interface QueueStatus {
  name: string;
  depth: number;
  processing: number;
  failed: number;
  avgProcessingTime: number;
  oldestItem?: Date;
}

export class SystemHealthService {
  private currentUser: AdminUser;

  constructor(currentUser: AdminUser) {
    this.currentUser = currentUser;
  }

  /**
   * Get live system status
   */
  @Audited('system_health')
  async getSystemStatus(): Promise<{
    services: ServiceStatus[];
    queues: QueueStatus[];
    overall: 'healthy' | 'degraded' | 'critical';
  }> {
    permissionEngine.require(this.currentUser, 'system_health.read');

    const { prisma } = await import('@spine/shared-db/prisma');

    const services = await prisma.serviceStatus.findMany({
      orderBy: { lastCheck: 'desc' },
    });

    const queues = await prisma.queueStatus.findMany();

    const serviceStatuses: ServiceStatus[] = services.map(s => ({
      name: s.name,
      status: s.status as any,
      uptime: s.uptime,
      lastCheck: s.lastCheck,
      latency: s.latency || undefined,
      errorRate: s.errorRate || undefined,
      metadata: (s.metadata as any) || undefined,
    }));

    const queueStatuses: QueueStatus[] = queues.map(q => ({
      name: q.name,
      depth: q.depth,
      processing: q.processing,
      failed: q.failed,
      avgProcessingTime: q.avgProcessingTime,
      oldestItem: q.oldestItem || undefined,
    }));

    const hasDown = serviceStatuses.some(s => s.status === 'down');
    const hasDegraded = serviceStatuses.some(s => s.status === 'degraded');
    const overall = hasDown ? 'critical' : hasDegraded ? 'degraded' : 'healthy';

    return {
      services: serviceStatuses,
      queues: queueStatuses,
      overall,
    };
  }

  /**
   * Get job details and control
   */
  @Audited('system_health')
  async getJobs(filter: {
    status?: SystemJob['status'];
    type?: string;
    limit?: number;
  }): Promise<SystemJob[]> {
    permissionEngine.require(this.currentUser, 'jobs.read');

    const { prisma } = await import('@spine/shared-db/prisma');

    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.type) where.type = filter.type;

    const jobs = await prisma.systemJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filter.limit || 100,
    });

    return jobs.map(j => ({
      id: j.id,
      name: j.name,
      type: j.type,
      status: j.status as any,
      priority: j.priority,
      attempts: j.attempts,
      maxAttempts: j.maxAttempts,
      progress: j.progress || undefined,
      result: j.result || undefined,
      error: j.error || undefined,
      createdAt: j.createdAt,
      startedAt: j.startedAt || undefined,
      completedAt: j.completedAt || undefined,
      canRetry: j.canRetry,
      canCancel: j.canCancel,
    }));
  }

  /**
   * Retry failed job
   */
  @Audited('system_health')
  async retryJob(jobId: string): Promise<void> {
    permissionEngine.require(this.currentUser, 'jobs.execute');

    const { prisma } = await import('@spine/shared-db/prisma');

    const job = await prisma.systemJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (!job.canRetry) {
      throw new Error('Job cannot be retried');
    }

    if (job.status !== 'failed') {
      throw new Error('Can only retry failed jobs');
    }

    await prisma.systemJob.update({
      where: { id: jobId },
      data: {
        status: 'queued',
        attempts: job.attempts + 1,
        error: null,
      },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'retry_job',
      resource: 'jobs',
      resourceId: jobId,
    });
  }

  /**
   * Cancel running job
   */
  @Audited('system_health')
  async cancelJob(jobId: string): Promise<void> {
    permissionEngine.require(this.currentUser, 'jobs.execute');

    const { prisma } = await import('@spine/shared-db/prisma');

    const job = await prisma.systemJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (!job.canCancel) {
      throw new Error('Job cannot be cancelled');
    }

    if (job.status === 'completed' || job.status === 'cancelled') {
      throw new Error('Job already completed or cancelled');
    }

    await prisma.systemJob.update({
      where: { id: jobId },
      data: {
        status: 'cancelled',
        completedAt: new Date(),
      },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'cancel_job',
      resource: 'jobs',
      resourceId: jobId,
    });
  }

  /**
   * Override job priority
   */
  @Audited('system_health')
  async setJobPriority(jobId: string, priority: number): Promise<void> {
    permissionEngine.require(this.currentUser, 'jobs.execute');

    const { prisma } = await import('@spine/shared-db/prisma');

    await prisma.systemJob.update({
      where: { id: jobId },
      data: { priority },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'set_job_priority',
      resource: 'jobs',
      resourceId: jobId,
      changes: { priority },
    });
  }

  /**
   * Get feature flags
   */
  @Audited('system_health')
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    permissionEngine.require(this.currentUser, 'feature_flags.read');

    const { prisma } = await import('@spine/shared-db/prisma');

    const flags = await prisma.featureFlag.findMany({
      orderBy: { name: 'asc' },
    });

    return flags.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description || undefined,
      enabled: f.enabled,
      scope: f.scope as any,
      scopeValue: f.scopeValue || undefined,
      isKillSwitch: f.isKillSwitch,
      createdBy: f.createdBy,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      updatedBy: f.updatedBy,
    }));
  }

  /**
   * Toggle feature flag - Big red button
   */
  @Audited('system_health')
  async toggleFeatureFlag(
    flagId: string,
    enabled: boolean,
    reason: string
  ): Promise<void> {
    permissionEngine.require(this.currentUser, 'feature_flags.write');

    if (!reason || reason.length < 10) {
      throw new Error('Flag toggle requires detailed reason (min 10 chars)');
    }

    const { prisma } = await import('@spine/shared-db/prisma');

    const flag = await prisma.featureFlag.findUnique({
      where: { id: flagId },
    });

    if (!flag) {
      throw new Error('Feature flag not found');
    }

    await prisma.featureFlag.update({
      where: { id: flagId },
      data: {
        enabled,
        updatedAt: new Date(),
        updatedBy: this.currentUser.id,
      },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'toggle_feature_flag',
      resource: 'feature_flags',
      resourceId: flagId,
      changes: { enabled, previousEnabled: flag.enabled },
      metadata: { reason, isKillSwitch: flag.isKillSwitch },
    });

    if (flag.isKillSwitch) {
      console.warn(`[KILL SWITCH] ${flag.name} set to ${enabled} by ${this.currentUser.id}`);
    }
  }

  /**
   * Create feature flag
   */
  @Audited('system_health')
  async createFeatureFlag(params: {
    name: string;
    description?: string;
    scope: FeatureFlag['scope'];
    scopeValue?: string | number;
    isKillSwitch?: boolean;
  }): Promise<FeatureFlag> {
    permissionEngine.require(this.currentUser, 'feature_flags.write');

    const { prisma } = await import('@spine/shared-db/prisma');

    const flag = await prisma.featureFlag.create({
      data: {
        id: randomBytes(16).toString('hex'),
        name: params.name,
        description: params.description,
        enabled: false,
        scope: params.scope,
        scopeValue: params.scopeValue?.toString(),
        isKillSwitch: params.isKillSwitch ?? false,
        createdBy: this.currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: this.currentUser.id,
      },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'create_feature_flag',
      resource: 'feature_flags',
      resourceId: flag.id,
      metadata: params,
    });

    return {
      id: flag.id,
      name: flag.name,
      description: flag.description || undefined,
      enabled: flag.enabled,
      scope: flag.scope as any,
      scopeValue: flag.scopeValue || undefined,
      isKillSwitch: flag.isKillSwitch,
      createdBy: flag.createdBy,
      createdAt: flag.createdAt,
      updatedAt: flag.updatedAt,
      updatedBy: flag.updatedBy,
    };
  }

  /**
   * Get error rates by endpoint
   */
  @Audited('system_health')
  async getErrorRates(timeWindow: number = 3600000): Promise<{
    endpoints: Array<{
      path: string;
      totalRequests: number;
      errorCount: number;
      errorRate: number;
      avgLatency: number;
    }>;
  }> {
    permissionEngine.require(this.currentUser, 'system_health.read');

    const { prisma } = await import('@spine/shared-db/prisma');

    const startDate = new Date(Date.now() - timeWindow);

    const requests = await prisma.apiRequest.findMany({
      where: {
        timestamp: { gte: startDate },
      },
    });

    const endpointStats = new Map<string, {
      total: number;
      errors: number;
      latencies: number[];
    }>();

    for (const req of requests) {
      const stats = endpointStats.get(req.path) || {
        total: 0,
        errors: 0,
        latencies: [],
      };

      stats.total++;
      if (req.statusCode >= 400) stats.errors++;
      if (req.latency) stats.latencies.push(req.latency);

      endpointStats.set(req.path, stats);
    }

    const endpoints = Array.from(endpointStats.entries()).map(([path, stats]) => ({
      path,
      totalRequests: stats.total,
      errorCount: stats.errors,
      errorRate: stats.errors / stats.total,
      avgLatency: stats.latencies.length > 0
        ? stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length
        : 0,
    }));

    return { endpoints: endpoints.sort((a, b) => b.errorRate - a.errorRate) };
  }

  /**
   * Get latency heatmap
   */
  @Audited('system_health')
  async getLatencyHeatmap(timeWindow: number = 3600000): Promise<{
    buckets: Array<{
      timestamp: number;
      p50: number;
      p95: number;
      p99: number;
    }>;
  }> {
    permissionEngine.require(this.currentUser, 'system_health.read');

    const { prisma } = await import('@spine/shared-db/prisma');

    const startDate = new Date(Date.now() - timeWindow);
    const bucketSize = 60000; // 1 minute buckets

    const requests = await prisma.apiRequest.findMany({
      where: {
        timestamp: { gte: startDate },
        latency: { not: null },
      },
      orderBy: { timestamp: 'asc' },
    });

    const buckets = new Map<number, number[]>();

    for (const req of requests) {
      const bucketKey = Math.floor(req.timestamp.getTime() / bucketSize) * bucketSize;
      const latencies = buckets.get(bucketKey) || [];
      latencies.push(req.latency!);
      buckets.set(bucketKey, latencies);
    }

    const result = Array.from(buckets.entries()).map(([timestamp, latencies]) => {
      latencies.sort((a, b) => a - b);
      const p50 = latencies[Math.floor(latencies.length * 0.5)];
      const p95 = latencies[Math.floor(latencies.length * 0.95)];
      const p99 = latencies[Math.floor(latencies.length * 0.99)];

      return { timestamp, p50, p95, p99 };
    });

    return { buckets: result };
  }
}
