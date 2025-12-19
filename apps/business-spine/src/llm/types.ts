export type LLMProviderType = 'openai' | 'anthropic' | 'local';

export interface LLMConfig {
  provider: LLMProviderType;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  baseUrl?: string; // For local models
  timeout?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason?: string;
}

export interface LLMError {
  code: string;
  message: string;
  type: 'api_error' | 'rate_limit' | 'timeout' | 'auth_error' | 'invalid_request';
}

export interface TeacherExplanation {
  operation: string;
  reasoning: string;
  confidence: number;
  alternatives?: string[];
  nextSteps?: string[];
}
