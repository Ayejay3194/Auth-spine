import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@enterprise/auth'
import { ROLE_PERMISSIONS } from '@/lib/role-based-access'

export async function GET(request: NextRequest) {
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

    // Get user's role permissions
    const userRole = payload.role as keyof typeof ROLE_PERMISSIONS
    const rolePerms = ROLE_PERMISSIONS[userRole]

    if (!rolePerms) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      role: userRole,
      permissions: rolePerms.permissions,
      features: rolePerms.features,
      pages: rolePerms.pages,
      apiAccess: rolePerms.apiAccess
    })
  } catch (error) {
    console.error('Config API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload.userId || payload.role !== 'system') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all role permissions (system admin only)
    return NextResponse.json({
      success: true,
      allRoles: ROLE_PERMISSIONS
    })
  } catch (error) {
    console.error('Config API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
