import { NextRequest, NextResponse } from 'next/server';
import { deleteUserData } from '@/src/compliance/gdpr';
import { api } from '@/src/core/api';
import { verifySession } from '@/src/auth/session';

/**
 * GDPR Data Deletion Endpoint
 * Allows users to request deletion of all their personal data
 */
export async function POST(req: NextRequest) {
  return api(async () => {
    const sessionToken = req.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const claims = await verifySession(sessionToken);
    if (!claims?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = claims.sub;

    const body = await req.json().catch(() => ({}));
    const { confirmEmail, reason } = body;

    // Additional verification for account deletion
    if (!confirmEmail) {
      return NextResponse.json(
        { error: 'Email confirmation required' },
        { status: 400 }
      );
    }

    try {
      // Delete user data (retains audit logs)
      await deleteUserData(userId, true);
      
      return NextResponse.json({
        success: true,
        message: 'Your data has been deleted successfully',
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to delete data' },
        { status: 500 }
      );
    }
  });
}
