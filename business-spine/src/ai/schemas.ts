import { z } from 'zod';

/**
 * STRICT OUTPUT SCHEMAS FOR LLM RESPONSES
 * 
 * These schemas ensure LLM outputs are:
 * - Structured JSON only
 * - No free-form text for actions
 * - Type-safe and validated
 * - Predictable format
 * 
 * NEVER allow LLM to output unstructured text that could be misinterpreted as commands.
 */

// Base schema for all responses
const BaseResponseSchema = z.object({
  confidence: z.number().min(0).max(1),
  userLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

// Explanation schema for "how things work"
export const ExplanationSchema = BaseResponseSchema.extend({
  title: z.string().max(200),
  explanation: z.string().max(2000),
  reasoning: z.string().max(1000),
  examples: z.array(z.string().max(500)).max(5),
  keyPoints: z.array(z.string().max(200)).max(5),
  nextSteps: z.array(z.string().max(300)).max(3),
  relatedTopics: z.array(z.string().max(100)).max(3),
});

// Draft schema for content generation
export const DraftSchema = BaseResponseSchema.extend({
  title: z.string().max(200),
  content: z.string().max(5000),
  subject: z.string().max(200).optional(),
  callToAction: z.string().max(300),
  tone: z.enum(['professional', 'friendly', 'technical', 'empathetic']),
  wordCount: z.number().min(10).max(2000),
  suggestions: z.array(z.string().max(300)).max(3),
});

// Recommendation schema (suggestions only, never actions)
export const RecommendationSchema = BaseResponseSchema.extend({
  recommendations: z.array(z.object({
    title: z.string().max(200),
    description: z.string().max(1000),
    impact: z.enum(['high', 'medium', 'low']),
    effort: z.enum(['high', 'medium', 'low']),
    timeline: z.string().max(100),
    steps: z.array(z.string().max(300)).max(5),
    metrics: z.array(z.string().max(200)).max(3),
    confidence: z.number().min(0).max(1),
  })).max(10),
  summary: z.string().max(500),
  priority: z.string().max(200),
});

// Tutorial schema for step-by-step guidance
export const TutorialSchema = BaseResponseSchema.extend({
  title: z.string().max(200),
  description: z.string().max(1000),
  prerequisites: z.array(z.string().max(200)).max(5),
  steps: z.array(z.object({
    step: z.number().min(1),
    title: z.string().max(200),
    instruction: z.string().max(1000),
    why: z.string().max(500),
    tips: z.string().max(300).optional(),
    timeEstimate: z.string().max(50),
  })).max(20),
  expectedOutcome: z.string().max(500),
  troubleshooting: z.array(z.string().max(300)).max(5),
  nextSteps: z.array(z.string().max(200)).max(3),
  estimatedTime: z.string().max(50),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});

// Support schema for help and Q&A
export const SupportSchema = BaseResponseSchema.extend({
  answer: z.string().max(2000),
  explanation: z.string().max(1000),
  steps: z.array(z.string().max(300)).max(5),
  resources: z.array(z.string().max(300)).max(3),
  relatedQuestions: z.array(z.string().max(300)).max(3),
  escalation: z.string().max(500),
  category: z.string().max(100),
});

// Analysis schema for data insights
export const AnalysisSchema = BaseResponseSchema.extend({
  summary: z.string().max(1000),
  insights: z.array(z.string().max(300)).max(5),
  trends: z.array(z.string().max(300)).max(5),
  recommendations: z.array(z.string().max(300)).max(5),
  dataQuality: z.string().max(300),
  limitations: z.string().max(500),
  nextSteps: z.array(z.string().max(300)).max(3),
});

// General teaching schema (fallback)
export const TeachingSchema = BaseResponseSchema.extend({
  title: z.string().max(200),
  content: z.string().max(2000),
  examples: z.array(z.string().max(500)).max(3),
  keyPoints: z.array(z.string().max(200)).max(3),
  nextSteps: z.array(z.string().max(300)).max(3),
});

// PROPOSED ACTION SCHEMA (requires human confirmation)
// This is the ONLY schema that can suggest actions, but they must be confirmed
export const ProposedActionSchema = z.object({
  proposedAction: z.object({
    type: z.enum(['create', 'update', 'delete', 'send', 'schedule']),
    target: z.string().max(200),
    description: z.string().max(500),
    reason: z.string().max(500),
    impact: z.enum(['high', 'medium', 'low']),
    reversible: z.boolean(),
    requiresConfirmation: z.literal(true), // Always true!
    confirmationMessage: z.string().max(300),
    estimatedTime: z.string().max(100),
  }),
  alternatives: z.array(z.object({
    type: z.string(),
    description: z.string().max(300),
    safer: z.boolean(),
  })).max(3),
  risks: z.array(z.string().max(300)).max(5),
  confidence: z.number().min(0).max(1),
});

// Input schemas for type safety
export const AITutorRequestSchema = z.object({
  type: z.enum(['explain', 'draft', 'recommend', 'tutorial', 'support', 'analyze']),
  context: z.any(), // Any context, will be redacted
  userLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  options: z.object({
    includeExamples: z.boolean().optional(),
    includeNextSteps: z.boolean().optional(),
    tone: z.enum(['professional', 'friendly', 'technical', 'empathetic']).optional(),
    maxLength: z.number().min(50).max(5000).optional(),
  }).optional(),
});

// Response wrapper schema
export const AITutorResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  metadata: z.object({
    processingTime: z.number(),
    llmUsed: z.boolean(),
    schema: z.string(),
    isSuggestion: z.literal(true), // Always true - never a direct action
  }),
});

// Safety validation schema
export const SafetyCheckSchema = z.object({
  isReadOnly: z.literal(true),
  hasNoSideEffects: z.literal(true),
  requiresHumanConfirmation: z.boolean().optional(),
  containsNoSecrets: z.literal(true),
  cannotExecuteTools: z.literal(true),
});

// Export type definitions
export type Explanation = z.infer<typeof ExplanationSchema>;
export type Draft = z.infer<typeof DraftSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type Tutorial = z.infer<typeof TutorialSchema>;
export type Support = z.infer<typeof SupportSchema>;
export type Analysis = z.infer<typeof AnalysisSchema>;
export type Teaching = z.infer<typeof TeachingSchema>;
export type ProposedAction = z.infer<typeof ProposedActionSchema>;
export type AITutorRequest = z.infer<typeof AITutorRequestSchema>;
export type AITutorResponse = z.infer<typeof AITutorResponseSchema>;
export type SafetyCheck = z.infer<typeof SafetyCheckSchema>;

// Schema validation functions
export function validateExplanation(data: unknown): Explanation {
  return ExplanationSchema.parse(data);
}

export function validateDraft(data: unknown): Draft {
  return DraftSchema.parse(data);
}

export function validateRecommendation(data: unknown): Recommendation {
  return RecommendationSchema.parse(data);
}

export function validateTutorial(data: unknown): Tutorial {
  return TutorialSchema.parse(data);
}

export function validateSupport(data: unknown): Support {
  return SupportSchema.parse(data);
}

export function validateAnalysis(data: unknown): Analysis {
  return AnalysisSchema.parse(data);
}

export function validateProposedAction(data: unknown): ProposedAction {
  return ProposedActionSchema.parse(data);
}

export function validateSafety(data: unknown): SafetyCheck {
  return SafetyCheckSchema.parse(data);
}

// Schema registry for dynamic validation
export const SchemaRegistry = {
  explain: ExplanationSchema,
  draft: DraftSchema,
  recommend: RecommendationSchema,
  tutorial: TutorialSchema,
  support: SupportSchema,
  analyze: AnalysisSchema,
  proposed_action: ProposedActionSchema,
  default: TeachingSchema,
};

export function validateByType(type: string, data: unknown): any {
  const schema = SchemaRegistry[type as keyof typeof SchemaRegistry] || SchemaRegistry.default;
  return schema.parse(data);
}
