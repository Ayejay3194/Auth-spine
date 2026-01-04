import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@enterprise/auth'
import { ROLE_PERMISSIONS } from '@/lib/role-based-access'

export async function GET(
  request: NextRequest,
  { params }: { params: { role: string } }
) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify user has access to requested role dashboard
    if (payload.role !== params.role) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get role permissions
    const rolePerms = ROLE_PERMISSIONS[payload.role as keyof typeof ROLE_PERMISSIONS]
    if (!rolePerms) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Return dashboard data based on role
    const dashboardData = getDashboardData(payload.role, payload.userId)

    return NextResponse.json({
      success: true,
      data: dashboardData,
      role: payload.role,
      permissions: rolePerms.permissions,
      features: rolePerms.features
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getDashboardData(role: string, userId: string) {
  const baseData = {
    userId,
    role,
    timestamp: new Date().toISOString()
  }

  switch (role) {
    case 'system':
      return {
        ...baseData,
        metrics: {
          systemHealth: 100,
          securityScore: 98,
          apiUptime: 99.9,
          dataIntegrity: 100,
          totalUsers: 1234,
          activeUsers: 456
        },
        sections: ['system-metrics', 'user-management', 'security-management', 'ai-system']
      }

    case 'admin':
      return {
        ...baseData,
        metrics: {
          totalUsers: 1234,
          activeSessions: 456,
          pendingApprovals: 23,
          systemStatus: 'Healthy'
        },
        sections: ['overview', 'users', 'permissions', 'resources', 'reports']
      }

    case 'dev-admin':
      return {
        ...baseData,
        metrics: {
          apiCalls24h: 45200,
          errorRate: 0.12,
          avgResponseTime: 245,
          activeIntegrations: 28
        },
        sections: ['overview', 'apis', 'integrations', 'logs', 'deployments']
      }

    case 'owner':
      return {
        ...baseData,
        metrics: {
          totalRevenue: 125400,
          teamMembers: 12,
          totalClients: 342,
          growthYoY: 24
        },
        sections: ['overview', 'team', 'financials', 'business', 'settings']
      }

    case 'practitioner':
      return {
        ...baseData,
        metrics: {
          activeClients: 24,
          upcomingSessions: 8,
          completedThisMonth: 156,
          clientSatisfaction: 4.8
        },
        sections: ['overview', 'clients', 'services', 'schedule', 'analytics']
      }

    case 'client':
      return {
        ...baseData,
        metrics: {
          activeServices: 3,
          nextSession: '2 days',
          progress: 65,
          accountStatus: 'Active'
        },
        sections: ['overview', 'services', 'sessions', 'progress', 'account']
      }

    default:
      return baseData
  }
}
