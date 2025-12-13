import { LLMService } from '../llm/service.js';
import { Logger } from '../utils/logger.js';
import { z } from 'zod';
import { 
  TeachingSchema, 
  DraftSchema, 
  ExplanationSchema, 
  RecommendationSchema,
  TutorialSchema,
  SupportSchema 
} from './schemas.js';
import { createSafeSnapshot } from './redaction.js';
import { generateRecommendations } from './recommendations.js';

/**
 * AI TUTOR - LLM as Teacher Layer
 * 
 * This module implements the "LLM as Teacher" pattern:
 * - Generates suggestions, not actions
 * - Provides explanations and drafts
 * - Never executes tools directly
 * - Uses read-only data snapshots
 * - Outputs structured JSON only
 * 
 * The LLM is the COACH, not the CASHIER.
 */
export interface AITutorRequest {
  type: 'explain' | 'draft' | 'recommend' | 'tutorial' | 'support' | 'analyze';
  context: any;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  options?: {
    includeExamples?: boolean;
    includeNextSteps?: boolean;
    tone?: 'professional' | 'friendly' | 'technical';
    maxLength?: number;
  };
}

export interface AITutorResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata: {
    processingTime: number;
    llmUsed: boolean;
    schema: string;
    isSuggestion: true; // Always true - never a direct action
  };
}

export class AITutor {
  private llmService: LLMService;
  private logger: Logger;

  constructor(llmService: LLMService) {
    this.llmService = llmService;
    this.logger = new Logger({ level: 'info', format: 'json' });
  }

  async teach(request: AITutorRequest): Promise<AITutorResponse> {
    const startTime = Date.now();
    
    try {
      // Create safe data snapshot (redacted)
      const safeContext = createSafeSnapshot(request.context);
      
      let result;
      let schemaName;

      switch (request.type) {
        case 'explain':
          result = await this.explain(safeContext, request.userLevel, request.options);
          schemaName = 'ExplanationSchema';
          break;
          
        case 'draft':
          result = await this.draft(safeContext, request.options);
          schemaName = 'DraftSchema';
          break;
          
        case 'recommend':
          result = await this.recommend(safeContext, request.userLevel, request.options);
          schemaName = 'RecommendationSchema';
          break;
          
        case 'tutorial':
          result = await this.tutorial(safeContext, request.userLevel, request.options);
          schemaName = 'TutorialSchema';
          break;
          
        case 'support':
          result = await this.support(safeContext, request.options);
          schemaName = 'SupportSchema';
          break;
          
        case 'analyze':
          result = await this.analyze(safeContext, request.userLevel, request.options);
          schemaName = 'TeachingSchema';
          break;
          
        default:
          throw new Error(`Unknown teaching type: ${request.type}`);
      }

      // Validate response against schema
      const validated = this.validateResponse(result, request.type);
      
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: validated,
        metadata: {
          processingTime,
          llmUsed: await this.llmService.isAvailable(),
          schema: schemaName,
          isSuggestion: true
        }
      };

    } catch (error: any) {
      this.logger.error('AI Tutor failed', error);
      
      return {
        success: false,
        error: error.message,
        metadata: {
          processingTime: Date.now() - startTime,
          llmUsed: false,
          schema: 'none',
          isSuggestion: true
        }
      };
    }
  }

  private async explain(context: any, userLevel = 'intermediate', options?: any): Promise<any> {
    const systemPrompt = `You are an expert business automation tutor. Explain concepts clearly based on user level.

User level: ${userLevel}
Tone: ${options?.tone || 'professional'}

You MUST respond with valid JSON matching this schema:
{
  "title": "Brief descriptive title",
  "explanation": "Clear explanation of what happened",
  "reasoning": "Why it works this way",
  "examples": ["Example 1", "Example 2"],
  "keyPoints": ["Key insight 1", "Key insight 2"],
  "nextSteps": ["Step 1", "Step 2"],
  "relatedTopics": ["Related concept 1"],
  "confidence": 0.8,
  "userLevel": "${userLevel}"
}

Explain the business situation or concept based on the context.`;

    const response = await this.llmService.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context: ${JSON.stringify(context, null, 2)}` }
    ]);

    return this.parseJSONResponse(response.content);
  }

  private async draft(context: any, options?: any): Promise<any> {
    const { draftType, targetAudience, purpose } = context;
    
    const systemPrompt = `You are a professional business writer. Draft content based on the request.

Draft type: ${draftType}
Audience: ${targetAudience}
Purpose: ${purpose}
Tone: ${options?.tone || 'professional'}

You MUST respond with valid JSON matching this schema:
{
  "title": "Draft title",
  "content": "Main content body",
  "subject": "Email subject line (if applicable)",
  "callToAction": "What reader should do next",
  "tone": "${options?.tone || 'professional'}",
  "wordCount": 250,
  "suggestions": ["Improvement 1", "Improvement 2"],
  "confidence": 0.8
}

Create a professional draft that achieves the stated purpose.`;

    const response = await this.llmService.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Draft request: ${JSON.stringify(context, null, 2)}` }
    ]);

    return this.parseJSONResponse(response.content);
  }

  private async recommend(context: any, userLevel = 'intermediate', options?: any): Promise<any> {
    // Use rule-based recommendations with LLM enhancement
    const baseRecommendations = generateRecommendations(context);
    
    if (await this.llmService.isAvailable()) {
      const systemPrompt = `You are a business advisor. Provide actionable recommendations.

User level: ${userLevel}
Focus on: ${context.focusArea || 'general improvement'}

You MUST respond with valid JSON matching this schema:
{
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "What to do and why",
      "impact": "high" | "medium" | "low",
      "effort": "high" | "medium" | "low",
      "timeline": "Estimated time to implement",
      "steps": ["Step 1", "Step 2"],
      "metrics": ["Success metric 1"],
      "confidence": 0.8
    }
  ],
  "summary": "Overall assessment",
  "priority": "Immediate focus areas",
  "userLevel": "${userLevel}"
}

Enhance these base recommendations with your insights: ${JSON.stringify(baseRecommendations, null, 2)}`;

      const response = await this.llmService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Context: ${JSON.stringify(context, null, 2)}` }
      ]);

      return this.parseJSONResponse(response.content);
    }

    return {
      recommendations: baseRecommendations,
      summary: "Based on business rules analysis",
      priority: "Review recommendations",
      userLevel
    };
  }

  private async tutorial(context: any, userLevel = 'intermediate', options?: any): Promise<any> {
    const { topic, goal } = context;
    
    const systemPrompt = `You are a patient tutor. Create step-by-step tutorials.

Topic: ${topic}
Goal: ${goal}
User level: ${userLevel}

You MUST respond with valid JSON matching this schema:
{
  "title": "Tutorial title",
  "description": "What user will learn",
  "prerequisites": ["Requirement 1"],
  "steps": [
    {
      "step": 1,
      "title": "Step title",
      "instruction": "Clear instruction",
      "why": "Why this step matters",
      "tips": "Helpful tips",
      "timeEstimate": "5 minutes"
    }
  ],
  "expectedOutcome": "What user will accomplish",
  "troubleshooting": ["Common issue 1"],
  "nextSteps": ["What to learn next"],
  "estimatedTime": "30 minutes",
  "difficulty": "beginner" | "intermediate" | "advanced"
}`;

    const response = await this.llmService.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Create tutorial for: ${JSON.stringify(context, null, 2)}` }
    ]);

    return this.parseJSONResponse(response.content);
  }

  private async support(context: any, options?: any): Promise<any> {
    const { question, category, urgency } = context;
    
    const systemPrompt = `You are a helpful support assistant. Provide clear answers.

Category: ${category}
Urgency: ${urgency}

You MUST respond with valid JSON matching this schema:
{
  "answer": "Direct answer to the question",
  "explanation": "Why this is the answer",
  "steps": ["Step 1 to resolve"],
  "resources": ["Helpful resource 1"],
  "relatedQuestions": ["Related question 1"],
  "escalation": "When to contact human support",
  "confidence": 0.8,
  "category": "${category}"
}

Answer the user question accurately and helpfully.`;

    const response = await this.llmService.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Question: ${question}\nContext: ${JSON.stringify(context, null, 2)}` }
    ]);

    return this.parseJSONResponse(response.content);
  }

  private async analyze(context: any, userLevel = 'intermediate', options?: any): Promise<any> {
    const { analysisType, data } = context;
    
    const systemPrompt = `You are a business analyst. Provide insights and analysis.

Analysis type: ${analysisType}
User level: ${userLevel}

You MUST respond with valid JSON matching this schema:
{
  "summary": "Key findings",
  "insights": ["Insight 1"],
  "trends": ["Trend 1"],
  "recommendations": ["Action 1"],
  "dataQuality": "Assessment of data quality",
  "limitations": "Analysis limitations",
  "confidence": 0.8,
  "nextSteps": ["Follow-up analysis 1"]
}`;

    const response = await this.llmService.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this data: ${JSON.stringify(data, null, 2)}` }
    ]);

    return this.parseJSONResponse(response.content);
  }

  private parseJSONResponse(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      this.logger.error('Failed to parse LLM response', error);
      throw new Error('Invalid response format from AI');
    }
  }

  private validateResponse(response: any, type: string): any {
    try {
      switch (type) {
        case 'explain':
          return ExplanationSchema.parse(response);
        case 'draft':
          return DraftSchema.parse(response);
        case 'recommend':
          return RecommendationSchema.parse(response);
        case 'tutorial':
          return TutorialSchema.parse(response);
        case 'support':
          return SupportSchema.parse(response);
        default:
          return TeachingSchema.parse(response);
      }
    } catch (error) {
      this.logger.error('Schema validation failed', error);
      // Return basic structure if validation fails
      return {
        ...response,
        _validationWarning: 'Schema validation failed'
      };
    }
  }

  // Helper methods for specific use cases
  async onboardUser(userContext: any): Promise<AITutorResponse> {
    return this.teach({
      type: 'tutorial',
      context: {
        topic: 'getting_started',
        goal: 'set up business profile',
        userContext
      },
      userLevel: 'beginner',
      options: { tone: 'friendly' }
    });
  }

  async explainReport(reportData: any): Promise<AITutorResponse> {
    return this.teach({
      type: 'explain',
      context: {
        reportType: reportData.type,
        metrics: reportData.metrics,
        period: reportData.period
      },
      userLevel: 'intermediate'
    });
  }

  async draftMarketingCopy(campaignData: any): Promise<AITutorResponse> {
    return this.teach({
      type: 'draft',
      context: {
        draftType: 'marketing_email',
        targetAudience: campaignData.audience,
        purpose: campaignData.goal,
        product: campaignData.product
      },
      options: { tone: 'professional' }
    });
  }

  async draftSupportReply(ticketData: any): Promise<AITutorResponse> {
    return this.teach({
      type: 'support',
      context: {
        question: ticketData.question,
        category: ticketData.category,
        urgency: ticketData.urgency,
        customerContext: ticketData.customer
      },
      options: { tone: 'empathetic' }
    });
  }

  async helpDeveloper(devContext: any): Promise<AITutorResponse> {
    return this.teach({
      type: 'support',
      context: {
        question: devContext.question,
        category: 'development',
        context: devContext.codeContext
      },
      userLevel: 'advanced',
      options: { tone: 'technical' }
    });
  }
}
