import { NextRequest, NextResponse } from 'next/server';
import { PlatformOrchestrator, DEFAULT_VERTICALS } from '@spine/enterprise/platform';

// Initialize the platform orchestrator
const platform = new PlatformOrchestrator();

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureInitialized();
    
    const booking = platform.booking.get(params.id);
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { action } = body;
    
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }
    
    let booking;
    
    switch (action) {
      case 'confirm':
        booking = await platform.confirmBooking(params.id);
        break;
      case 'cancel':
        booking = platform.booking.cancel(params.id);
        break;
      case 'complete':
        booking = platform.booking.complete(params.id);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      data: booking
    });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update booking' },
      { status: 400 }
    );
  }
}
