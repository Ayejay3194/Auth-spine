/**
 * Enhanced LLM Client with Response Modes
 * 
 * Supports:
 * - Instant mode: Fast, non-streaming responses
 * - Streaming mode: Real-time token-by-token responses
 * - Long mode: Optimized for lengthy completions
 */

export type ResponseMode = 'instant' | 'streaming' | 'long';

export interface StreamChunk {
  delta: string;
  done: boolean;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EnhancedChatCompletionRequest {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  responseMode?: ResponseMode;  // NEW: Control response behavior
  stream?: boolean;  // Legacy support
}

export interface ChatMetrics {
  startTime: number;
  endTime?: number;
  latencyMs?: number;
  tokensPrompt?: number;
  tokensCompletion?: number;
  tokensTotal?: number;
  model: string;
  responseMode: ResponseMode;
  success: boolean;
  error?: string;
}

export class EnhancedLlmClient {
  private metricsCollector?: (metrics: ChatMetrics) => void;

  constructor(private config: {
    baseUrl: string;
    apiKey: string;
    defaultModel: string;
    timeoutMs?: number;
    collectMetrics?: boolean;
  }) {}

  /**
   * Register metrics collector (e.g., Parquet store)
   */
  onMetrics(collector: (metrics: ChatMetrics) => void): void {
    this.metricsCollector = collector;
  }

  /**
   * Instant mode: Fast, complete response
   * Best for: Simple queries, cached responses
   * Timeout: 5 seconds default
   */
  async instant(req: Omit<EnhancedChatCompletionRequest, 'responseMode'>): Promise<string> {
    const metrics: ChatMetrics = {
      startTime: Date.now(),
      model: req.model ?? this.config.defaultModel,
      responseMode: 'instant',
      success: false
    };

    try {
      const response = await this.chat({
        ...req,
        responseMode: 'instant',
        stream: false
      }, 5000); // 5s timeout for instant

      metrics.success = true;
      metrics.endTime = Date.now();
      metrics.latencyMs = metrics.endTime - metrics.startTime;
      
      const content = response.choices[0]?.message?.content || '';
      
      if (this.metricsCollector) {
        this.metricsCollector(metrics);
      }

      return content;
    } catch (error) {
      metrics.success = false;
      metrics.endTime = Date.now();
      metrics.latencyMs = metrics.endTime - metrics.startTime;
      metrics.error = error instanceof Error ? error.message : String(error);
      
      if (this.metricsCollector) {
        this.metricsCollector(metrics);
      }
      
      throw error;
    }
  }

  /**
   * Streaming mode: Real-time token-by-token responses
   * Best for: Interactive chat, long responses
   * Provides better UX with progressive rendering
   */
  async *streaming(req: Omit<EnhancedChatCompletionRequest, 'responseMode'>): AsyncGenerator<StreamChunk> {
    const metrics: ChatMetrics = {
      startTime: Date.now(),
      model: req.model ?? this.config.defaultModel,
      responseMode: 'streaming',
      success: false
    };

    try {
      const model = req.model ?? this.config.defaultModel;
      const url = this.config.baseUrl.replace(/\/$/, '') + '/chat/completions';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          ...req,
          model,
          stream: true
        })
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`LLM_HTTP_${response.status}: ${txt}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let firstTokenTime: number | undefined;

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            metrics.success = true;
            metrics.endTime = Date.now();
            metrics.latencyMs = metrics.endTime - metrics.startTime;
            
            if (this.metricsCollector) {
              this.metricsCollector(metrics);
            }
            
            yield { delta: '', done: true };
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || line.trim() === 'data: [DONE]') continue;
            
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                const delta = data.choices[0]?.delta?.content || '';
                
                if (delta && !firstTokenTime) {
                  firstTokenTime = Date.now();
                }

                if (data.usage) {
                  metrics.tokensPrompt = data.usage.prompt_tokens;
                  metrics.tokensCompletion = data.usage.completion_tokens;
                  metrics.tokensTotal = data.usage.total_tokens;
                }

                yield {
                  delta,
                  done: false,
                  usage: data.usage
                };
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      metrics.success = false;
      metrics.endTime = Date.now();
      metrics.latencyMs = metrics.endTime - metrics.startTime;
      metrics.error = error instanceof Error ? error.message : String(error);
      
      if (this.metricsCollector) {
        this.metricsCollector(metrics);
      }
      
      throw error;
    }
  }

  /**
   * Long mode: Optimized for lengthy completions
   * Best for: Complex tasks, document generation
   * Extended timeout, optimized for quality over speed
   */
  async long(req: Omit<EnhancedChatCompletionRequest, 'responseMode'>): Promise<string> {
    const metrics: ChatMetrics = {
      startTime: Date.now(),
      model: req.model ?? this.config.defaultModel,
      responseMode: 'long',
      success: false
    };

    try {
      const response = await this.chat({
        ...req,
        responseMode: 'long',
        stream: false,
        max_tokens: req.max_tokens ?? 4096  // Higher default for long mode
      }, 120000); // 2 minute timeout for long responses

      metrics.success = true;
      metrics.endTime = Date.now();
      metrics.latencyMs = metrics.endTime - metrics.startTime;
      
      const content = response.choices[0]?.message?.content || '';
      
      if (this.metricsCollector) {
        this.metricsCollector(metrics);
      }

      return content;
    } catch (error) {
      metrics.success = false;
      metrics.endTime = Date.now();
      metrics.latencyMs = metrics.endTime - metrics.startTime;
      metrics.error = error instanceof Error ? error.message : String(error);
      
      if (this.metricsCollector) {
        this.metricsCollector(metrics);
      }
      
      throw error;
    }
  }

  /**
   * Base chat method (private)
   */
  private async chat(
    req: EnhancedChatCompletionRequest,
    timeoutMs?: number
  ): Promise<any> {
    const model = req.model ?? this.config.defaultModel;
    const url = this.config.baseUrl.replace(/\/$/, '') + '/chat/completions';
    const controller = new AbortController();
    const timeout = timeoutMs ?? this.config.timeoutMs ?? 30000;
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: req.messages,
          temperature: req.temperature,
          max_tokens: req.max_tokens,
          stream: req.stream ?? false
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`LLM_HTTP_${response.status}: ${txt}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Auto-select best response mode based on request
   */
  async auto(req: Omit<EnhancedChatCompletionRequest, 'responseMode'>): Promise<string> {
    // Simple heuristic: use instant for short prompts, streaming for interactive
    const promptLength = req.messages.reduce((sum, msg) => sum + msg.content.length, 0);
    
    if (promptLength < 200 && (!req.max_tokens || req.max_tokens < 256)) {
      return this.instant(req);
    } else {
      return this.long(req);
    }
  }
}

export { EnhancedLlmClient };
