import { LLMConfig, LLMResponse, LLMError } from './types.js';

export abstract class LLMProvider {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  abstract chat(messages: Array<{role: 'system' | 'user' | 'assistant'; content: string}>): Promise<LLMResponse>;
  abstract isAvailable(): Promise<boolean>;
}

export class OpenAIProvider extends LLMProvider {
  private client: any;

  constructor(config: LLMConfig) {
    super(config);
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    // Dynamic import to avoid build issues
    import('openai').then(({ OpenAI }) => {
      this.client = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl
      });
    });
  }

  async chat(messages: Array<{role: 'system' | 'user' | 'assistant'; content: string}>): Promise<LLMResponse> {
    if (!this.client) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for client initialization
      if (!this.client) {
        throw new Error('OpenAI client not initialized');
      }
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4',
        messages,
        max_tokens: this.config.maxTokens || 1000,
        temperature: this.config.temperature || 0.7,
      });

      return {
        content: response.choices[0]?.message?.content || '',
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
        finishReason: response.choices[0]?.finish_reason,
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client?.models.list();
      return true;
    } catch {
      return false;
    }
  }

  private handleError(error: any): LLMError {
    if (error.status === 401) {
      return { code: 'auth_error', message: 'Invalid API key', type: 'auth_error' };
    }
    if (error.status === 429) {
      return { code: 'rate_limit', message: 'Rate limit exceeded', type: 'rate_limit' };
    }
    if (error.status === 400) {
      return { code: 'invalid_request', message: error.message, type: 'invalid_request' };
    }
    return { code: 'api_error', message: error.message, type: 'api_error' };
  }
}

export class AnthropicProvider extends LLMProvider {
  private client: any;

  constructor(config: LLMConfig) {
    super(config);
    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }
    // Dynamic import to avoid build issues
    import('@anthropic-ai/sdk').then(({ Anthropic }) => {
      this.client = new Anthropic({
        apiKey: config.apiKey,
        baseURL: config.baseUrl
      });
    });
  }

  async chat(messages: Array<{role: 'system' | 'user' | 'assistant'; content: string}>): Promise<LLMResponse> {
    if (!this.client) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for client initialization
      if (!this.client) {
        throw new Error('Anthropic client not initialized');
      }
    }

    try {
      // Convert messages format for Anthropic
      const systemMessage = messages.find(m => m.role === 'system')?.content || '';
      const conversationMessages = messages.filter(m => m.role !== 'system');

      const response = await this.client.messages.create({
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: this.config.maxTokens || 1000,
        temperature: this.config.temperature || 0.7,
        system: systemMessage,
        messages: conversationMessages,
      });

      return {
        content: response.content[0]?.type === 'text' ? response.content[0].text : '',
        usage: {
          promptTokens: response.usage?.input_tokens || 0,
          completionTokens: response.usage?.output_tokens || 0,
          totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
        },
        model: response.model,
        finishReason: response.stop_reason,
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch {
      return false;
    }
  }

  private handleError(error: any): LLMError {
    if (error.status === 401) {
      return { code: 'auth_error', message: 'Invalid API key', type: 'auth_error' };
    }
    if (error.status === 429) {
      return { code: 'rate_limit', message: 'Rate limit exceeded', type: 'rate_limit' };
    }
    if (error.status === 400) {
      return { code: 'invalid_request', message: error.message, type: 'invalid_request' };
    }
    return { code: 'api_error', message: error.message, type: 'api_error' };
  }
}

export class LocalProvider extends LLMProvider {
  constructor(config: LLMConfig) {
    super(config);
    if (!config.baseUrl) {
      throw new Error('Base URL is required for local provider');
    }
  }

  async chat(messages: Array<{role: 'system' | 'user' | 'assistant'; content: string}>): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify({
          model: this.config.model || 'llama2',
          messages,
          max_tokens: this.config.maxTokens || 1000,
          temperature: this.config.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0]?.message?.content || '',
        usage: data.usage || {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        model: data.model || 'local',
        finishReason: data.choices[0]?.finish_reason,
      };
    } catch (error: any) {
      throw {
        code: 'api_error',
        message: error.message,
        type: 'api_error' as const,
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
