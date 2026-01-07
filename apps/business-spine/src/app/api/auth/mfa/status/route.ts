import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@enterprise/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/auth/mfa/status
 * Check if MFA is enabled for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(authToken)
    if (!payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check MFA status
    const mfaSecret = await prisma.mfaSecret.findUnique({
      where: { userId: payload.userId }
    })

    const enabled = !!mfaSecret?.enabledAt

    return NextResponse.json({
      enabled,
      enabledAt: mfaSecret?.enabledAt?.toISOString() || null
    })
  } catch (error) {
    console.error('MFA status error:', error)
    return NextResponse.json({
      error: 'Failed to get MFA status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
