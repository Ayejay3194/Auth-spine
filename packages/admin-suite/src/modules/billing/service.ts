import { AdminUser } from '../../core/types';
import { permissionEngine } from '../../core/permissions';
import { adminAudit, Audited } from '../../core/audit';

/**
 * Billing Module - Subscriptions, refunds, revenue intelligence
 * Money without notes is how finance loses its mind
 */

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAt?: Date;
  canceledAt?: Date;
  trialEnd?: Date;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
  note: string;
  processedBy: string;
  processedAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  churnRate: number;
  newMRR: number;
  expansionMRR: number;
  contractionMRR: number;
  churnedMRR: number;
  netMRR: number;
  activeSubscriptions: number;
  trialConversionRate: number;
  avgRevenuePerUser: number;
}

export interface CohortAnalysis {
  cohort: string;
  size: number;
  retained: number;
  retentionRate: number;
  revenue: number;
  avgLifetimeValue: number;
}

export class BillingService {
  private currentUser: AdminUser;

  constructor(currentUser: AdminUser) {
    this.currentUser = currentUser;
  }

  /**
   * Get subscription details
   */
  @Audited('billing')
  async getSubscription(subscriptionId: string): Promise<Subscription> {
    permissionEngine.require(this.currentUser, 'billing.read');

    const { prisma } = await import('@spine/shared-db/prisma');

    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!sub) {
      throw new Error('Subscription not found');
    }

    return {
      id: sub.id,
      userId: sub.userId,
      planId: sub.planId,
      status: sub.status as any,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAt: sub.cancelAt || undefined,
      canceledAt: sub.canceledAt || undefined,
      trialEnd: sub.trialEnd || undefined,
      amount: sub.amount,
      currency: sub.currency,
      metadata: (sub.metadata as any) || undefined,
    };
  }

  /**
   * Override subscription plan
   */
  @Audited('billing')
  async overridePlan(params: {
    subscriptionId: string;
    newPlanId: string;
    reason: string;
    prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
  }): Promise<void> {
    permissionEngine.require(this.currentUser, 'billing.write');

    if (!params.reason || params.reason.length < 10) {
      throw new Error('Plan override requires detailed reason (min 10 chars)');
    }

    const { prisma } = await import('@spine/shared-db/prisma');

    const sub = await prisma.subscription.findUnique({
      where: { id: params.subscriptionId },
    });

    if (!sub) {
      throw new Error('Subscription not found');
    }

    const newPlan = await prisma.plan.findUnique({
      where: { id: params.newPlanId },
    });

    if (!newPlan) {
      throw new Error('Plan not found');
    }

    await prisma.subscription.update({
      where: { id: params.subscriptionId },
      data: {
        planId: params.newPlanId,
        amount: newPlan.amount,
      },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'override_plan',
      resource: 'billing',
      resourceId: params.subscriptionId,
      changes: {
        oldPlanId: sub.planId,
        newPlanId: params.newPlanId,
        oldAmount: sub.amount,
        newAmount: newPlan.amount,
      },
      metadata: {
        reason: params.reason,
        prorationBehavior: params.prorationBehavior,
      },
    });
  }

  /**
   * Process refund with note
   */
  @Audited('billing')
  async processRefund(params: {
    paymentId: string;
    amount: number;
    reason: string;
    note: string;
  }): Promise<Refund> {
    permissionEngine.require(this.currentUser, 'refunds.write');

    if (!params.note || params.note.length < 20) {
      throw new Error('Refund requires detailed note (min 20 chars)');
    }

    const { prisma } = await import('@spine/shared-db/prisma');

    const payment = await prisma.payment.findUnique({
      where: { id: params.paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (params.amount > payment.amount) {
      throw new Error('Refund amount exceeds payment amount');
    }

    const refund = await prisma.refund.create({
      data: {
        paymentId: params.paymentId,
        amount: params.amount,
        currency: payment.currency,
        reason: params.reason,
        note: params.note,
        processedBy: this.currentUser.id,
        processedAt: new Date(),
        status: 'pending',
      },
    });

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'process_refund',
      resource: 'billing',
      resourceId: refund.id,
      metadata: {
        paymentId: params.paymentId,
        amount: params.amount,
        reason: params.reason,
        note: params.note,
      },
    });

    return {
      id: refund.id,
      paymentId: refund.paymentId,
      amount: refund.amount,
      currency: refund.currency,
      reason: refund.reason,
      note: refund.note,
      processedBy: refund.processedBy,
      processedAt: refund.processedAt,
      status: refund.status as any,
    };
  }

  /**
   * Get revenue metrics
   */
  @Audited('billing')
  async getRevenueMetrics(params: {
    startDate: Date;
    endDate: Date;
  }): Promise<RevenueMetrics> {
    permissionEngine.require(this.currentUser, 'billing.read');

    const { prisma } = await import('@spine/shared-db/prisma');

    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodStart: { lte: params.endDate },
        currentPeriodEnd: { gte: params.startDate },
      },
    });

    const mrr = activeSubscriptions.reduce((sum, sub) => {
      const monthlyAmount = sub.amount / (sub.interval === 'year' ? 12 : 1);
      return sum + monthlyAmount;
    }, 0);

    const arr = mrr * 12;

    const previousPeriodStart = new Date(params.startDate.getTime() - (params.endDate.getTime() - params.startDate.getTime()));
    const previousSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodStart: { lte: params.startDate },
        currentPeriodEnd: { gte: previousPeriodStart },
      },
    });

    const previousMRR = previousSubscriptions.reduce((sum, sub) => {
      const monthlyAmount = sub.amount / (sub.interval === 'year' ? 12 : 1);
      return sum + monthlyAmount;
    }, 0);

    const churnedMRR = previousMRR - mrr;
    const churnRate = previousMRR > 0 ? churnedMRR / previousMRR : 0;

    const newSubscriptions = await prisma.subscription.count({
      where: {
        createdAt: { gte: params.startDate, lte: params.endDate },
        status: 'active',
      },
    });

    const newMRR = newSubscriptions * (mrr / activeSubscriptions.length);

    const trials = await prisma.subscription.findMany({
      where: {
        trialEnd: { gte: params.startDate, lte: params.endDate },
      },
    });

    const convertedTrials = trials.filter(t => t.status === 'active').length;
    const trialConversionRate = trials.length > 0 ? convertedTrials / trials.length : 0;

    const totalUsers = await prisma.user.count({
      where: {
        subscription: { status: 'active' },
      },
    });

    const avgRevenuePerUser = totalUsers > 0 ? mrr / totalUsers : 0;

    return {
      mrr,
      arr,
      churnRate,
      newMRR,
      expansionMRR: 0,
      contractionMRR: 0,
      churnedMRR,
      netMRR: mrr - churnedMRR,
      activeSubscriptions: activeSubscriptions.length,
      trialConversionRate,
      avgRevenuePerUser,
    };
  }

  /**
   * Detect trial abuse
   */
  @Audited('billing')
  async detectTrialAbuse(): Promise<Array<{
    userId: string;
    email: string;
    trialCount: number;
    lastTrialStart: Date;
    suspicious: boolean;
  }>> {
    permissionEngine.require(this.currentUser, 'billing.read');

    const { prisma } = await import('@spine/shared-db/prisma');

    const users = await prisma.user.findMany({
      include: {
        subscriptions: {
          where: {
            trialEnd: { not: null },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const suspects = users
      .filter(u => u.subscriptions.length > 1)
      .map(u => ({
        userId: u.id,
        email: u.email,
        trialCount: u.subscriptions.length,
        lastTrialStart: u.subscriptions[0].createdAt,
        suspicious: u.subscriptions.length > 2,
      }))
      .filter(s => s.suspicious)
      .sort((a, b) => b.trialCount - a.trialCount);

    return suspects;
  }

  /**
   * Detect discount abuse
   */
  @Audited('billing')
  async detectDiscountAbuse(): Promise<Array<{
    userId: string;
    discountCount: number;
    totalSavings: number;
    suspicious: boolean;
  }>> {
    permissionEngine.require(this.currentUser, 'billing.read');

    const { prisma } = await import('@spine/shared-db/prisma');

    const discounts = await prisma.discountUsage.groupBy({
      by: ['userId'],
      _count: true,
      _sum: { amount: true },
      having: {
        userId: { _count: { gt: 3 } },
      },
    });

    return discounts.map(d => ({
      userId: d.userId,
      discountCount: d._count,
      totalSavings: d._sum.amount || 0,
      suspicious: d._count > 5 || (d._sum.amount || 0) > 1000,
    }));
  }

  /**
   * Get cohort analysis
   */
  @Audited('billing')
  async getCohortAnalysis(params: {
    startDate: Date;
    endDate: Date;
    groupBy: 'month' | 'quarter' | 'year';
  }): Promise<CohortAnalysis[]> {
    permissionEngine.require(this.currentUser, 'billing.read');

    const { prisma } = await import('@spine/shared-db/prisma');

    const subscriptions = await prisma.subscription.findMany({
      where: {
        createdAt: { gte: params.startDate, lte: params.endDate },
      },
      include: {
        user: true,
      },
    });

    const cohorts = new Map<string, {
      size: number;
      retained: number;
      revenue: number;
    }>();

    for (const sub of subscriptions) {
      const cohortKey = this.getCohortKey(sub.createdAt, params.groupBy);
      const cohort = cohorts.get(cohortKey) || { size: 0, retained: 0, revenue: 0 };

      cohort.size++;
      if (sub.status === 'active') {
        cohort.retained++;
        cohort.revenue += sub.amount;
      }

      cohorts.set(cohortKey, cohort);
    }

    return Array.from(cohorts.entries()).map(([cohort, data]) => ({
      cohort,
      size: data.size,
      retained: data.retained,
      retentionRate: data.size > 0 ? data.retained / data.size : 0,
      revenue: data.revenue,
      avgLifetimeValue: data.retained > 0 ? data.revenue / data.retained : 0,
    }));
  }

  private getCohortKey(date: Date, groupBy: 'month' | 'quarter' | 'year'): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    switch (groupBy) {
      case 'year':
        return `${year}`;
      case 'quarter':
        return `${year}-Q${Math.ceil(month / 3)}`;
      case 'month':
      default:
        return `${year}-${month.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Handle failed payment workflow
   */
  @Audited('billing')
  async handleFailedPayment(subscriptionId: string, action: 'retry' | 'pause' | 'cancel'): Promise<void> {
    permissionEngine.require(this.currentUser, 'billing.write');

    const { prisma } = await import('@spine/shared-db/prisma');

    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!sub) {
      throw new Error('Subscription not found');
    }

    switch (action) {
      case 'retry':
        // Trigger payment retry
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: { status: 'active' },
        });
        break;
      case 'pause':
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: { status: 'paused' },
        });
        break;
      case 'cancel':
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'cancelled',
            canceledAt: new Date(),
          },
        });
        break;
    }

    await adminAudit.log({
      actor: this.currentUser.id,
      action: 'handle_failed_payment',
      resource: 'billing',
      resourceId: subscriptionId,
      metadata: { action },
    });
  }
}
