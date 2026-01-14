import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@enterprise/auth'
import { useRecoveryCode } from '@/security'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/auth/mfa/recovery
 * Uses a recovery code to bypass MFA
 * Body: { recoveryCode: string }
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { recoveryCode } = body

    if (!recoveryCode || typeof recoveryCode !== 'string') {
      return NextResponse.json({ error: 'Recovery code is required' }, { status: 400 })
    }

    // Normalize recovery code (remove spaces, uppercase)
    const normalizedCode = recoveryCode.replace(/\s/g, '').toUpperCase()

    // Use recovery code
    const success = await useRecoveryCode(payload.userId, normalizedCode)

    if (success) {
      // Count remaining recovery codes
      const remainingCodes = await prisma.mfaRecoveryCode.count({
        where: {
          userId: payload.userId,
          usedAt: null
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Recovery code accepted',
        remainingCodes,
        warning: remainingCodes <= 2 ? 'You have 2 or fewer recovery codes remaining. Generate new codes soon.' : undefined
      })
    }

    return NextResponse.json({
      error: 'Invalid or already used recovery code',
      success: false
    }, { status: 401 })
  } catch (error) {
    console.error('MFA recovery error:', error)
    return NextResponse.json({
      error: 'Failed to use recovery code',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET /api/auth/mfa/recovery
 * Gets count of remaining recovery codes
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

    // Count remaining recovery codes
    const remainingCodes = await prisma.mfaRecoveryCode.count({
      where: {
        userId: payload.userId,
        usedAt: null
      }
    })

    return NextResponse.json({
      remainingCodes,
      warning: remainingCodes <= 2 ? 'Low recovery codes remaining' : undefined
    })
  } catch (error) {
    console.error('MFA recovery status error:', error)
    return NextResponse.json({
      error: 'Failed to get recovery code status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
