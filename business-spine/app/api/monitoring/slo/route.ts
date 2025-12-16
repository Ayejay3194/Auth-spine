/**
 * SLO Monitoring API Endpoint
 * GET: Get current SLO status and dashboard data
 */

import { NextRequest, NextResponse } from 'next/server';
import { SLOMonitor } from '@/src/monitoring/slo';
import { withRBAC } from '@/src/rbac/middleware';

async function getSLODashboard(request: NextRequest) {
  try {
    const dashboard = await SLOMonitor.getSLODashboard();
    
    return NextResponse.json({
      success: true,
      data: dashboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('SLO dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SLO dashboard' },
      { status: 500 }
    );
  }
}

async function triggerSLOCheck(request: NextRequest) {
  try {
    // Import the function directly
    const { runSLOChecks } = await import('@/src/monitoring/slo');
    await runSLOChecks();
    
    return NextResponse.json({
      success: true,
      message: 'SLO check completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('SLO check error:', error);
    return NextResponse.json(
      { error: 'Failed to run SLO check' },
      { status: 500 }
    );
  }
}

export const GET = withRBAC(getSLODashboard, { resource: 'analytics', action: 'read' });
export const POST = withRBAC(triggerSLOCheck, { resource: 'analytics', action: 'read' });
