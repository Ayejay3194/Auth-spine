/**
 * Supabase Advanced Features Package
 * Enhanced database functionality for Auth-spine platform
 */

export { writeAudit, type AuditAction, type AuditEvent } from './src/audit';
export { hitRateLimit, buildRateLimitKey, type RateLimitResult } from './src/rateLimit';
export { createSupabaseClient, createSupabaseServiceClient } from './src/client';
export { subscribeToPresence, broadcastMessage, type PresenceState, type BroadcastPayload } from './src/realtime';
export { getRequiredEnv, getOptionalEnv, supabaseEnv } from './src/env';

/**
 * Supabase advanced features for Auth-spine platform
 * Provides comprehensive database functionality including:
 * - Audit logging with append-only tables
 * - Rate limiting with atomic operations
 * - Realtime presence and broadcasting
 * - Strongly typed client helpers
 * - Environment variable validation
 * - Database monitoring views
 * - Security extensions and policies
 */
