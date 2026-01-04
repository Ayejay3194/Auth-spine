import { NextRequest, NextResponse } from 'next/server';
import { exportUserData } from '@/src/compliance/gdpr';
import { api } from '@/src/core/api';
import { AuthenticationError, getActor } from '@/src/core/auth';

/**
 * GDPR Data Export Endpoint
 * Allows users to download all their personal data
 */
export async function GET(req: NextRequest) {
  return api(async () => {
    let actor;
    try {
      actor = await getActor(req);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }
      throw error;
    }

    const userId = actor.userId;

    try {
      const data = await exportUserData(actor.userId);
      
      return NextResponse.json(data, {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="user-data-${actor.userId}.json"`,
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
