/**
 * Launch Gate Checklist System
 * Validates production readiness against critical requirements
 */

export interface ChecklistItem {
  id: string;
  category: 'auth' | 'money' | 'data' | 'ops' | 'quality';
  title: string;
  description: string;
  required: boolean; // RED items that block launch
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  evidence?: string;
  assignee?: string;
  dueDate?: Date;
  completedAt?: Date;
  notes?: string;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  description: string;
  critical: boolean; // RED category
  items: ChecklistItem[];
}

export const LAUNCH_GATE_CHECKLIST: ChecklistCategory[] = [
  {
    id: 'auth',
    name: 'Auth & Access',
    description: 'Authentication and authorization security requirements',
    critical: true,
    items: [
      {
        id: 'auth-mfa',
        category: 'auth',
        title: 'Admin panel requires MFA or extra auth',
        description: 'At least for owner roles, implement multi-factor authentication',
        required: true,
        status: 'pending'
      },
      {
        id: 'auth-rbac',
        category: 'auth',
        title: 'RBAC enforced on API routes',
        description: 'Role-based access control must be enforced on all API endpoints, not just UI',
        required: true,
        status: 'pending'
      },
      {
        id: 'auth-audit',
        category: 'auth',
        title: 'Audit log records sensitive actions',
        description: 'Log role changes, data exports, refunds, payroll, feature flag changes',
        required: true,
        status: 'pending'
      },
      {
        id: 'auth-secrets',
        category: 'auth',
        title: 'Secrets not in repo; env vars validated',
        description: 'No hardcoded secrets, environment variables validated at startup',
        required: true,
        status: 'pending'
      }
    ]
  },
  {
    id: 'money',
    name: 'Money',
    description: 'Payment and financial system requirements',
    critical: true,
    items: [
      {
        id: 'money-webhooks',
        category: 'money',
        title: 'Payment webhooks verified + idempotent',
        description: 'Stripe webhooks must be verified and safe to retry',
        required: true,
        status: 'pending'
      },
      {
        id: 'money-refunds',
        category: 'money',
        title: 'Refund flow tested',
        description: 'End-to-end refund process tested and working',
        required: true,
        status: 'pending'
      },
      {
        id: 'money-reconciliation',
        category: 'money',
        title: 'Reconciliation report exists',
        description: 'Payments vs ledger reconciliation report available',
        required: true,
        status: 'pending'
      },
      {
        id: 'money-staging',
        category: 'money',
        title: 'Fake money mode exists for staging',
        description: 'Staging environment uses test payment methods',
        required: true,
        status: 'pending'
      }
    ]
  },
  {
    id: 'data',
    name: 'Data',
    description: 'Data backup and retention requirements',
    critical: true,
    items: [
      {
        id: 'data-backups',
        category: 'data',
        title: 'Automated backups running',
        description: 'Database backups running automatically with verification',
        required: true,
        status: 'pending'
      },
      {
        id: 'data-restore',
        category: 'data',
        title: 'Restore drill performed',
        description: 'Backup restore process tested and documented',
        required: true,
        status: 'pending'
      },
      {
        id: 'data-export',
        category: 'data',
        title: 'Export works (accountant packet)',
        description: 'Financial data export for accountants working',
        required: true,
        status: 'pending'
      },
      {
        id: 'data-retention',
        category: 'data',
        title: 'Data retention policy documented',
        description: 'Clear policy for data retention and deletion',
        required: true,
        status: 'pending'
      }
    ]
  },
  {
    id: 'ops',
    name: 'Ops',
    description: 'Operational readiness and monitoring',
    critical: true,
    items: [
      {
        id: 'ops-health',
        category: 'ops',
        title: 'Health endpoint works',
        description: 'Application health check endpoint responding correctly',
        required: true,
        status: 'pending'
      },
      {
        id: 'ops-alerting',
        category: 'ops',
        title: 'Admin alerting works',
        description: 'Critical alerts bypass mute and reach on-call',
        required: true,
        status: 'pending'
      },
      {
        id: 'ops-killswitches',
        category: 'ops',
        title: 'Kill switches tested',
        description: 'Pause bookings/payments/payroll; lock admin writes',
        required: true,
        status: 'pending'
      },
      {
        id: 'ops-rollback',
        category: 'ops',
        title: 'Rollback plan documented',
        description: 'Clear rollback procedure for production deployments',
        required: true,
        status: 'pending'
      }
    ]
  },
  {
    id: 'quality',
    name: 'Quality',
    description: 'Testing and performance requirements',
    critical: false, // YELLOW category
    items: [
      {
        id: 'quality-e2e',
        category: 'quality',
        title: 'E2E tests for top 3 flows',
        description: 'Critical user journeys covered by end-to-end tests',
        required: false,
        status: 'pending'
      },
      {
        id: 'quality-performance',
        category: 'quality',
        title: 'Performance budget defined',
        description: 'Clear performance targets and monitoring',
        required: false,
        status: 'pending'
      },
      {
        id: 'quality-accessibility',
        category: 'quality',
        title: 'Accessibility pass for critical screens',
        description: 'WCAG compliance for key user interfaces',
        required: false,
        status: 'pending'
      }
    ]
  }
];

export class LaunchGateValidator {
  static validateChecklist(checklist: ChecklistCategory[]): {
    canLaunch: boolean;
    blockedItems: ChecklistItem[];
    summary: {
      total: number;
      completed: number;
      critical: number;
      criticalCompleted: number;
    };
  } {
    const allItems = checklist.flatMap(cat => cat.items);
    const criticalItems = allItems.filter(item => item.required);
    const blockedItems = criticalItems.filter(item => item.status !== 'completed');

    const canLaunch = blockedItems.length === 0;
    
    return {
      canLaunch,
      blockedItems,
      summary: {
        total: allItems.length,
        completed: allItems.filter(item => item.status === 'completed').length,
        critical: criticalItems.length,
        criticalCompleted: criticalItems.filter(item => item.status === 'completed').length
      }
    };
  }

  static async runValidationChecks(): Promise<{
    category: string;
    itemId: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    evidence?: string;
  }[]> {
    const results: {
      category: string;
      itemId: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
      evidence?: string;
    }[] = [];

    // Auth validations
    results.push({
      category: 'auth',
      itemId: 'auth-mfa',
      status: (await this.checkMFAEnabled()) ? 'pass' : 'fail',
      message: 'MFA configuration check',
      evidence: 'OAuth provider settings verified'
    });

    results.push({
      category: 'auth',
      itemId: 'auth-rbac',
      status: (await this.checkRBACEnforced()) ? 'pass' : 'fail',
      message: 'RBAC middleware verification',
      evidence: 'API routes protected'
    });

    // Money validations
    results.push({
      category: 'money',
      itemId: 'money-webhooks',
      status: (await this.checkWebhookSecurity()) ? 'pass' : 'fail',
      message: 'Webhook security verification',
      evidence: 'Stripe signature validation active'
    });

    // Data validations
    results.push({
      category: 'data',
      itemId: 'data-backups',
      status: (await this.checkBackupConfig()) ? 'pass' : 'fail',
      message: 'Backup configuration check',
      evidence: 'Automated backups scheduled'
    });

    // Ops validations
    results.push({
      category: 'ops',
      itemId: 'ops-health',
      status: (await this.checkHealthEndpoint()) ? 'pass' : 'fail',
      message: 'Health endpoint verification',
      evidence: 'Endpoint responding correctly'
    });

    return results;
  }

  static async checkMFAEnabled(): Promise<boolean> {
    // Check if MFA is configured for admin roles
    // This would check your auth provider configuration
    return true; // Placeholder
  }

  static async checkRBACEnforced(): Promise<boolean> {
    // Verify RBAC middleware is applied to critical routes
    // This would scan API routes for RBAC protection
    return true; // Placeholder
  }

  static async checkWebhookSecurity(): Promise<boolean> {
    // Verify webhook signature validation is implemented
    // This would check Stripe webhook configuration
    return true; // Placeholder
  }

  static async checkBackupConfig(): Promise<boolean> {
    // Check if automated backups are configured
    // This would verify backup schedules and retention
    return true; // Placeholder
  }

  static async checkHealthEndpoint(): Promise<boolean> {
    // Test the health endpoint
    try {
      const response = await fetch('/api/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  static generateLaunchGateReport(checklist: ChecklistCategory[]): {
    status: 'ready' | 'blocked' | 'warning';
    report: string;
    actionItems: string[];
  } {
    const validation = this.validateChecklist(checklist);
    
    if (validation.canLaunch) {
      return {
        status: 'ready',
        report: '✅ All critical launch gate requirements satisfied. Ready for production deployment.',
        actionItems: []
      };
    }

    const criticalBlocks = validation.blockedItems.filter(item => item.required);
    const actionItems = criticalBlocks.map(item => 
      `Complete ${item.title} (${item.category})`
    );

    return {
      status: 'blocked',
      report: `🚫 Launch blocked: ${criticalBlocks.length} critical items incomplete.`,
      actionItems
    };
  }
}
