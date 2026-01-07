import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@enterprise/auth'
import { startMfa } from '@/security/mfa'

/**
 * POST /api/auth/mfa/enroll
 * Initiates MFA enrollment for authenticated user
 * Returns QR code data URL and recovery codes
 */
export async function POST(request: NextRequest) {
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

    // Start MFA enrollment
    const { qrDataUrl, recoveryCodes } = await startMfa(payload.userId)

    return NextResponse.json({
      success: true,
      qrDataUrl,
      recoveryCodes,
      message: 'Scan the QR code with your authenticator app, then verify with a code to complete setup'
    })
  } catch (error) {
    console.error('MFA enrollment error:', error)
    return NextResponse.json({
      error: 'Failed to start MFA enrollment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
