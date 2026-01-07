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
    // Load default vertical configurations
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
    const search = searchParams.get('search');
    const vertical = searchParams.get('vertical');
    
    let clients = platform.clients.all();
    
    if (search) {
      clients = platform.clients.search(search);
    }
    
    if (vertical) {
      // Filter by professionals in this vertical, then get their clients
      const professionals = platform.professionals.byVertical(vertical);
      const professionalIds = new Set(professionals.map((p: any) => p.id));
      // This would need booking data to filter properly - simplified for now
    }
    
    return NextResponse.json({
      success: true,
      data: clients,
      count: clients.length
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { email, name, phone, preferences, metadata } = body;
    
    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      );
    }
    
    const client = platform.createClient({
      email,
      name,
      phone,
      preferences: preferences || {},
      metadata: metadata || {}
    });
    
    return NextResponse.json({
      success: true,
      data: client
    });
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create client' },
      { status: 400 }
    );
  }
}
