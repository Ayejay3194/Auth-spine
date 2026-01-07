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
    const professionalId = searchParams.get('professionalId');
    const search = searchParams.get('search');
    
    let services = platform.services.all();
    
    if (professionalId) {
      services = platform.services.byProfessional(professionalId);
    }
    
    if (search) {
      services = platform.services.search(search);
    }
    
    return NextResponse.json({
      success: true,
      data: services,
      count: services.length
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { 
      professionalId, 
      name, 
      durationMin, 
      price, 
      locationType, 
      recurrence, 
      metadata 
    } = body;
    
    if (!professionalId || !name || !durationMin || !price || !locationType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate professional exists
    const professional = platform.professionals.get(professionalId);
    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional not found' },
        { status: 404 }
      );
    }
    
    const service = platform.createService({
      professionalId,
      name,
      durationMin,
      price,
      locationType,
      recurrence: recurrence || 'one_time',
      metadata: metadata || {}
    });
    
    return NextResponse.json({
      success: true,
      data: service
    });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create service' },
      { status: 400 }
    );
  }
}
