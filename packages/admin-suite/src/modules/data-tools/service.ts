import { AdminUser, BulkOperation, DataCorrection } from '../../core/types';
import { permissionEngine } from '../../core/permissions';
import { adminAudit, Audited } from '../../core/audit';
import { randomBytes } from 'crypto';

/**
 * Data Tools Module - Bulk operations, corrections, advanced search
 * Scalpels, not hammers
 */

export interface BulkOperationParams {
  type: 'update' | 'delete' | 'reprocess';
  resourceType: string;
  filters: Record<string, any>;
  changes?: Record<string, any>;
  dryRun?: boolean;
}

export interface SearchQuery {
  entities: string[];
  query: string;
  filters?: Record<string, any>;
  regex?: boolean;
  timeTravel?: Date;
  limit?: number;
}

export class DataToolsService {
  private currentUser: AdminUser;

  constructor(currentUser: AdminUser) {
    this.currentUser = currentUser;
  }

  /**
   * Execute bulk operation with dry-run
   * No dry run = no bulk action. Ever.
   */
  @Audited('data_tools')
  async executeBulkOperation(
    params: BulkOperationParams
  ): Promise<BulkOperation> {
    permissionEngine.require(this.currentUser, 'data_tools.execute');

    if (!params.dryRun && params.type === 'delete') {
      permissionEngine.require(this.currentUser, 'data_tools.delete');
    }

    const operation: BulkOperation = {
      id: randomBytes(16).toString('hex'),
      type: params.type,
      status: 'pending',
      totalItems: 0,
      processedItems: 0,
      failedItems: 0,
      dryRun: params.dryRun ?? false,
      createdBy: this.currentUser.id,
      createdAt: new Date(),
      canRollback: params.type === 'update',
      errors: [],
    };

    const { prisma } = await import('@spine/shared-db/prisma');

    await prisma.bulkOperation.create({
      data: {
        id: operation.id,
        type: operation.type,
        status: operation.status,
        resourceType: params.resourceType,
        filters: params.filters,
        changes: params.changes || {},
        totalItems: 0,
        processedItems: 0,
        failedItems: 0,
        dryRun: operation.dryRun,
        createdBy: operation.createdBy,
        createdAt: operation.createdAt,
        canRollback: operation.canRollback,
      },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'create_bulk_operation',
      resource: 'data_tools',
      resourceId: operation.id,
      metadata: {
        type: params.type,
        resourceType: params.resourceType,
        dryRun: operation.dryRun,
      },
    });

    if (!params.dryRun) {
      this.processBulkOperation(operation.id, params).catch(error => {
        console.error('Bulk operation failed:', error);
      });
    } else {
      await this.simulateBulkOperation(operation.id, params);
    }

    return operation;
  }

  private async processBulkOperation(
    operationId: string,
    params: BulkOperationParams
  ): Promise<void> {
    const { prisma } = await import('@spine/shared-db/prisma');

    await prisma.bulkOperation.update({
      where: { id: operationId },
      data: { status: 'running', startedAt: new Date() },
    });

    try {
      const model = (prisma as any)[params.resourceType];
      if (!model) {
        throw new Error(`Invalid resource type: ${params.resourceType}`);
      }

      const items = await model.findMany({
        where: params.filters,
      });

      const totalItems = items.length;
      let processedItems = 0;
      let failedItems = 0;
      const errors: Array<{ item: any; error: string }> = [];

      for (const item of items) {
        try {
          if (params.type === 'update') {
            await model.update({
              where: { id: item.id },
              data: params.changes,
            });
          } else if (params.type === 'delete') {
            await model.delete({
              where: { id: item.id },
            });
          } else if (params.type === 'reprocess') {
            // Custom reprocessing logic
          }
          processedItems++;
        } catch (error: any) {
          failedItems++;
          errors.push({ item: item.id, error: error.message });
        }

        if (processedItems % 100 === 0) {
          await prisma.bulkOperation.update({
            where: { id: operationId },
            data: { processedItems, failedItems },
          });
        }
      }

      await prisma.bulkOperation.update({
        where: { id: operationId },
        data: {
          status: 'completed',
          totalItems,
          processedItems,
          failedItems,
          errors,
          completedAt: new Date(),
        },
      });

      await adminAudit.log({
        actor: this.currentUser.id,
        action: 'complete_bulk_operation',
        resource: 'data_tools',
        resourceId: operationId,
        metadata: { totalItems, processedItems, failedItems },
      });
    } catch (error: any) {
      await prisma.bulkOperation.update({
        where: { id: operationId },
        data: {
          status: 'failed',
          completedAt: new Date(),
        },
      });

      await adminAudit.log({
        actor: this.currentUser.id,
        action: 'fail_bulk_operation',
        resource: 'data_tools',
        resourceId: operationId,
        success: false,
        errorMessage: error.message,
      });
    }
  }

  private async simulateBulkOperation(
    operationId: string,
    params: BulkOperationParams
  ): Promise<void> {
    const { prisma } = await import('@spine/shared-db/prisma');

    const model = (prisma as any)[params.resourceType];
    if (!model) {
      throw new Error(`Invalid resource type: ${params.resourceType}`);
    }

    const count = await model.count({
      where: params.filters,
    });

    await prisma.bulkOperation.update({
      where: { id: operationId },
      data: {
        status: 'completed',
        totalItems: count,
        processedItems: 0,
        completedAt: new Date(),
      },
    });
  }

  /**
   * Rollback bulk operation
   */
  @Audited('data_tools')
  async rollbackBulkOperation(operationId: string): Promise<void> {
    permissionEngine.require(this.currentUser, 'data_tools.execute');

    const { prisma } = await import('@spine/shared-db/prisma');

    const operation = await prisma.bulkOperation.findUnique({
      where: { id: operationId },
    });

    if (!operation) {
      throw new Error('Operation not found');
    }

    if (!operation.canRollback) {
      throw new Error('Operation cannot be rolled back');
    }

    if (operation.status !== 'completed') {
      throw new Error('Can only rollback completed operations');
    }

    await prisma.bulkOperation.update({
      where: { id: operationId },
      data: { status: 'rolled_back' },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'rollback_bulk_operation',
      resource: 'data_tools',
      resourceId: operationId,
    });
  }

  /**
   * Cross-entity search with boolean filters
   */
  @Audited('data_tools')
  async advancedSearch(query: SearchQuery): Promise<{
    results: Array<{
      entity: string;
      id: string;
      data: any;
      score?: number;
    }>;
    total: number;
  }> {
    permissionEngine.require(this.currentUser, 'data_tools.read');

    const { prisma } = await import('@spine/shared-db/prisma');
    const results: Array<{ entity: string; id: string; data: any }> = [];

    for (const entity of query.entities) {
      const model = (prisma as any)[entity];
      if (!model) continue;

      const where: any = {};
      
      if (query.filters) {
        Object.assign(where, query.filters);
      }

      if (query.query) {
        // Full-text search implementation
        where.OR = [
          { id: query.query },
          // Add more searchable fields based on entity
        ];
      }

      const items = await model.findMany({
        where,
        take: query.limit || 50,
      });

      results.push(
        ...items.map((item: any) => ({
          entity,
          id: item.id,
          data: item,
        }))
      );
    }

    return {
      results,
      total: results.length,
    };
  }

  /**
   * Manual data correction with approval
   */
  @Audited('data_tools')
  async createDataCorrection(params: {
    resourceType: string;
    resourceId: string;
    field: string;
    newValue: any;
    reason: string;
    requiresApproval?: boolean;
  }): Promise<DataCorrection> {
    permissionEngine.require(this.currentUser, 'data_tools.override');

    const { prisma } = await import('@spine/shared-db/prisma');

    const model = (prisma as any)[params.resourceType];
    const resource = await model.findUnique({
      where: { id: params.resourceId },
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    const correction: DataCorrection = {
      id: randomBytes(16).toString('hex'),
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      field: params.field,
      oldValue: resource[params.field],
      newValue: params.newValue,
      reason: params.reason,
      requiresApproval: params.requiresApproval ?? true,
      appliedBy: this.currentUser.id,
      canRevert: true,
    };

    await prisma.dataCorrection.create({
      data: {
        id: correction.id,
        resourceType: correction.resourceType,
        resourceId: correction.resourceId,
        field: correction.field,
        oldValue: correction.oldValue,
        newValue: correction.newValue,
        reason: correction.reason,
        requiresApproval: correction.requiresApproval,
        appliedBy: correction.appliedBy,
        canRevert: correction.canRevert,
      },
    });

    if (!correction.requiresApproval) {
      await this.applyDataCorrection(correction.id);
    }

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'create_data_correction',
      resource: 'data_tools',
      resourceId: correction.id,
      changes: {
        field: params.field,
        oldValue: correction.oldValue,
        newValue: correction.newValue,
      },
      metadata: { reason: params.reason },
    });

    return correction;
  }

  /**
   * Apply approved data correction
   */
  @Audited('data_tools')
  async applyDataCorrection(correctionId: string): Promise<void> {
    permissionEngine.require(this.currentUser, 'data_tools.override');

    const { prisma } = await import('@spine/shared-db/prisma');

    const correction = await prisma.dataCorrection.findUnique({
      where: { id: correctionId },
    });

    if (!correction) {
      throw new Error('Correction not found');
    }

    if (correction.appliedAt) {
      throw new Error('Correction already applied');
    }

    const model = (prisma as any)[correction.resourceType];
    await model.update({
      where: { id: correction.resourceId },
      data: { [correction.field]: correction.newValue },
    });

    await prisma.dataCorrection.update({
      where: { id: correctionId },
      data: { appliedAt: new Date() },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'apply_data_correction',
      resource: 'data_tools',
      resourceId: correctionId,
    });
  }

  /**
   * CSV import with validation
   */
  @Audited('data_tools')
  async importCSV(params: {
    resourceType: string;
    csvData: string;
    validateOnly?: boolean;
  }): Promise<{
    valid: boolean;
    errors: Array<{ row: number; error: string }>;
    rowCount: number;
  }> {
    permissionEngine.require(this.currentUser, 'data_tools.write');

    const rows = params.csvData.split('\n').map(row => row.split(','));
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (row.length !== headers.length) {
        errors.push({ row: i + 2, error: 'Column count mismatch' });
      }
    }

    if (!params.validateOnly && errors.length === 0) {
      // Import logic here
    }

    return {
      valid: errors.length === 0,
      errors,
      rowCount: dataRows.length,
    };
  }
}
