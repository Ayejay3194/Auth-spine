# Edge case mitigations implemented (v2)

## Implemented in code
- **Schema validation**: we validate `AssistantResponse` and `ToolCall` objects (not just JSON parse).
- **JSON repair loop**: strips code fences and extracts the first JSON object.
- **Tool allowlist**: policy denies any tool not explicitly allowed.
- **Tool loop breaker**: max 1 tool call per `/chat` request (prevents infinite loops).
- **Retrieval confidence gate**: uses scored retrieval + heuristic confidence.
  - If confidence < 0.25, the orchestrator returns an explicit "I don't know" answer instead of guessing.

## Next upgrades you may want
- Add per-user/doc access control to retrieval (multi-tenant isolation).
- Replace keyword store with a vector DB and keep the scored interface.
- Add streaming + backpressure for ingestion.
- Add redaction / PII filters before the LLM sees context.
