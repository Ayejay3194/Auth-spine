import { LLMProvider, OpenAIProvider, AnthropicProvider, LocalProvider } from './provider.js';
import { LLMConfig, LLMResponse, LLMMessage, TeacherExplanation } from './types.js';
import { Logger } from '../utils/logger.js';

export class LLMService {
  private provider: LLMProvider;
  private logger: Logger;
  private fallbackEnabled: boolean;

  constructor(config: LLMConfig, fallbackEnabled = true) {
    this.logger = new Logger({ level: 'info', format: 'simple' });
    this.fallbackEnabled = fallbackEnabled;
    
    this.provider = this.createProvider(config);
  }

  private createProvider(config: LLMConfig): LLMProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'local':
        return new LocalProvider(config);
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const response = await this.provider.chat(messages);
      this.logger.info(`LLM response generated using ${this.provider.constructor.name}`);
      return response;
    } catch (error: any) {
      this.logger.error('LLM chat failed', error);
      
      if (this.fallbackEnabled) {
        return this.getFallbackResponse(messages);
      }
      
      throw error;
    }
  }

  async detectIntent(text: string, context: any): Promise<Array<{spine: string; name: string; confidence: number; match: string}>> {
    const systemPrompt = `You are an intent detection system for a business automation platform. 
Available spines: booking, crm, payments, marketing, analytics, admin_security.

Analyze the user's message and return a JSON array of detected intents with:
- spine: the business domain
- name: the specific intent (e.g., book, cancel, create_invoice, refund, etc.)
- confidence: number between 0 and 1
- match: brief explanation of what matched

Return only valid JSON, no explanations.`;

    const userPrompt = `User message: "${text}"
Context: ${JSON.stringify(context, null, 2)}

Detect intents and return JSON array:`;

    try {
      const response = await this.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      // Parse JSON response
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error('Intent detection failed', error);
    }

    return [];
  }

  async extractEntities(intent: any, text: string, context: any): Promise<{entities: Record<string, unknown>; missing: string[]}> {
    const systemPrompt = `You are an entity extraction system for business automation.
Extract relevant entities from the user's message based on the detected intent.

Common entities to extract:
- clientQuery: client name or email
- service: service type
- startISO: start time in ISO format
- durationMin: duration in minutes
- amount: monetary amount
- bookingId: booking identifier
- invoiceId: invoice identifier
- email: email address
- dateISO: date in ISO format
- time: time
- dateTimeISO: date and time in ISO format

Return JSON with:
- entities: extracted key-value pairs
- missing: array of required entity names that couldn't be extracted

Return only valid JSON, no explanations.`;

    const userPrompt = `Intent: ${JSON.stringify(intent)}
Message: "${text}"
Context: ${JSON.stringify(context, null, 2)}

Extract entities and return JSON:`;

    try {
      const response = await this.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error('Entity extraction failed', error);
    }

    return { entities: {}, missing: [] };
  }

  async explainOperation(operation: string, context: any, result: any): Promise<TeacherExplanation> {
    const systemPrompt = `You are a helpful business operations teacher. Explain what happened, why it happened, and what to consider next.

Provide a JSON response with:
- operation: what was performed
- reasoning: why it was done this way
- confidence: how confident you are (0-1)
- alternatives: other approaches that could work
- nextSteps: recommended follow-up actions

Be educational and practical. Return only valid JSON.`;

    const userPrompt = `Operation: ${operation}
Context: ${JSON.stringify(context, null, 2)}
Result: ${JSON.stringify(result, null, 2)}

Explain this operation as JSON:`;

    try {
      const response = await this.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error('Operation explanation failed', error);
    }

    return {
      operation,
      reasoning: 'Unable to generate explanation',
      confidence: 0,
      alternatives: [],
      nextSteps: []
    };
  }

  async generateSmartSuggestions(context: any): Promise<Array<{
    id: string;
    engine: string;
    title: string;
    message: string;
    severity: "info" | "warn" | "critical";
    createdAt: string;
    why: string[];
    actions?: Array<{ label: string; intent: string; payload?: Record<string, unknown> }>;
  }>> {
    const systemPrompt = `You are a business intelligence assistant. Analyze the context and provide smart suggestions.

Return a JSON array of suggestions with:
- id: unique identifier
- engine: "llm_smart"
- title: brief title
- message: detailed suggestion
- severity: "info" | "warn" | "critical"
- createdAt: current ISO timestamp
- why: array of reasons
- actions: array of suggested actions with label and intent

Focus on business optimization, risk prevention, and opportunities. Return only valid JSON.`;

    const userPrompt = `Business Context: ${JSON.stringify(context, null, 2)}

Generate smart suggestions as JSON array:`;

    try {
      const response = await this.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return suggestions.map((s: any, i: number) => ({
          ...s,
          id: s.id || `llm_${Date.now()}_${i}`,
          engine: 'llm_smart',
          createdAt: s.createdAt || new Date().toISOString()
        }));
      }
    } catch (error) {
      this.logger.error('Smart suggestions generation failed', error);
    }

    return [];
  }

  async isAvailable(): Promise<boolean> {
    return await this.provider.isAvailable();
  }

  private getFallbackResponse(messages: LLMMessage[]): LLMResponse {
    const lastMessage = messages[messages.length - 1];
    return {
      content: `I'm unable to process your request right now: "${lastMessage?.content}". Please try again later or use a simpler command.`,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      model: 'fallback',
      finishReason: 'fallback'
    };
  }

  async switchProvider(config: LLMConfig): Promise<void> {
    this.provider = this.createProvider(config);
    this.logger.info(`Switched to ${config.provider} provider`);
  }
}
