import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@enterprise/auth'
import { configLoader } from '@/lib/json-config-loader'

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

    // Get query parameters
    const { searchParams } = request.nextUrl
    const type = searchParams.get('type') || 'summary'

    switch (type) {
      case 'final':
        return NextResponse.json({
          success: true,
          data: configLoader.getSecurityAuditFinal()
        })

      case 'pass':
        return NextResponse.json({
          success: true,
          data: configLoader.getSecurityAuditPass()
        })

      case 'warn':
        return NextResponse.json({
          success: true,
          data: configLoader.getSecurityAuditWarn()
        })

      case 'fail':
        return NextResponse.json({
          success: true,
          data: configLoader.getSecurityAuditFail()
        })

      case 'all':
        return NextResponse.json({
          success: true,
          data: configLoader.getAllSecurityAudits()
        })

      case 'summary':
      default:
        return NextResponse.json({
          success: true,
          data: configLoader.getSecuritySummary()
        })
    }
  } catch (error) {
    console.error('Security audit API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
