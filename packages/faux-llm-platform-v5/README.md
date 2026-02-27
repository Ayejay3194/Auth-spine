# faux-llm-platform (Controlled "Faux LLM" stack)

This repo is a **provider-independent, guardrailed** generative system.
It can run against:
- Local **vLLM** OpenAI-compatible server (GPU)
- Local **llama-cpp-python** OpenAI-compatible server (CPU/GGUF)
- Any OpenAI-compatible endpoint (cloud or self-hosted)

Core idea:
- **RAG + tools + schema-validated outputs**
- Deterministic fallbacks and policy gates
- Strong eval + canary suite so models don't "silently regress"

Monorepo layout:
- `apps/solari-orchestrator`  : example app for Solari-style assistant
- `apps/drift-orchestrator`   : example app for Drift-style social + map assistant
- `apps/beauty-orchestrator`  : example app for Beauty Booking assistant
- `packages/llm-client`       : OpenAI-compatible client (fetch-based)
- `packages/schemas`          : JSON Schemas for structured outputs
- `packages/policy`           : policy engine + guardrails
- `packages/rag`              : chunking + indexing interface + hybrid retrieval hooks
- `packages/tools`            : tool registry + safe execution patterns
- `packages/eval`             : eval runner + canary checks + regression gates
- `packages/data`             : data QA checks addressing common ML pitfalls (leakage, scaling, etc.)
- `docker/`                   : example docker compose for local servers

## Quick start (dev)
```bash
pnpm i
pnpm -r build
pnpm -C apps/solari-orchestrator build
node apps/solari-orchestrator/dist/server.js
```

## Running with a local model server
Set `LLM_BASE_URL` to your OpenAI-compatible server, e.g.
- vLLM:   http://localhost:8000/v1
- llama:  http://localhost:8080/v1

and set `LLM_API_KEY` to any non-empty string (some servers ignore it).

## API
Each orchestrator exposes:
- `POST /ingest`  { docId, text }
- `POST /chat`    { sessionId, text, goal? }
- `POST /feedback` { sessionId, turnId, score, note? }

## What you get
- Schema-locked responses (no freestyle unless you allow it)
- Automatic JSON repair loop
- Tool allowlists per app
- RAG retrieval with metadata filters (baseline keyword store included)
- Canary/eval suite + drift alarms starter
- Data QA checklist and code for common pitfalls


See `docs/EDGE_CASE_MITIGATIONS.md` for the guards added (schema validation, tool loop breaker, retrieval confidence gate).


## Cognitive Architecture
See `docs/COGNITIVE_ARCHITECTURE.md`.


## Foundations
See `docs/FOUNDATIONS_MAP.md` for data, tokenization, architecture, training, and evaluation mapping.


## v5: Production pieces
- `@aj/config` env validation + `.env.example`
- `@aj/storage-postgres` multi-tenant Postgres persistence (sessions, events, memory, feedback, chunks)
- Tenant scoping: pass `tenantId` in `/ingest`, `/chat`, `/feedback`
See `docs/POSTGRES_SETUP.md`.
