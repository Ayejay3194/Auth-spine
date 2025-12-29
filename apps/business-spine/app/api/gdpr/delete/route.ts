import { NextRequest, NextResponse } from 'next/server';
import { deleteUserData } from '@/src/compliance/gdpr';
import { api } from '@/src/core/api';
import { AuthenticationError, getActor } from '@/src/core/auth';

/**
 * GDPR Data Deletion Endpoint
 * Allows users to request deletion of all their personal data
 */
export async function POST(req: NextRequest) {
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
      await deleteUserData(actor.userId, true);
      
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
