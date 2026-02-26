import fetch from "node-fetch";

export interface ChatMessage { role: "system"|"user"|"assistant"|"tool"; content: string; name?: string; }

export async function chatCompletion(baseUrl: string, apiKey: string|undefined, messages: ChatMessage[], opts?: {temperature?:number; max_tokens?:number}) {
  const url = baseUrl.replace(/\/$/, "") + "/v1/chat/completions";
  const res = await fetch(url, {
    method:"POST",
    headers:{ "content-type":"application/json", ...(apiKey?{"x-api-key":apiKey}:{}) },
    body: JSON.stringify({
      model: "local",
      messages,
      temperature: opts?.temperature ?? 0.2,
      max_tokens: opts?.max_tokens ?? 900
    })
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("missing content");
  return content;
}
