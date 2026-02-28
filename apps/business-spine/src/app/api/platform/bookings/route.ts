import { NextRequest, NextResponse } from 'next/server';
import { DatabasePlatformOrchestrator, DEFAULT_VERTICALS } from "@spine/enterprise/platform";
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
    const clientId = searchParams.get('clientId');
    const professionalId = searchParams.get('professionalId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let bookings = platform.booking.all();
    
    if (clientId) {
      bookings = platform.booking.byClient(clientId);
    }
    
    if (professionalId) {
      bookings = platform.booking.byProfessional(professionalId);
    }
    
    if (status) {
      bookings = platform.booking.byStatus(status as any);
    }
    
    if (startDate && endDate) {
      bookings = platform.booking.inTimeRange(startDate, endDate);
    }
    
    return NextResponse.json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { 
      clientId, 
      professionalId, 
      serviceId, 
      startAtUtc, 
      endAtUtc 
    } = body;
    
    if (!clientId || !professionalId || !serviceId || !startAtUtc || !endAtUtc) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const booking = await platform.createBooking({
      clientId,
      professionalId,
      serviceId,
      startAtUtc,
      endAtUtc
    });
    
    return NextResponse.json({
      success: true,
      data: booking
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create booking' },
      { status: 400 }
    );
  }
}
