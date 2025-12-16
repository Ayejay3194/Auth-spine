/**
 * Audit Log API
 * GET: Get audit logs with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/src/rbac/middleware';

// Mock audit log data since database models don't exist
const mockAuditLogs = [
  {
    id: '1',
    eventType: 'USER_CREATED',
    userId: 'admin-123',
    metadata: {
      userEmail: 'newuser@example.com',
      userRole: 'staff'
    },
    createdAt: new Date('2024-12-15T10:30:00Z'),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...'
  },
  {
    id: '2',
    eventType: 'KILL_SWITCH_ACTIVATED',
    userId: 'admin-123',
    metadata: {
      switchId: 'pause-payments',
      switchName: 'Pause Payment Processing',
      reason: 'Emergency maintenance'
    },
    createdAt: new Date('2024-12-15T09:15:00Z'),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...'
  },
  {
    id: '3',
    eventType: 'LAUNCH_GATE_UPDATED',
    userId: 'admin-123',
    metadata: {
      itemId: 'auth-mfa',
      status: 'completed'
    },
    createdAt: new Date('2024-12-15T08:45:00Z'),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...'
  }
];

async function getAuditLogs(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const eventType = searchParams.get('eventType');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Filter logs based on query parameters
    let filteredLogs = [...mockAuditLogs];
    
    if (eventType) {
      filteredLogs = filteredLogs.filter(log => log.eventType === eventType);
    }
    
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        logs: paginatedLogs,
        pagination: {
          page,
          limit,
          total: filteredLogs.length,
          pages: Math.ceil(filteredLogs.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

export const GET = withRBAC(getAuditLogs, { resource: 'admin', action: 'read' });
