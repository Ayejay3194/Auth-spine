import { LLMService } from '../llm/service.js';
import { Logger } from '../utils/logger.js';
import { TeacherRequest, TeacherResponse, TeacherExplanation } from './types.js';

export class TeacherService {
  private llmService?: LLMService;
  private logger: Logger;

  constructor(llmService?: LLMService) {
    this.llmService = llmService;
    this.logger = new Logger({ level: 'info', format: 'simple' });
  }

  async teach(request: TeacherRequest): Promise<TeacherResponse> {
    const startTime = Date.now();
    
    try {
      let explanation: TeacherExplanation;

      switch (request.type) {
        case 'explain_operation':
          explanation = await this.explainOperation(request);
          break;
        case 'explain_intent':
          explanation = await this.explainIntent(request);
          break;
        case 'explain_suggestion':
          explanation = await this.explainSuggestion(request);
          break;
        case 'explain_decision':
          explanation = await this.explainDecision(request);
          break;
        case 'teach_concept':
          explanation = await this.teachConcept(request);
          break;
        default:
          return {
            success: false,
            error: `Unknown teacher request type: ${request.type}`
          };
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        explanation,
        metadata: {
          processingTime,
          llmUsed: !!(this.llmService && await this.llmService.isAvailable()),
          confidence: explanation.confidence
        }
      };

    } catch (error: any) {
      this.logger.error('Teacher service failed', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  private async explainOperation(request: TeacherRequest): Promise<TeacherExplanation> {
    const userLevel = request.userLevel || 'intermediate';
    
    if (this.llmService && await this.llmService.isAvailable()) {
      try {
        const systemPrompt = this.getSystemPrompt(userLevel, 'operation');
        const userPrompt = this.getOperationPrompt(request);

        const response = await this.llmService.chat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]);

        return this.parseTeacherResponse(response.content, 'explain_operation', userLevel);
      } catch (error) {
        this.logger.warn('LLM explanation failed, using fallback', error);
      }
    }

    return this.getFallbackOperationExplanation(request, userLevel);
  }

  private async explainIntent(request: TeacherRequest): Promise<TeacherExplanation> {
    const userLevel = request.userLevel || 'intermediate';
    
    if (this.llmService && await this.llmService.isAvailable()) {
      try {
        const systemPrompt = this.getSystemPrompt(userLevel, 'intent');
        const userPrompt = this.getIntentPrompt(request);

        const response = await this.llmService.chat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]);

        return this.parseTeacherResponse(response.content, 'explain_intent', userLevel);
      } catch (error) {
        this.logger.warn('LLM explanation failed, using fallback', error);
      }
    }

    return this.getFallbackIntentExplanation(request, userLevel);
  }

  private async explainSuggestion(request: TeacherRequest): Promise<TeacherExplanation> {
    const userLevel = request.userLevel || 'intermediate';
    
    if (this.llmService && await this.llmService.isAvailable()) {
      try {
        const systemPrompt = this.getSystemPrompt(userLevel, 'suggestion');
        const userPrompt = this.getSuggestionPrompt(request);

        const response = await this.llmService.chat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]);

        return this.parseTeacherResponse(response.content, 'explain_suggestion', userLevel);
      } catch (error) {
        this.logger.warn('LLM explanation failed, using fallback', error);
      }
    }

    return this.getFallbackSuggestionExplanation(request, userLevel);
  }

  private async explainDecision(request: TeacherRequest): Promise<TeacherExplanation> {
    const userLevel = request.userLevel || 'intermediate';
    
    if (this.llmService && await this.llmService.isAvailable()) {
      try {
        const systemPrompt = this.getSystemPrompt(userLevel, 'decision');
        const userPrompt = this.getDecisionPrompt(request);

        const response = await this.llmService.chat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]);

        return this.parseTeacherResponse(response.content, 'explain_decision', userLevel);
      } catch (error) {
        this.logger.warn('LLM explanation failed, using fallback', error);
      }
    }

    return this.getFallbackDecisionExplanation(request, userLevel);
  }

  private async teachConcept(request: TeacherRequest): Promise<TeacherExplanation> {
    const userLevel = request.userLevel || 'intermediate';
    
    if (this.llmService && await this.llmService.isAvailable()) {
      try {
        const systemPrompt = this.getSystemPrompt(userLevel, 'concept');
        const userPrompt = this.getConceptPrompt(request);

        const response = await this.llmService.chat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]);

        return this.parseTeacherResponse(response.content, 'teach_concept', userLevel);
      } catch (error) {
        this.logger.warn('LLM explanation failed, using fallback', error);
      }
    }

    return this.getFallbackConceptExplanation(request, userLevel);
  }

  private getSystemPrompt(userLevel: string, type: string): string {
    const levelInstructions = {
      beginner: 'Explain in simple terms with clear examples. Avoid jargon. Focus on practical understanding.',
      intermediate: 'Provide detailed explanations with some technical details. Include best practices and common patterns.',
      advanced: 'Go deep into technical details. Include edge cases, performance considerations, and advanced concepts.'
    };

    const typeInstructions = {
      operation: 'You are explaining business operations and workflows in a business automation platform.',
      intent: 'You are explaining how the system understands user intentions and commands.',
      suggestion: 'You are explaining AI-generated business insights and recommendations.',
      decision: 'You are explaining the reasoning behind system decisions and recommendations.',
      concept: 'You are teaching business automation concepts and platform features.'
    };

    return `You are an expert teacher for business automation systems. ${typeInstructions[type as keyof typeof typeInstructions]}

${levelInstructions[userLevel as keyof typeof levelInstructions]}

Always respond with valid JSON containing:
{
  "type": "explanation_type",
  "title": "Brief descriptive title",
  "explanation": "Main explanation",
  "reasoning": "Why this works or why it's important",
  "confidence": 0.8,
  "examples": ["Example 1", "Example 2"],
  "alternatives": ["Alternative approach 1"],
  "nextSteps": ["Step 1", "Step 2"],
  "relatedConcepts": ["Related concept 1"],
  "userLevel": "${userLevel}",
  "estimatedTime": "2-3 minutes"
}`;
  }

  private getOperationPrompt(request: TeacherRequest): string {
    return `Explain this business operation:
Operation: ${request.operation}
Context: ${JSON.stringify(request.context || {}, null, 2)}
Result: ${JSON.stringify(request.result || {}, null, 2)}

Provide a comprehensive explanation as JSON.`;
  }

  private getIntentPrompt(request: TeacherRequest): string {
    return `Explain this intent detection:
Intent: ${JSON.stringify(request.intent || {}, null, 2)}
Context: ${JSON.stringify(request.context || {}, null, 2)}

Explain how the system understood the user's request as JSON.`;
  }

  private getSuggestionPrompt(request: TeacherRequest): string {
    return `Explain this AI-generated suggestion:
Suggestion: ${JSON.stringify(request.suggestion || {}, null, 2)}
Context: ${JSON.stringify(request.context || {}, null, 2)}

Explain why this suggestion was made and how to act on it as JSON.`;
  }

  private getDecisionPrompt(request: TeacherRequest): string {
    return `Explain this system decision:
Operation: ${request.operation}
Context: ${JSON.stringify(request.context || {}, null, 2)}
Result: ${JSON.stringify(request.result || {}, null, 2)}

Explain the reasoning behind this decision as JSON.`;
  }

  private getConceptPrompt(request: TeacherRequest): string {
    return `Teach this business automation concept:
Concept: ${request.concept}
Context: ${JSON.stringify(request.context || {}, null, 2)}

Provide a comprehensive lesson as JSON.`;
  }

  private parseTeacherResponse(content: string, type: string, userLevel: string): TeacherExplanation {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          type,
          userLevel
        };
      }
    } catch (error) {
      this.logger.error('Failed to parse teacher response', error);
    }

    return {
      type,
      title: 'Explanation Available',
      explanation: content,
      reasoning: 'Generated by AI assistant',
      confidence: 0.7,
      userLevel,
      estimatedTime: '1-2 minutes'
    };
  }

  private getFallbackOperationExplanation(request: TeacherRequest, userLevel: string): TeacherExplanation {
    return {
      type: 'explain_operation',
      title: `Operation: ${request.operation || 'Unknown'}`,
      explanation: 'This operation was processed by the business automation system. The system analyzed the request, extracted relevant information, and executed the appropriate business logic.',
      reasoning: 'The system follows predefined workflows to ensure consistent and reliable business operations.',
      confidence: 0.6,
      examples: [`Example: "${request.operation}" might involve updating records, sending notifications, or processing data.`],
      alternatives: ['Manual processing', 'Alternative workflows'],
      nextSteps: ['Review the operation result', 'Verify the outcome meets expectations'],
      relatedConcepts: ['Business workflows', 'Automation rules'],
      userLevel,
      estimatedTime: '1-2 minutes'
    };
  }

  private getFallbackIntentExplanation(request: TeacherRequest, userLevel: string): TeacherExplanation {
    return {
      type: 'explain_intent',
      title: 'Intent Recognition',
      explanation: 'The system analyzed your input to determine what you wanted to accomplish. It uses pattern matching and context to understand your request.',
      reasoning: 'Intent recognition helps the system route your request to the appropriate business module and execute the right actions.',
      confidence: 0.6,
      examples: ['"Book appointment" → booking intent', '"Create invoice" → payment intent'],
      alternatives: ['Menu-based selection', 'Command-line interfaces'],
      nextSteps: ['Try different phrasings', 'Be more specific about what you want'],
      relatedConcepts: ['Natural language processing', 'Business domains'],
      userLevel,
      estimatedTime: '1-2 minutes'
    };
  }

  private getFallbackSuggestionExplanation(request: TeacherRequest, userLevel: string): TeacherExplanation {
    return {
      type: 'explain_suggestion',
      title: 'AI Business Suggestion',
      explanation: 'The system analyzed your business data and generated this suggestion to help optimize your operations.',
      reasoning: 'AI suggestions are based on patterns, best practices, and business intelligence to help you make better decisions.',
      confidence: 0.6,
      examples: ['Schedule optimization suggestions', 'Client retention recommendations'],
      alternatives: ['Manual analysis', 'Business consultant review'],
      nextSteps: ['Review the suggestion', 'Implement if beneficial', 'Monitor results'],
      relatedConcepts: ['Business intelligence', 'Predictive analytics'],
      userLevel,
      estimatedTime: '1-2 minutes'
    };
  }

  private getFallbackDecisionExplanation(request: TeacherRequest, userLevel: string): TeacherExplanation {
    return {
      type: 'explain_decision',
      title: 'System Decision',
      explanation: 'The system made this decision based on business rules, context, and available information to ensure optimal outcomes.',
      reasoning: 'Automated decisions help maintain consistency, reduce errors, and follow established business policies.',
      confidence: 0.6,
      examples: ['Approval workflows', 'Risk assessment decisions'],
      alternatives: ['Manual review', 'Supervisor approval'],
      nextSteps: ['Understand the decision rationale', 'Verify if it meets business needs'],
      relatedConcepts: ['Business rules engine', 'Decision trees'],
      userLevel,
      estimatedTime: '1-2 minutes'
    };
  }

  private getFallbackConceptExplanation(request: TeacherRequest, userLevel: string): TeacherExplanation {
    return {
      type: 'teach_concept',
      title: `Concept: ${request.concept || 'Business Automation'}`,
      explanation: 'Business automation involves using technology to streamline and optimize business processes, reducing manual work and improving efficiency.',
      reasoning: 'Understanding automation concepts helps you leverage the platform more effectively and make better business decisions.',
      confidence: 0.6,
      examples: ['Automated appointment scheduling', 'Automated invoice generation'],
      alternatives: ['Manual processes', 'Semi-automated workflows'],
      nextSteps: ['Explore platform features', 'Start with simple automations'],
      relatedConcepts: ['Workflow design', 'Process optimization'],
      userLevel,
      estimatedTime: '2-3 minutes'
    };
  }

  async setLLMService(llmService: LLMService): Promise<void> {
    this.llmService = llmService;
    this.logger.info('Teacher service LLM updated');
  }

  isLLMAvailable(): Promise<boolean> {
    return this.llmService ? this.llmService.isAvailable() : Promise.resolve(false);
  }
}
