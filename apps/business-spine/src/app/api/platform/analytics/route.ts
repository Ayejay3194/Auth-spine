import { NextRequest, NextResponse } from 'next/server';
import { DatabasePlatformOrchestrator, DEFAULT_VERTICALS } from "@spine/enterprise/platform/index";
import { prisma } from '@/lib/prisma';

// Initialize the database platform orchestrator
const platform = new DatabasePlatformOrchestrator(prisma);

// Initialize on first request
let initialized = false;
async function ensureInitialized() {
  if (!initialized) {
    await platform.initialize();
    Object.values(DEFAULT_VERTICALS).forEach(config => {
      platform.loadVerticalConfig(config);
    });
    initialized = true;
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventTypes = searchParams.get('eventTypes')?.split(',');
    const userId = searchParams.get('userId');
    const exportFormat = searchParams.get('export');
    
    let timeRange;
    if (startDate && endDate) {
      timeRange = { startDate, endDate };
    }
    
    if (exportFormat) {
      // Export analytics data
      const data = platform.analytics.export(exportFormat as 'json' | 'csv');
      
      return new NextResponse(data, {
        headers: {
          'Content-Type': exportFormat === 'csv' ? 'text/csv' : 'application/json',
          'Content-Disposition': `attachment; filename="analytics.${exportFormat}"`
        }
      });
    }
    
    const report = platform.getAnalytics(timeRange);
    
    // Add additional metrics
    const activeUsers = platform.analytics.getActiveUsers(timeRange);
    const conversionRate = platform.analytics.getConversionRate('booking.created', 'booking.confirmed', timeRange);
    
    return NextResponse.json({
      success: true,
      data: {
        ...report,
        activeUsers,
        conversionRate,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { type, data, userId, sessionId } = body;
    
    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Event type is required' },
        { status: 400 }
      );
    }
    
    // Track custom event
    await platform.eventBus.emit({
      type,
      timestamp: new Date().toISOString(),
      userId,
      sessionId,
      data: data || {}
    });
    
    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
