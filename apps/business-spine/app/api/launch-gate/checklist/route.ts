/**
 * Launch Gate Checklist API
 * GET: Get current checklist status
 * POST: Update checklist item
 * POST: Run validation checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { LaunchGateValidator, LAUNCH_GATE_CHECKLIST } from '@/src/launch-gate/checklist';
import { withRBAC } from '../../../../src/lib/rbac-middleware';
import { prisma } from '@/lib/prisma';

async function getChecklist(request: NextRequest) {
  try {
    // For now, return the default checklist since database models don't exist
    const { LAUNCH_GATE_CHECKLIST, LaunchGateValidator } = await import('@/src/launch-gate/checklist');
    
    const validation = LaunchGateValidator.validateChecklist(LAUNCH_GATE_CHECKLIST);
    const report = LaunchGateValidator.generateLaunchGateReport(LAUNCH_GATE_CHECKLIST);

    return NextResponse.json({
      success: true,
      data: {
        checklist: LAUNCH_GATE_CHECKLIST,
        validation,
        report,
        lastUpdated: new Date().getTime()
      }
    });
  } catch (error) {
    console.error('Get checklist error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checklist' },
      { status: 500 }
    );
  }
}

async function updateChecklistItem(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, status, evidence, assignee, notes } = body;

    if (!itemId || !status) {
      return NextResponse.json(
        { error: ' itemId and status are required' },
        { status: 400 }
      );
    }

    // For now, just log the update since database models don't exist
    console.log('CHECKLIST UPDATE:', {
      itemId,
      status,
      evidence,
      assignee,
      notes,
      updatedBy: request.headers.get('x-user-email'),
      updatedAt: new Date()
    });

    // Log the change using console.log since auditLog model doesn't exist
    console.log('AUDIT LOG:', {
      eventType: 'LAUNCH_GATE_UPDATED',
      userId: request.headers.get('x-user-id'),
      metadata: {
        itemId,
        status,
        updatedBy: request.headers.get('x-user-email')
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        itemId,
        status,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Update checklist item error:', error);
    return NextResponse.json(
      { error: 'Failed to update checklist item' },
      { status: 500 }
    );
  }
}

async function runValidation(request: NextRequest) {
  try {
    const { LaunchGateValidator } = await import('@/src/launch-gate/checklist');
    const validationResults = await LaunchGateValidator.runValidationChecks();

    // Save validation results using console.log since database models don't exist
    console.log('VALIDATION RESULTS:', {
      results: validationResults,
      timestamp: new Date().toISOString(),
      runBy: request.headers.get('x-user-id')
    });

    return NextResponse.json({
      success: true,
      data: {
        results: validationResults,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Run validation error:', error);
    return NextResponse.json(
      { error: 'Failed to run validation' },
      { status: 500 }
    );
  }
}

export const GET = withRBAC(getChecklist, { resource: 'admin', action: 'read' });
export const POST = withRBAC(updateChecklistItem, { resource: 'admin', action: 'update' });
