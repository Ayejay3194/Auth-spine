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
    const vertical = searchParams.get('vertical');
    
    if (vertical) {
      // Get specific vertical configuration
      const config = platform.getVerticalConfig(vertical);
      if (!config) {
        return NextResponse.json(
          { success: false, error: 'Vertical not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: config
      });
    }
    
    // Get all verticals with their statistics
    const verticals = platform.getVerticals().map(v => {
      const config = platform.getVerticalConfig(v);
      const professionals = platform.professionals.byVertical(v);
      const services = professionals.flatMap(p => platform.services.byProfessional(p.id));
      
      return {
        vertical: v,
        displayName: config?.displayName || v,
        professionals: professionals.length,
        services: services.length,
        config: config || null
      };
    });
    
    return NextResponse.json({
      success: true,
      data: verticals,
      count: verticals.length
    });
  } catch (error) {
    console.error('Error fetching verticals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verticals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { vertical, displayName, serviceTemplates, compliance, metadata } = body;
    
    if (!vertical || !displayName || !serviceTemplates || !compliance) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const config = {
      vertical,
      displayName,
      serviceTemplates,
      compliance,
      metadata: metadata || {}
    };
    
    platform.loadVerticalConfig(config);
    
    return NextResponse.json({
      success: true,
      data: config,
      message: 'Vertical configuration loaded successfully'
    });
  } catch (error: any) {
    console.error('Error loading vertical config:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load vertical configuration' },
      { status: 400 }
    );
  }
}
