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
    const search = searchParams.get('search');
    const vertical = searchParams.get('vertical');
    
    let professionals = platform.professionals.all();
    
    if (search) {
      professionals = platform.professionals.search(search);
    }
    
    if (vertical) {
      professionals = platform.professionals.byVertical(vertical);
    }
    
    return NextResponse.json({
      success: true,
      data: professionals,
      count: professionals.length
    });
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch professionals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { email, name, vertical, bio, metadata } = body;
    
    if (!email || !name || !vertical) {
      return NextResponse.json(
        { success: false, error: 'Email, name, and vertical are required' },
        { status: 400 }
      );
    }
    
    const professional = platform.createProfessional({
      email,
      name,
      vertical,
      bio,
      metadata: metadata || {}
    });
    
    return NextResponse.json({
      success: true,
      data: professional
    });
  } catch (error: any) {
    console.error('Error creating professional:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create professional' },
      { status: 400 }
    );
  }
}
