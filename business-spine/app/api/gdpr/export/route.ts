import { NextRequest, NextResponse } from 'next/server';
import { exportUserData } from '@/src/compliance/gdpr';
import { api } from '@/src/core/api';

/**
 * GDPR Data Export Endpoint
 * Allows users to download all their personal data
 */
export async function GET(req: NextRequest) {
  return api(async () => {
    // TODO: Get user ID from authentication
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      const data = await exportUserData(userId);
      
      return NextResponse.json(data, {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="user-data-${userId}.json"`,
        },
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to export data' },
        { status: 500 }
      );
    }
  });
}

