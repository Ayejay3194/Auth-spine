export type Role = "system" | "user" | "assistant" | "tool";

export interface ChatMessage {
  role: Role;
  content: string;
  name?: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{ index: number; message: { role: "assistant"; content: string } }>;
}

export interface LlmClientConfig {
  baseUrl: string;   // e.g. http://localhost:8000/v1
  apiKey: string;    // non-empty
  defaultModel: string;
  timeoutMs?: number;
}
