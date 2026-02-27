import type { ChatCompletionRequest, ChatCompletionResponse, LlmClientConfig } from "./types";
export * from "./types";

export class LlmClient {
  constructor(private cfg: LlmClientConfig) {}

  async chat(req: Omit<ChatCompletionRequest, "model"> & { model?: string }): Promise<ChatCompletionResponse> {
    const model = req.model ?? this.cfg.defaultModel;
    const url = this.cfg.baseUrl.replace(/\/$/, "") + "/chat/completions";
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), this.cfg.timeoutMs ?? 30_000);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.cfg.apiKey}`
        },
        body: JSON.stringify({ ...req, model }),
        signal: controller.signal
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`LLM_HTTP_${res.status}: ${txt}`);
      }
      return await res.json() as ChatCompletionResponse;
    } finally {
      clearTimeout(t);
    }
  }
}
