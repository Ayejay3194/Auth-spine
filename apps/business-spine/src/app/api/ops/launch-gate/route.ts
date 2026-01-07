import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@enterprise/auth'
import { prisma } from '@/lib/prisma'

// GET /api/ops/launch-gate - Get all launch gates
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const gates = await prisma.launchGate.findMany({
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }]
    })

    return NextResponse.json({ gates, total: gates.length })
  } catch (error) {
    console.error('Launch gates fetch error:', error)
    return NextResponse.json({
      error: 'Failed to fetch launch gates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/ops/launch-gate - Create new launch gate
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload.userId || (payload.role !== 'admin' && payload.role !== 'manager')) {
      return NextResponse.json({ error: 'Admin or manager access required' }, { status: 403 })
    }

    const body = await request.json()
    const { feature, description, gateChecks, assignedTo, dueDate } = body

    if (!feature || !description) {
      return NextResponse.json({
        error: 'Missing required fields: feature, description'
      }, { status: 400 })
    }

    const gate = await prisma.launchGate.create({
      data: {
        feature,
        description,
        gateChecks: gateChecks || [],
        assignedTo,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'planning'
      }
    })

    await prisma.launchGateHistory.create({
      data: {
        gateId: gate.id,
        feature: gate.feature,
        action: 'created',
        userId: payload.userId,
        toValue: 'planning'
      }
    })

    return NextResponse.json({
      success: true,
      gate,
      message: `Launch gate created for "${feature}"`
    })
  } catch (error) {
    console.error('Launch gate creation error:', error)
    return NextResponse.json({
      error: 'Failed to create launch gate',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
