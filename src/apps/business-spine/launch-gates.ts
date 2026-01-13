/**
 * Launch Gates Module
 * Feature release management with gradual rollout
 */

import { prisma } from '@/lib/prisma';

export type LaunchGateStatus =
  | 'planning'
  | 'development'
  | 'testing'
  | 'staged'
  | 'launched'
  | 'retired';

export interface LaunchGate {
  id: string;
  feature: string;
  description: string;
  status: LaunchGateStatus;
  gateChecks: Record<string, boolean>;
  assignedTo?: string;
  dueDate?: Date;
  launchedAt?: Date;
  launchedBy?: string;
  rolloutPct: number;
  notes?: string;
}

/**
 * Get all launch gates
 */
export async function getAllLaunchGates(): Promise<LaunchGate[]> {
  const gates = await prisma.launchGate.findMany({
    orderBy: { status: 'asc' }
  });

  return gates.map(gate => ({
    ...gate,
    gateChecks: gate.gateChecks as Record<string, boolean>
  }));
}

/**
 * Get launch gate by feature
 */
export async function getLaunchGate(feature: string): Promise<LaunchGate | null> {
  const gate = await prisma.launchGate.findUnique({
    where: { feature }
  });

  if (!gate) return null;

  return {
    ...gate,
    gateChecks: gate.gateChecks as Record<string, boolean>
  };
}

/**
 * Create launch gate
 */
export async function createLaunchGate(
  feature: string,
  description: string,
  gateChecks: Record<string, boolean>
): Promise<LaunchGate> {
  const gate = await prisma.launchGate.create({
    data: {
      feature,
      description,
      status: 'planning',
      gateChecks,
      rolloutPct: 0
    }
  });

  return {
    ...gate,
    gateChecks: gate.gateChecks as Record<string, boolean>
  };
}

/**
 * Update launch gate status
 */
export async function updateLaunchGateStatus(
  feature: string,
  status: LaunchGateStatus,
  userId: string
): Promise<void> {
  await prisma.launchGate.update({
    where: { feature },
    data: { status }
  });

  // Log to history
  await prisma.launchGateHistory.create({
    data: {
      gateId: feature,
      feature,
      action: 'status_change',
      userId,
      fromValue: null,
      toValue: status
    }
  });
}

/**
 * Update rollout percentage
 */
export async function updateRolloutPercentage(
  feature: string,
  rolloutPct: number,
  userId: string
): Promise<void> {
  const gate = await prisma.launchGate.findUnique({
    where: { feature }
  });

  await prisma.launchGate.update({
    where: { feature },
    data: { rolloutPct }
  });

  // Log to history
  await prisma.launchGateHistory.create({
    data: {
      gateId: gate?.id || feature,
      feature,
      action: 'rollout_increase',
      userId,
      fromValue: gate?.rolloutPct.toString(),
      toValue: rolloutPct.toString()
    }
  });
}

/**
 * Complete gate check
 */
export async function completeGateCheck(
  feature: string,
  checkName: string,
  userId: string
): Promise<void> {
  const gate = await prisma.launchGate.findUnique({
    where: { feature }
  });

  if (!gate) throw new Error('Launch gate not found');

  const gateChecks = gate.gateChecks as Record<string, boolean>;
  gateChecks[checkName] = true;

  await prisma.launchGate.update({
    where: { feature },
    data: { gateChecks }
  });

  // Log to history
  await prisma.launchGateHistory.create({
    data: {
      gateId: gate.id,
      feature,
      action: 'check_completed',
      userId,
      notes: `Completed check: ${checkName}`
    }
  });
}

/**
 * Check if feature is enabled for user (rollout percentage)
 */
export async function isFeatureEnabled(feature: string, userId: string): Promise<boolean> {
  const gate = await prisma.launchGate.findUnique({
    where: { feature }
  });

  if (!gate) return false;

  // If launched at 100%, enable for everyone
  if (gate.rolloutPct >= 100) return true;

  // If 0%, disable for everyone
  if (gate.rolloutPct <= 0) return false;

  // Hash user ID to get consistent percentage
  const hash = userId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);

  const userPercentage = Math.abs(hash % 100);

  return userPercentage < gate.rolloutPct;
}
