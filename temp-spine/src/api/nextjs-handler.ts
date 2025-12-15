/**
 * Next.js API Route Handlers for Business Spine
 * 
 * These handlers can be used in Next.js App Router API routes.
 * Copy these to your Next.js app under app/api/spine/
 */

import { getBusinessSpineApi, ApiRequest, ApiResponse } from "./server.js";

/**
 * Handle POST /api/spine/chat
 * 
 * Execute a command or chat with the business spine
 * 
 * @example
 * // app/api/spine/chat/route.ts
 * import { handleChat } from '@/lib/spine/nextjs-handler';
 * export const POST = handleChat;
 */
export async function handleChat(request: Request): Promise<Response> {
  try {
    // Parse request body
    const body = await request.json() as ApiRequest;

    // Get API key from headers
    const apiKey = request.headers.get("x-api-key") || undefined;

    // Initialize API
    const api = getBusinessSpineApi({
      apiKey: process.env.BUSINESS_SPINE_API_KEY,
    });

    // Validate API key
    if (!api.validateApiKey(apiKey)) {
      return Response.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid API key",
          },
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Handle request
    const result = await api.handle(body);

    return Response.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    return Response.json(
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

/**
 * Handle POST /api/spine/intents
 * 
 * Detect intents without executing
 * 
 * @example
 * // app/api/spine/intents/route.ts
 * import { handleIntents } from '@/lib/spine/nextjs-handler';
 * export const POST = handleIntents;
 */
export async function handleIntents(request: Request): Promise<Response> {
  try {
    const body = await request.json() as ApiRequest;
    const apiKey = request.headers.get("x-api-key") || undefined;

    const api = getBusinessSpineApi({
      apiKey: process.env.BUSINESS_SPINE_API_KEY,
    });

    if (!api.validateApiKey(apiKey)) {
      return Response.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid API key",
          },
        } as ApiResponse,
        { status: 401 }
      );
    }

    const result = await api.detectIntents(body);

    return Response.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    return Response.json(
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

/**
 * Handle GET /api/spine/health
 * 
 * Health check endpoint
 * 
 * @example
 * // app/api/spine/health/route.ts
 * import { handleHealth } from '@/lib/spine/nextjs-handler';
 * export const GET = handleHealth;
 */
export async function handleHealth(request: Request): Promise<Response> {
  try {
    const api = getBusinessSpineApi();
    const result = await api.health();

    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
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
