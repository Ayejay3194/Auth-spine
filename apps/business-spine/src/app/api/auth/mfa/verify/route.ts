import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@enterprise/auth'
import { confirmMfa, verifyMfaToken } from '@/security/mfa'

/**
 * POST /api/auth/mfa/verify
 * Verifies MFA token for initial enrollment or login
 * Body: { token: string, action: 'enroll' | 'login' }
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
    const { token, action = 'login' } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'MFA token is required' }, { status: 400 })
    }

    if (token.length !== 6 || !/^\d{6}$/.test(token)) {
      return NextResponse.json({ error: 'Invalid MFA token format' }, { status: 400 })
    }

    // Verify MFA token based on action
    let success = false
    if (action === 'enroll') {
      // Confirm enrollment and enable MFA
      success = await confirmMfa(payload.userId, token)
      if (success) {
        return NextResponse.json({
          success: true,
          message: 'MFA successfully enabled for your account'
        })
      }
    } else {
      // Verify MFA for login
      success = await verifyMfaToken(payload.userId, token)
      if (success) {
        return NextResponse.json({
          success: true,
          message: 'MFA verification successful'
        })
      }
    }

    return NextResponse.json({
      error: 'Invalid MFA token',
      success: false
    }, { status: 401 })
  } catch (error) {
    console.error('MFA verification error:', error)
    return NextResponse.json({
      error: 'Failed to verify MFA token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
