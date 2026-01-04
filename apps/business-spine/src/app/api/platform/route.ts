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
    
    const status = platform.getSystemStatus();
    
    // Add additional health metrics
    const health = {
      overall: status.initialized,
      modules: status.modules.reduce((acc, module) => {
        acc[module] = true; // All modules are healthy if initialized
        return acc;
      }, {} as Record<string, boolean>),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };
    
    return NextResponse.json({
      success: true,
      data: {
        ...status,
        health,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('Error getting platform status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get platform status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'export':
        const exportData = platform.exportData();
        return NextResponse.json({
          success: true,
          data: exportData
        });
        
      case 'import':
        if (!body.data) {
          return NextResponse.json(
            { success: false, error: 'Import data is required' },
            { status: 400 }
          );
        }
        await platform.importData(body.data);
        return NextResponse.json({
          success: true,
          message: 'Data imported successfully'
        });
        
      case 'reset':
        // Warning: This would clear all data - should be protected
        return NextResponse.json(
          { success: false, error: 'Reset action not available via API' },
          { status: 403 }
        );
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error performing platform action:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to perform action' },
      { status: 500 }
    );
  }
}
