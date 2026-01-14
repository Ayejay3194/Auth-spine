import { AdminUser, ConfigEntry } from '../../core/types';
import { permissionEngine } from '../../core/permissions';
import { adminAudit, Audited } from '../../core/audit';

/**
 * Config Module - Registry, migrations, schema management
 * If configs aren't versioned, you're guessing
 */

export interface MigrationStatus {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  appliedAt?: Date;
  rolledBackAt?: Date;
  duration?: number;
  error?: string;
  canRollback: boolean;
}

export interface SchemaIntegrityCheck {
  table: string;
  status: 'healthy' | 'warning' | 'critical';
  issues: Array<{
    type: 'missing_index' | 'orphaned_record' | 'constraint_violation' | 'data_corruption';
    severity: 'low' | 'medium' | 'high';
    description: string;
    affectedRows?: number;
  }>;
}

export class ConfigService {
  private currentUser: AdminUser;

  constructor(currentUser: AdminUser) {
    this.currentUser = currentUser;
  }

  /**
   * Get config value
   */
  @Audited('config')
  async getConfig(key: string, environment?: string): Promise<ConfigEntry | null> {
    permissionEngine.require(this.currentUser, 'config.read');

    const { prisma } = await import('@spine/shared/prisma');

    const env = environment || process.env.NODE_ENV || 'production';

    const config = await prisma.configEntry.findFirst({
      where: { key, environment: env },
      orderBy: { version: 'desc' },
    });

    if (!config) return null;

    return {
      key: config.key,
      value: config.value,
      environment: config.environment,
      version: config.version,
      previousValue: config.previousValue || undefined,
      changedBy: config.changedBy,
      changedAt: config.changedAt,
      description: config.description || undefined,
      canRollback: config.version > 1,
    };
  }

  /**
   * Set config value with versioning
   */
  @Audited('config')
  async setConfig(params: {
    key: string;
    value: any;
    environment: string;
    description?: string;
  }): Promise<ConfigEntry> {
    permissionEngine.require(this.currentUser, 'config.write');

    const { prisma } = await import('@spine/shared/prisma');

    const current = await this.getConfig(params.key, params.environment);
    const version = current ? current.version + 1 : 1;

    const config = await prisma.configEntry.create({
      data: {
        key: params.key,
        value: params.value,
        environment: params.environment,
        version,
        previousValue: current?.value,
        changedBy: this.currentUser.id,
        changedAt: new Date(),
        description: params.description,
      },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'set_config',
      resource: 'config',
      resourceId: params.key,
      changes: {
        oldValue: current?.value,
        newValue: params.value,
        version,
      },
      metadata: {
        environment: params.environment,
        description: params.description,
      },
    });

    return {
      key: config.key,
      value: config.value,
      environment: config.environment,
      version: config.version,
      previousValue: config.previousValue || undefined,
      changedBy: config.changedBy,
      changedAt: config.changedAt,
      description: config.description || undefined,
      canRollback: true,
    };
  }

  /**
   * Rollback config to previous version
   */
  @Audited('config')
  async rollbackConfig(key: string, environment: string): Promise<ConfigEntry> {
    permissionEngine.require(this.currentUser, 'config.write');

    const { prisma } = await import('@spine/shared/prisma');

    const current = await this.getConfig(key, environment);
    if (!current || !current.canRollback) {
      throw new Error('Cannot rollback config');
    }

    const previous = await prisma.configEntry.findFirst({
      where: {
        key,
        environment,
        version: current.version - 1,
      },
    });

    if (!previous) {
      throw new Error('Previous version not found');
    }

    const rolled = await this.setConfig({
      key,
      value: previous.value,
      environment,
      description: `Rolled back from version ${current.version}`,
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'rollback_config',
      resource: 'config',
      resourceId: key,
      changes: {
        fromVersion: current.version,
        toVersion: previous.version,
        value: previous.value,
      },
    });

    return rolled;
  }

  /**
   * Get config diff between versions
   */
  @Audited('config')
  async getConfigDiff(
    key: string,
    environment: string,
    version1: number,
    version2: number
  ): Promise<{
    key: string;
    version1: { version: number; value: any; changedAt: Date };
    version2: { version: number; value: any; changedAt: Date };
    diff: any;
  }> {
    permissionEngine.require(this.currentUser, 'config.read');

    const { prisma } = await import('@spine/shared/prisma');

    const [config1, config2] = await Promise.all([
      prisma.configEntry.findFirst({
        where: { key, environment, version: version1 },
      }),
      prisma.configEntry.findFirst({
        where: { key, environment, version: version2 },
      }),
    ]);

    if (!config1 || !config2) {
      throw new Error('Config version not found');
    }

    return {
      key,
      version1: {
        version: config1.version,
        value: config1.value,
        changedAt: config1.changedAt,
      },
      version2: {
        version: config2.version,
        value: config2.value,
        changedAt: config2.changedAt,
      },
      diff: this.calculateDiff(config1.value, config2.value),
    };
  }

  private calculateDiff(obj1: any, obj2: any): any {
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return { changed: obj1 !== obj2, from: obj1, to: obj2 };
    }

    const diff: any = {};
    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

    for (const key of allKeys) {
      if (obj1[key] !== obj2[key]) {
        diff[key] = { from: obj1[key], to: obj2[key] };
      }
    }

    return diff;
  }

  /**
   * Get migration status
   */
  @Audited('config')
  async getMigrationStatus(): Promise<MigrationStatus[]> {
    permissionEngine.require(this.currentUser, 'config.read');

    const { prisma } = await import('@spine/shared/prisma');

    const migrations = await prisma.migration.findMany({
      orderBy: { appliedAt: 'desc' },
    });

    return migrations.map(m => ({
      id: m.id,
      name: m.name,
      status: m.status as any,
      appliedAt: m.appliedAt || undefined,
      rolledBackAt: m.rolledBackAt || undefined,
      duration: m.duration || undefined,
      error: m.error || undefined,
      canRollback: m.canRollback,
    }));
  }

  /**
   * Rollback migration
   */
  @Audited('config')
  async rollbackMigration(migrationId: string): Promise<void> {
    permissionEngine.require(this.currentUser, 'config.write');

    const { prisma } = await import('@spine/shared/prisma');

    const migration = await prisma.migration.findUnique({
      where: { id: migrationId },
    });

    if (!migration) {
      throw new Error('Migration not found');
    }

    if (!migration.canRollback) {
      throw new Error('Migration cannot be rolled back');
    }

    if (migration.status !== 'completed') {
      throw new Error('Can only rollback completed migrations');
    }

    await prisma.migration.update({
      where: { id: migrationId },
      data: {
        status: 'rolled_back',
        rolledBackAt: new Date(),
      },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'rollback_migration',
      resource: 'config',
      resourceId: migrationId,
      metadata: { migrationName: migration.name },
    });
  }

  /**
   * Check schema integrity
   */
  @Audited('config')
  async checkSchemaIntegrity(): Promise<SchemaIntegrityCheck[]> {
    permissionEngine.require(this.currentUser, 'config.read');

    const { prisma } = await import('@spine/shared/prisma');

    const checks: SchemaIntegrityCheck[] = [];

    const tables = [
      'User',
      'Session',
      'Subscription',
      'Payment',
      'AuditLog',
      'AdminUser',
    ];

    for (const table of tables) {
      const issues: SchemaIntegrityCheck['issues'] = [];

      try {
        const model = (prisma as any)[table.toLowerCase()];
        if (!model) continue;

        const count = await model.count();

        if (count === 0 && table !== 'AuditLog') {
          issues.push({
            type: 'orphaned_record',
            severity: 'low',
            description: `Table ${table} is empty`,
          });
        }

        checks.push({
          table,
          status: issues.length === 0 ? 'healthy' : 'warning',
          issues,
        });
      } catch (error: any) {
        checks.push({
          table,
          status: 'critical',
          issues: [
            {
              type: 'data_corruption',
              severity: 'high',
              description: error.message,
            },
          ],
        });
      }
    }

    return checks;
  }

  /**
   * Get config change history
   */
  @Audited('config')
  async getConfigHistory(
    key: string,
    environment: string,
    limit: number = 20
  ): Promise<ConfigEntry[]> {
    permissionEngine.require(this.currentUser, 'config.read');

    const { prisma } = await import('@spine/shared/prisma');

    const configs = await prisma.configEntry.findMany({
      where: { key, environment },
      orderBy: { version: 'desc' },
      take: limit,
    });

    return configs.map(c => ({
      key: c.key,
      value: c.value,
      environment: c.environment,
      version: c.version,
      previousValue: c.previousValue || undefined,
      changedBy: c.changedBy,
      changedAt: c.changedAt,
      description: c.description || undefined,
      canRollback: c.version > 1,
    }));
  }

  /**
   * Get all configs for environment
   */
  @Audited('config')
  async getAllConfigs(environment?: string): Promise<ConfigEntry[]> {
    permissionEngine.require(this.currentUser, 'config.read');

    const { prisma } = await import('@spine/shared/prisma');

    const env = environment || process.env.NODE_ENV || 'production';

    const latestConfigs = await prisma.configEntry.findMany({
      where: { environment: env },
      orderBy: { key: 'asc' },
      distinct: ['key'],
    });

    return latestConfigs.map(c => ({
      key: c.key,
      value: c.value,
      environment: c.environment,
      version: c.version,
      previousValue: c.previousValue || undefined,
      changedBy: c.changedBy,
      changedAt: c.changedAt,
      description: c.description || undefined,
      canRollback: c.version > 1,
    }));
  }

  /**
   * Detect migration locks
   */
  @Audited('config')
  async detectMigrationLocks(): Promise<Array<{
    migrationId: string;
    lockedAt: Date;
    lockedBy: string;
    duration: number;
  }>> {
    permissionEngine.require(this.currentUser, 'config.read');

    const { prisma } = await import('@spine/shared/prisma');

    const locks = await prisma.migrationLock.findMany({
      where: {
        releasedAt: null,
      },
    });

    return locks.map(lock => ({
      migrationId: lock.migrationId,
      lockedAt: lock.lockedAt,
      lockedBy: lock.lockedBy,
      duration: Date.now() - lock.lockedAt.getTime(),
    }));
  }

  /**
   * Release migration lock
   */
  @Audited('config')
  async releaseMigrationLock(migrationId: string): Promise<void> {
    permissionEngine.require(this.currentUser, 'config.write');

    const { prisma } = await import('@spine/shared/prisma');

    await prisma.migrationLock.updateMany({
      where: { migrationId, releasedAt: null },
      data: { releasedAt: new Date() },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'release_migration_lock',
      resource: 'config',
      resourceId: migrationId,
    });
  }
}
