/**
 * Admin Payroll API Routes
 * 
 * API endpoints for payroll management with RBAC protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/src/rbac/middleware';
import { db } from '@/lib/db';

async function getPayrollRuns(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = status ? { status: status.toUpperCase() } : {};
    
    const runs = await db.payRun.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        payGroup: true,
        exceptions: true,
        _count: {
          select: { items: true }
        }
      }
    });

    const total = await db.payRun.count({ where });

    return NextResponse.json({
      runs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching payroll runs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll runs' },
      { status: 500 }
    );
  }
}

async function createPayrollRun(request: NextRequest) {
  try {
    const body = await request.json();
    const { payGroupName, notes } = body;

    if (!payGroupName) {
      return NextResponse.json(
        { error: 'Pay group name is required' },
        { status: 400 }
      );
    }

    const payGroup = await db.payGroup.upsert({
      where: { name: payGroupName },
      update: {},
      create: { name: payGroupName, cadence: 'BIWEEKLY' }
    });

    const run = await db.payRun.create({
      data: {
        payGroupId: payGroup.id,
        status: 'DRAFT',
        notes: notes || undefined
      },
      include: {
        payGroup: true
      }
    });

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    console.error('Error creating payroll run:', error);
    return NextResponse.json(
      { error: 'Failed to create payroll run' },
      { status: 500 }
    );
  }
}

async function getPayrollStats(request: NextRequest) {
  try {
    const totalRuns = await db.payRun.count();
    const activeEmployees = await db.employee.count({ where: { status: 'ACTIVE' } });
    const pendingRuns = await db.payRun.count({ where: { status: 'DRAFT' } });
    const reviewRuns = await db.payRun.count({ where: { status: 'REVIEW' } });
    const finalizedRuns = await db.payRun.count({ where: { status: 'FINALIZED' } });

    const recentRuns = await db.payRun.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        payGroup: true,
        exceptions: true,
        _count: {
          select: { items: true }
        }
      }
    });

    return NextResponse.json({
      stats: {
        totalRuns,
        activeEmployees,
        pendingRuns,
        reviewRuns,
        finalizedRuns
      },
      recentRuns
    });
  } catch (error) {
    console.error('Error fetching payroll stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll stats' },
      { status: 500 }
    );
  }
}

export const GET = withRBAC(getPayrollRuns, { resource: 'payroll', action: 'read' });
export const POST = withRBAC(createPayrollRun, { resource: 'payroll', action: 'create' });

// Stats endpoint
export async function STATS(request: NextRequest) {
  return withRBAC(getPayrollStats, { resource: 'payroll', action: 'read' })(request);
}
