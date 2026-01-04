/**
 * Business Spine Intent Detection API Route
 * 
 * POST /api/spine/intents
 * 
 * Detect user intents without executing commands.
 */

import { NextRequest, NextResponse } from 'next/server';

type Role = "owner" | "staff" | "assistant" | "accountant" | "admin" | "moderator";

type ApiRequest = {
  text: string;
  context?: {
    userId?: string;
    role?: Role;
    tenantId?: string;
    timezone?: string;
    locale?: string;
    channel?: "cmdk" | "chat" | "api";
  };
};

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
    const body = await request.json() as ApiRequest;

    if (!body.text) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Missing required field: text",
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    const apiKey = request.headers.get("x-api-key") || process.env.BUSINESS_SPINE_API_KEY;
    const spineUrl = process.env.BUSINESS_SPINE_URL || "http://localhost:3001";

    const response = await fetch(`${spineUrl}/api/intents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && { "x-api-key": apiKey }),
      },
      body: JSON.stringify(body),
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
