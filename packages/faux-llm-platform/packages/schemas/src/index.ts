export const SCHEMAS = {
  assistantResponse: new URL("../schemas/assistant_response.schema.json", import.meta.url),
  toolCall: new URL("../schemas/tool_call.schema.json", import.meta.url),
} as const;
