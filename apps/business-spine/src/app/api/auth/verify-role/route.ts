import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@enterprise/auth'
import { ROLE_PERMISSIONS, canAccessPage, canAccessAPI } from '@/lib/role-based-access'

export async function POST(request: NextRequest) {
  try {
    const { requiredRole, requiredPermission, requiredPage, requiredAPI } = await request.json()

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload.userId || !payload.role) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check role requirement
    if (requiredRole && payload.role !== requiredRole) {
      return NextResponse.json({ 
        authorized: false, 
        reason: 'Insufficient role',
        userRole: payload.role,
        requiredRole 
      }, { status: 403 })
    }

    // Check permission requirement
    if (requiredPermission) {
      const rolePerms = ROLE_PERMISSIONS[payload.role as keyof typeof ROLE_PERMISSIONS]
      const hasPermission = rolePerms?.permissions.some(p => 
        p === requiredPermission || p === '*' || p.endsWith(':*')
      )

      if (!hasPermission) {
        return NextResponse.json({ 
          authorized: false, 
          reason: 'Insufficient permissions',
          requiredPermission 
        }, { status: 403 })
      }
    }

    // Check page access requirement
    if (requiredPage) {
      const hasPageAccess = canAccessPage(payload, requiredPage)
      if (!hasPageAccess) {
        return NextResponse.json({ 
          authorized: false, 
          reason: 'Page access denied',
          requiredPage 
        }, { status: 403 })
      }
    }

    // Check API access requirement
    if (requiredAPI) {
      const { method, endpoint } = requiredAPI
      const hasAPIAccess = canAccessAPI(payload, method, endpoint)
      if (!hasAPIAccess) {
        return NextResponse.json({ 
          authorized: false, 
          reason: 'API access denied',
          requiredAPI 
        }, { status: 403 })
      }
    }

    return NextResponse.json({
      authorized: true,
      userId: payload.userId,
      role: payload.role,
      email: payload.email
    })
  } catch (error) {
    console.error('Role verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
