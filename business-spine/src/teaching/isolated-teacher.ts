import { LLMService } from '../llm/service.js';
import { Logger } from '../utils/logger.js';

export interface TeachingRequest {
  type: 'explain_system' | 'explain_intent' | 'teach_concept' | 'explain_workflow' | 'explain_decision';
  topic: string;
  context?: any;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface TeachingResponse {
  success: boolean;
  explanation?: {
    title: string;
    content: string;
    examples: string[];
    keyPoints: string[];
    relatedTopics: string[];
    userLevel: string;
    estimatedReadTime: string;
  };
  error?: string;
  metadata: {
    processingTime: number;
    llmUsed: boolean;
    isIsolated: true;
  };
}

/**
 * ISOLATED TEACHING SYSTEM
 * 
 * This system is completely separate from the core business logic.
 * It cannot:
 * - Modify any system state
 * - Access business data
 * - Execute operations
 * - Affect performance
 * - Cause instability
 * 
 * It can only:
 * - Provide educational content
 * - Explain system concepts
 * - Teach business automation
 * - Answer questions about how things work
 */
export class IsolatedTeacher {
  private llmService?: LLMService;
  private logger: Logger;
  private systemDocumentation: Map<string, string>;

  constructor(llmConfig?: any) {
    this.logger = new Logger({ level: 'info', format: 'simple' });
    this.systemDocumentation = new Map();
    
    // Initialize LLM service if configured (optional)
    if (llmConfig) {
      this.llmService = new LLMService(llmConfig, true); // fallback enabled
    }

    // Load system documentation (static, no external dependencies)
    this.loadSystemDocumentation();
  }

  private loadSystemDocumentation(): void {
    // Static documentation about the system - no external calls
    this.systemDocumentation.set('intent_detection', `
The system uses pattern matching to understand user requests. It looks for specific keywords and patterns
in the user's message to determine what business operation they want to perform.

How it works:
1. User message is normalized (lowercase, trimmed)
2. System checks against predefined patterns for each business domain
3. Each pattern has a confidence score
4. Highest confidence patterns are returned as detected intents

Business domains:
- booking: appointments, scheduling, cancellations
- crm: customer management, relationships
- payments: invoices, refunds, transactions
- marketing: campaigns, communications
- analytics: reports, insights, metrics
- admin_security: user management, security

Example patterns:
- "book" → booking intent (75% confidence)
- "cancel" → cancellation intent (80% confidence)
- "invoice" → payment intent (70% confidence)
    `);

    this.systemDocumentation.set('business_automation', `
Business automation is the use of technology to streamline and optimize business processes.
This system provides automation for various business domains without manual intervention.

Key benefits:
- Consistency: Same process every time
- Efficiency: Faster than manual processing
- Accuracy: Reduces human error
- Availability: 24/7 operation
- Audit trail: Every action is logged

Core components:
1. Intent detection: Understanding what user wants
2. Entity extraction: Pulling relevant data
3. Workflow execution: Performing the operation
4. Response generation: Communicating results

The system follows a deterministic approach - same input always produces same output.
    `);

    this.systemDocumentation.set('workflow_execution', `
Once an intent is detected, the system executes a predefined workflow.
Workflows are sequences of steps that accomplish business operations.

Workflow types:
- Ask: Request missing information from user
- Confirm: Get user confirmation before proceeding
- Execute: Perform business operation
- Respond: Provide result to user

Safety features:
- Input validation: All inputs are validated before processing
- Permission checks: User must have appropriate permissions
- Audit logging: Every action is recorded
- Rollback capability: Operations can be undone if needed

Example booking workflow:
1. Extract: client, service, time, duration
2. Validate: client exists, service available, time slot free
3. Execute: create booking in system
4. Respond: confirmation with booking details
    `);

    this.systemDocumentation.set('smart_suggestions', `
The system provides intelligent suggestions to help optimize business operations.
These are based on rule-based analysis of business patterns and best practices.

Types of suggestions:
- Predictive scheduling: Optimize appointment timing
- Client behavior: Identify retention opportunities
- Dynamic pricing: Revenue optimization insights
- Segmentation: Customer grouping strategies

How suggestions work:
1. Analyze current business context
2. Apply rule-based patterns
3. Generate actionable recommendations
4. Provide implementation steps

Suggestions are designed to be helpful but optional - users can accept or ignore them.
    `);
  }

  async teach(request: TeachingRequest): Promise<TeachingResponse> {
    const startTime = Date.now();
    
    try {
      // This is a READ-ONLY operation - no system modification
      let explanation;

      switch (request.type) {
        case 'explain_system':
          explanation = await this.explainSystem(request.topic, request.userLevel);
          break;
        case 'explain_intent':
          explanation = await this.explainIntent(request.topic, request.context, request.userLevel);
          break;
        case 'teach_concept':
          explanation = await this.teachConcept(request.topic, request.userLevel);
          break;
        case 'explain_workflow':
          explanation = await this.explainWorkflow(request.topic, request.userLevel);
          break;
        case 'explain_decision':
          explanation = await this.explainDecision(request.topic, request.context, request.userLevel);
          break;
        default:
          throw new Error(`Unknown teaching request type: ${request.type}`);
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        explanation,
        metadata: {
          processingTime,
          llmUsed: !!this.llmService && await this.llmService.isAvailable(),
          isIsolated: true
        }
      };

    } catch (error: any) {
      this.logger.error('Teaching operation failed', error);
      
      return {
        success: false,
        error: error.message,
        metadata: {
          processingTime: Date.now() - startTime,
          llmUsed: false,
          isIsolated: true
        }
      };
    }
  }

  private async explainSystem(topic: string, userLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<any> {
    const staticContent = this.systemDocumentation.get(topic);
    
    if (this.llmService && await this.llmService.isAvailable()) {
      try {
        const systemPrompt = this.getSystemPrompt(userLevel, 'system');
        const userPrompt = `Explain this business automation system topic: ${topic}

Static documentation: ${staticContent}

Provide a comprehensive explanation as JSON with:
{
  "title": "Brief descriptive title",
  "content": "Main explanation",
  "examples": ["Example 1", "Example 2"],
  "keyPoints": ["Key point 1", "Key point 2"],
  "relatedTopics": ["Related topic 1"],
  "userLevel": "${userLevel}",
  "estimatedReadTime": "2-3 minutes"
}`;

        const response = await this.llmService.chat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]);

        return this.parseTeachingResponse(response.content, topic, userLevel);
      } catch (error) {
        this.logger.warn('LLM explanation failed, using static content', error);
      }
    }

    // Fallback to static content
    return this.getStaticExplanation(topic, staticContent, userLevel);
  }

  private async explainIntent(intent: string, context: any, userLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<any> {
    const staticContent = `
Intent detection is how the system understands what users want to do.
The intent "${intent}" would be detected using pattern matching.

Process:
1. User message is analyzed
2. Patterns are matched against business domains
3. Confidence scores are calculated
4. Best matching intent is selected

For intent "${intent}":
- Domain: ${intent.split('.')[0] || 'unknown'}
- Action: ${intent.split('.')[1] || 'unknown'}
- Confidence: Determined by pattern match quality
    `;

    if (this.llmService && await this.llmService.isAvailable()) {
      try {
        const systemPrompt = this.getSystemPrompt(userLevel, 'intent');
        const userPrompt = `Explain this intent detection: ${intent}

Context: ${JSON.stringify(context || {}, null, 2)}

Static info: ${staticContent}

Provide explanation as JSON.`;

        const response = await this.llmService.chat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]);

        return this.parseTeachingResponse(response.content, 'intent_detection', userLevel);
      } catch (error) {
        this.logger.warn('LLM intent explanation failed, using static content', error);
      }
    }

    return this.getStaticExplanation('intent_detection', staticContent, userLevel);
  }

  private async teachConcept(concept: string, userLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<any> {
    const staticContent = this.systemDocumentation.get(concept) || `
${concept} is a business automation concept.
This system uses ${concept} to provide reliable business process automation.

Key aspects:
- Automation reduces manual work
- Processes become consistent and repeatable
- Error rates decrease significantly
- Business operations become more efficient

The system implements ${concept} using rule-based logic for maximum reliability.
    `;

    if (this.llmService && await this.llmService.isAvailable()) {
      try {
        const systemPrompt = this.getSystemPrompt(userLevel, 'concept');
        const userPrompt = `Teach this business automation concept: ${concept}

Static documentation: ${staticContent}

Provide educational content as JSON.`;

        const response = await this.llmService.chat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]);

        return this.parseTeachingResponse(response.content, concept, userLevel);
      } catch (error) {
        this.logger.warn('LLM concept teaching failed, using static content', error);
      }
    }

    return this.getStaticExplanation(concept, staticContent, userLevel);
  }

  private async explainWorkflow(workflow: string, userLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<any> {
    const staticContent = this.systemDocumentation.get('workflow_execution') || `
Workflows are sequences of steps that accomplish business operations.
The workflow "${workflow}" executes specific business logic.

Workflow steps:
1. Ask: Request missing information
2. Confirm: Get user confirmation
3. Execute: Perform business operation
4. Respond: Provide results

Each workflow is designed to be:
- Deterministic: Same input = same output
- Safe: Validated and permission-checked
- Auditable: Every step is logged
- Recoverable: Can be rolled back if needed
    `;

    if (this.llmService && await this.llmService.isAvailable()) {
      try {
        const systemPrompt = this.getSystemPrompt(userLevel, 'workflow');
        const userPrompt = `Explain this workflow: ${workflow}

Static info: ${staticContent}

Provide explanation as JSON.`;

        const response = await this.llmService.chat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]);

        return this.parseTeachingResponse(response.content, 'workflow_execution', userLevel);
      } catch (error) {
        this.logger.warn('LLM workflow explanation failed, using static content', error);
      }
    }

    return this.getStaticExplanation('workflow_execution', staticContent, userLevel);
  }

  private async explainDecision(decision: string, context: any, userLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<any> {
    const staticContent = `
System decisions are made using rule-based logic for maximum reliability.
The decision "${decision}" follows deterministic business rules.

Decision process:
1. Input validation ensures data quality
2. Business rules are applied consistently
3. Permissions are verified
4. Audit trail is created
5. Result is returned

This approach ensures:
- No unexpected behavior
- Complete auditability
- Predictable outcomes
- System stability
    `;

    if (this.llmService && await this.llmService.isAvailable()) {
      try {
        const systemPrompt = this.getSystemPrompt(userLevel, 'decision');
        const userPrompt = `Explain this system decision: ${decision}

Context: ${JSON.stringify(context || {}, null, 2)}

Static info: ${staticContent}

Provide explanation as JSON.`;

        const response = await this.llmService.chat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]);

        return this.parseTeachingResponse(response.content, 'decision_making', userLevel);
      } catch (error) {
        this.logger.warn('LLM decision explanation failed, using static content', error);
      }
    }

    return this.getStaticExplanation('decision_making', staticContent, userLevel);
  }

  private getSystemPrompt(userLevel: string, type: string): string {
    const levelInstructions = {
      beginner: 'Explain in simple terms with clear examples. Avoid technical jargon. Focus on practical understanding.',
      intermediate: 'Provide detailed explanations with some technical details. Include best practices and common patterns.',
      advanced: 'Go deep into technical details. Include edge cases, performance considerations, and advanced concepts.'
    };

    const typeInstructions = {
      system: 'You are explaining business automation system concepts.',
      intent: 'You are explaining how the system understands user intentions.',
      concept: 'You are teaching business automation concepts.',
      workflow: 'You are explaining business process workflows.',
      decision: 'You are explaining system decision-making processes.'
    };

    return `You are an expert teacher for business automation systems. ${typeInstructions[type as keyof typeof typeInstructions]}

${levelInstructions[userLevel as keyof typeof levelInstructions]}

Always respond with valid JSON containing:
{
  "title": "Brief descriptive title",
  "content": "Main explanation",
  "examples": ["Example 1", "Example 2"],
  "keyPoints": ["Key point 1", "Key point 2"],
  "relatedTopics": ["Related topic 1"],
  "userLevel": "${userLevel}",
  "estimatedReadTime": "2-3 minutes"
}`;
  }

  private parseTeachingResponse(content: string, topic: string, userLevel: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          userLevel
        };
      }
    } catch (error) {
      this.logger.error('Failed to parse teaching response', error);
    }

    return {
      title: `About ${topic}`,
      content: content,
      examples: [`Example of ${topic}`],
      keyPoints: [`Key point about ${topic}`],
      relatedTopics: ['business automation'],
      userLevel,
      estimatedReadTime: '2-3 minutes'
    };
  }

  private getStaticExplanation(topic: string, content: string, userLevel: string): any {
    return {
      title: `Understanding ${topic}`,
      content: content || `${topic} is a business automation concept used in this system.`,
      examples: [
        `Example of ${topic} in practice`,
        `How ${topic} helps business operations`
      ],
      keyPoints: [
        `${topic} improves business efficiency`,
        `${topic} ensures process consistency`,
        `${topic} reduces manual errors`
      ],
      relatedTopics: ['business automation', 'workflow optimization', 'process reliability'],
      userLevel,
      estimatedReadTime: '2-3 minutes'
    };
  }

  // Read-only methods - no system modification possible
  async getAvailableTopics(): Promise<string[]> {
    return Array.from(this.systemDocumentation.keys());
  }

  async isLLMAvailable(): Promise<boolean> {
    return this.llmService ? await this.llmService.isAvailable() : false;
  }

  async getSystemInfo(): Promise<{
    type: 'isolated_teacher';
    capabilities: string[];
    llmAvailable: boolean;
    safety: 'read_only';
    impact: 'none';
  }> {
    return {
      type: 'isolated_teacher',
      capabilities: ['explain_system', 'teach_concept', 'explain_workflow', 'explain_decision'],
      llmAvailable: await this.isLLMAvailable(),
      safety: 'read_only',
      impact: 'none'
    };
  }

  // This method cannot modify system state - it's purely informational
  async getDocumentation(topic?: string): Promise<string | Record<string, string>> {
    if (topic) {
      return this.systemDocumentation.get(topic) || `No documentation found for: ${topic}`;
    }
    return Object.fromEntries(this.systemDocumentation);
  }
}
