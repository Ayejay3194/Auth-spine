/**
 * Business Spine API Server
 * 
 * Provides REST API endpoints for the business spine orchestrator.
 * Integrates with enterprise_finish Next.js application.
 */

import { createDefaultOrchestrator } from "../core/defaultOrchestrator.js";
import { AssistantContext, Role } from "../core/types.js";
import { getLogger } from "../utils/logger.js";
import { handleError, UnauthorizedError, ValidationError } from "../utils/error-handler.js";

const logger = getLogger("api");

export type ApiConfig = {
  port?: number;
  apiKey?: string;
  corsOrigins?: string[];
  logLevel?: "debug" | "info" | "warn" | "error";
};

export type ApiRequest = {
  text: string;
  context?: {
    userId?: string;
    role?: Role;
    tenantId?: string;
    timezone?: string;
    locale?: string;
    channel?: "cmdk" | "chat" | "api";
  };
  confirmToken?: string;
};

export type ApiResponse = {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

/**
 * Business Spine API Handler
 * 
 * This can be used with any HTTP framework (Express, Fastify, Next.js API routes, etc.)
 */
export class BusinessSpineApi {
  private orchestrator;

  constructor(private config: ApiConfig = {}) {
    this.orchestrator = createDefaultOrchestrator();
  }

  /**
   * Validate API key (if configured)
   */
  validateApiKey(apiKey?: string): boolean {
    if (!this.config.apiKey) {
      logger.debug("No API key configured, allowing request");
      return true;
    }

    const isValid = apiKey === this.config.apiKey;

    if (!isValid) {
      logger.warn("Invalid API key", { provided: !!apiKey });
    }

    return isValid;
  }

  /**
   * Build AssistantContext from API request
   */
  private buildContext(req: ApiRequest): AssistantContext {
    const now = new Date().toISOString();
    return {
      actor: {
        userId: req.context?.userId || "anonymous",
        role: req.context?.role || "staff",
      },
      tenantId: req.context?.tenantId || "default",
      nowISO: now,
      timezone: req.context?.timezone || "UTC",
      locale: req.context?.locale || "en-US",
      channel: req.context?.channel || "api",
    };
  }

  /**
   * Handle a chat/command request
   */
  async handle(req: ApiRequest): Promise<ApiResponse> {
    try {
      logger.info("Handling request", {
        text: req.text,
        userId: req.context?.userId,
        role: req.context?.role,
        tenantId: req.context?.tenantId,
      });

      if (!req.text || typeof req.text !== "string") {
        throw new ValidationError("Invalid text field");
      }

      const ctx = this.buildContext(req);
      const result = await this.orchestrator.handle(
        req.text,
        ctx,
        { confirmToken: req.confirmToken }
      );

      logger.info("Request completed", {
        success: result.final?.ok,
        message: result.final?.message,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const handledError = handleError(error);
      logger.error("Request failed", handledError);

      return {
        success: false,
        error: handledError.toJSON(),
      };
    }
  }

  /**
   * Detect intents without executing
   */
  async detectIntents(req: ApiRequest): Promise<ApiResponse> {
    try {
      const ctx = this.buildContext(req);
      const intents = this.orchestrator.detect(req.text, ctx);

      return {
        success: true,
        data: { intents },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "INTENT_DETECTION_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
          details: error,
        },
      };
    }
  }

  /**
   * Health check endpoint
   */
  async health(): Promise<ApiResponse> {
    return {
      success: true,
      data: {
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "0.1.0",
      },
    };
  }
}

/**
 * Create a singleton instance for use in API routes
 */
let instance: BusinessSpineApi | null = null;

export function getBusinessSpineApi(config?: ApiConfig): BusinessSpineApi {
  if (!instance) {
    instance = new BusinessSpineApi(config);
  }
  return instance;
}
