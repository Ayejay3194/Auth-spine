import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const spineUrl = process.env.NEXT_PUBLIC_BUSINESS_SPINE_URL
    if (!spineUrl) {
      return NextResponse.json(
        { error: 'Business Spine not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(`${spineUrl}/assistant/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BUSINESS_SPINE_API_KEY}`,
        'X-Tenant-ID': process.env.BUSINESS_SPINE_TENANT_ID || 'default-tenant',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        context: {
          ...context,
          actor: session.user?.email,
          tenantId: process.env.BUSINESS_SPINE_TENANT_ID || 'default-tenant'
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Business Spine chat failed: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Business Spine chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
