import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@enterprise/auth'
import { KillSwitchManager, KILL_SWITCHES } from '@/ops/kill-switches'
import { prisma } from '@/lib/prisma'

// GET /api/ops/kill-switches - Get all kill switches
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload.userId || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const switches = await KillSwitchManager.getAllSwitches()
    const systemStatus = await KillSwitchManager.getSystemStatus()

    return NextResponse.json({
      switches,
      systemStatus,
      total: switches.length
    })
  } catch (error) {
    console.error('Kill switches fetch error:', error)
    return NextResponse.json({
      error: 'Failed to fetch kill switches',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/ops/kill-switches - Activate or deactivate a kill switch
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload.userId || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { switchId, action, reason, autoDisableHours } = body

    if (!switchId || !action || !reason) {
      return NextResponse.json({
        error: 'Missing required fields: switchId, action, reason'
      }, { status: 400 })
    }

    if (action === 'enable') {
      await KillSwitchManager.activateSwitch(
        switchId,
        payload.userId,
        reason,
        autoDisableHours
      )

      return NextResponse.json({
        success: true,
        message: `Kill switch "${switchId}" activated`,
        action: 'enabled',
        activatedBy: payload.userId,
        reason
      })
    } else if (action === 'disable') {
      await KillSwitchManager.deactivateSwitch(switchId, payload.userId, reason)

      return NextResponse.json({
        success: true,
        message: `Kill switch "${switchId}" deactivated`,
        action: 'disabled',
        deactivatedBy: payload.userId,
        reason
      })
    } else {
      return NextResponse.json({
        error: 'Invalid action. Must be "enable" or "disable"'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Kill switch operation error:', error)
    return NextResponse.json({
      error: 'Failed to update kill switch',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT /api/ops/kill-switches - Initialize default kill switches
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload.userId || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Initialize default kill switches if they don't exist
    let created = 0
    for (const sw of KILL_SWITCHES) {
      const existing = await prisma.killSwitch.findUnique({
        where: { name: sw.id }
      })

      if (!existing) {
        await prisma.killSwitch.create({
          data: {
            name: sw.id,
            description: sw.description,
            category: sw.category,
            enabled: false,
            impact: sw.impact
          }
        })
        created++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Initialized ${created} default kill switches`,
      total: KILL_SWITCHES.length
    })
  } catch (error) {
    console.error('Kill switch initialization error:', error)
    return NextResponse.json({
      error: 'Failed to initialize kill switches',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
