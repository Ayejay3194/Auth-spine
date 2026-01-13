import { NextRequest, NextResponse } from 'next/server';
import { auditStorage } from '@spine/audit-reporting';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filter = {
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      eventTypes: searchParams.get('eventTypes')?.split(',') as any,
      categories: searchParams.get('categories')?.split(',') as any,
      severities: searchParams.get('severities')?.split(',') as any,
      userId: searchParams.get('userId') || undefined,
      clientId: searchParams.get('clientId') || undefined,
      sessionId: searchParams.get('sessionId') || undefined,
      success: searchParams.get('success') ? searchParams.get('success') === 'true' : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const events = await auditStorage.query(filter);
    const total = await auditStorage.count(filter);

    return NextResponse.json({
      events,
      total,
      limit: filter.limit,
      offset: filter.offset,
    });
  } catch (error: any) {
    console.error('Failed to query events:', error);
    return NextResponse.json(
      { error: 'Failed to query events', details: error.message },
      { status: 500 }
    );
  }
}
