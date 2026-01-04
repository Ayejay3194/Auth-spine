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

export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');
    const startAtUtc = searchParams.get('startAtUtc');
    const endAtUtc = searchParams.get('endAtUtc');
    
    if (!professionalId || !startAtUtc || !endAtUtc) {
      return NextResponse.json(
        { success: false, error: 'Professional ID, start time, and end time are required' },
        { status: 400 }
      );
    }
    
    const isAvailable = platform.booking.isSlotAvailable(
      professionalId,
      startAtUtc,
      endAtUtc
    );
    
    return NextResponse.json({
      success: true,
      data: {
        professionalId,
        startAtUtc,
        endAtUtc,
        available: isAvailable
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
