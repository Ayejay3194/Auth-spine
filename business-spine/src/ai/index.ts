/**
 * AI TUTOR MODULE - LLM as Teacher Layer
 * 
 * This module implements the "LLM as Teacher" architecture:
 * - LLM generates suggestions, not actions
 * - Provides explanations and educational content
 * - Never executes tools directly
 * - Uses safe, redacted data snapshots
 * - All outputs are structured and validated
 * 
 * The LLM is the COACH, not the CASHIER.
 */

export { AITutor } from './teacher.js';
export type { AITutorRequest, AITutorResponse } from './teacher.js';

export {
  // Schemas for structured, safe outputs
  ExplanationSchema,
  DraftSchema,
  RecommendationSchema,
  TutorialSchema,
  SupportSchema,
  AnalysisSchema,
  ProposedActionSchema,
  TeachingSchema,
  validateByType,
  type Explanation,
  type Draft,
  type Recommendation,
  type Tutorial,
  type Support,
  type Analysis,
  type ProposedAction,
  type Teaching
} from './schemas.js';

export {
  // Data safety and redaction
  createSafeSnapshot,
  sanitizeObject,
  validateSafeSnapshot,
  isDataSafe,
  createAuditLog,
  type SafeDataSnapshot
} from './redaction.js';

export {
  // Rule-based recommendations
  generateRecommendations,
  generateQuickInsights,
  generateActionableTips,
  type Recommendation
} from './recommendations.js';

export {
  // HARD SAFETY RULES - Never execute
  NEVER_EXECUTE,
  canExecute,
  validateLLMOutput,
  sanitizeLLMOutput,
  createConfirmationPrompt,
  auditAIInteraction,
  safetyChecklist,
  type ActionRequest,
  type ExecutionResult
} from './never_execute.js';

/**
 * QUICK START GUIDE
 * 
 * 1. Create AI Tutor with LLM service
 * const tutor = new AITutor(llmService);
 * 
 * 2. Generate suggestions (never actions)
 * const result = await tutor.teach({
 *   type: 'recommend',
 *   context: businessContext,
 *   userLevel: 'intermediate'
 * });
 * 
 * 3. Present to user for confirmation
 * if (result.data.proposedAction) {
 *   const confirmation = createConfirmationPrompt(result.data.proposedAction);
 *   // Show to user, wait for approval
 * }
 * 
 * 4. Execute through deterministic system only
 * if (userConfirmed) {
 *   // Use your regular business logic, not AI
 *   const result = await businessSystem.execute(action);
 * }
 * 
 * SAFETY REMINDER:
 * LLM suggests → User confirms → System executes
 * NEVER: LLM suggests → LLM executes
 */
