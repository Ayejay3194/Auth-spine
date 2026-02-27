# Solari Agent Kit v2 (planning + goal pressure + learning loop)

This is the next step after the controlled generator:
- **Multi-step planning** (schema-locked)
- **Goal pressure** (metrics + thresholds)
- **Learning loop** (capture failures to JSONL for fine-tuning)

Generated: 2026-02-26T01:01:24.563003Z

## What you run
1) Start your model server (vLLM + proxy) from your genai kit:
   - `MODEL_BASE_URL=http://localhost:8080`
2) Run the agent:
```bash
cd agent
pnpm i
pnpm dev
```

## Outputs
- `agent/storage/state.json`        persistent agent state (goals/beliefs)
- `agent/storage/events.jsonl`      append-only event log
- `agent/storage/learning.jsonl`    training-ready rows captured from failures (for SFT/DPO later)
