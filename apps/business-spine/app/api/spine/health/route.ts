/**
 * Business Spine Health Check API Route
 * 
 * GET /api/spine/health
 * 
 * Check if the business spine service is healthy.
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

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const spineUrl = process.env.BUSINESS_SPINE_URL || "http://localhost:3001";

    const response = await fetch(`${spineUrl}/api/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
          code: "SERVICE_UNAVAILABLE",
          message: "Business spine service is not available",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      } as ApiResponse,
      { status: 503 }
    );
  }
}
