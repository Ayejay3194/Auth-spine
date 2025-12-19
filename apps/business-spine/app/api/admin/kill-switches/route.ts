/**
 * Kill Switches API
 * GET: Get all kill switches status
 * POST: Activate/deactivate kill switch
 */

import { NextRequest, NextResponse } from 'next/server';
import { KillSwitchManager } from '@/src/ops/kill-switches';
import { withRBAC } from '../../../../../packages/enterprise/rbac/middleware';

async function getKillSwitches(request: NextRequest) {
  try {
    const switches = await KillSwitchManager.getAllSwitches();
    const systemStatus = await KillSwitchManager.getSystemStatus();

    return NextResponse.json({
      success: true,
      data: {
        switches,
        systemStatus,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get kill switches error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kill switches' },
      { status: 500 }
    );
  }
}

async function updateKillSwitch(request: NextRequest) {
  try {
    const body = await request.json();
    const { switchId, action, reason, autoDisableHours } = body;

    if (!switchId || !action || !reason) {
      return NextResponse.json(
        { error: 'switchId, action, and reason are required' },
        { status: 400 }
      );
    }

    const userId = request.headers.get('x-user-id') as string;

    if (action === 'activate') {
      await KillSwitchManager.activateSwitch(
        switchId,
        userId,
        reason,
        autoDisableHours
      );
    } else if (action === 'deactivate') {
      await KillSwitchManager.deactivateSwitch(
        switchId,
        userId,
        reason
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be activate or deactivate' },
        { status: 400 }
      );
    }

    // Get updated status
    const switches = await KillSwitchManager.getAllSwitches();
    const systemStatus = await KillSwitchManager.getSystemStatus();

    return NextResponse.json({
      success: true,
      data: {
        switches,
        systemStatus,
        message: `Kill switch ${action}d successfully`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Update kill switch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update kill switch' },
      { status: 500 }
    );
  }
}

async function getSystemStatus(request: NextRequest) {
  try {
    const systemStatus = await KillSwitchManager.getSystemStatus();
    const activeSwitches = await KillSwitchManager.checkActiveSwitches();

    return NextResponse.json({
      success: true,
      data: {
        systemStatus,
        activeSwitches,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get system status error:', error);
    return NextResponse.json(
      { error: 'Failed to get system status' },
      { status: 500 }
    );
  }
}

export const GET = withRBAC(getKillSwitches, { resource: 'admin', action: 'read' });
export const POST = withRBAC(updateKillSwitch, { resource: 'admin', action: 'update' });
