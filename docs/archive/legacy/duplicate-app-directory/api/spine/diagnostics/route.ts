/**
 * Business Spine Diagnostics API Route
 * 
 * POST /api/spine/diagnostics
 * 
 * Run system diagnostics (admin only).
 */

import { NextRequest, NextResponse } from 'next/server';

type ApiResponse = {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Check authentication (would integrate with your auth system)
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId || (userRole !== "admin" && userRole !== "owner")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Admin access required for diagnostics",
          },
        } as ApiResponse,
        { status: 403 }
      );
    }

    const apiKey = request.headers.get("x-api-key") || process.env.BUSINESS_SPINE_API_KEY;
    const spineUrl = process.env.BUSINESS_SPINE_URL || "http://localhost:3001";

    // Run diagnostics command
    const response = await fetch(`${spineUrl}/api/handle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && { "x-api-key": apiKey }),
      },
      body: JSON.stringify({
        text: "run diagnostics",
        context: {
          userId,
          role: userRole,
          tenantId: request.headers.get("x-tenant-id") || "default",
        },
      }),
    });

    const result = await response.json() as ApiResponse;

    return NextResponse.json(result, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
