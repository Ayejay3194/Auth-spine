# Cognitive Architecture (Controlled Generative System)

This is not "a chatbot". It's a **controlled cognitive loop**:

## 1) Sense
Input arrives as:
- user text
- session state
- retrieved context (RAG)
- policy constraints (allowed tools, output schema)

## 2) Retrieve
RAG returns **scored chunks**.
We compute a retrieval confidence signal.
- If confidence is low, the system **refuses to guess** (returns "not in KB yet").

## 3) Think (Constrained)
The model is asked for exactly one JSON object:
- `answer`
- `tool_call`
- `error`

We validate:
- JSON parses
- schema is correct (not just "valid JSON")

## 4) Act (Tools)
If a tool is called:
- tool must be in allowlist
- tool call must match schema
- tool loop breaker: max 1 tool call per request

## 5) Learn (Safe, RL-lite)
We don't let the model self-modify.
We learn safely by:
- bandit router selecting between strategies (prompt variants)
- updating arm rewards from explicit feedback

## 6) Remember (Belief revision)
We store notes with:
- confidence
- source
- optional expiration
We deprecate older notes when newer higher-confidence notes arrive.

## 7) Evaluate
You build a canary suite and regressions gate deployments.

---

## Why this is "AI"
It has:
- memory
- retrieval
- constrained generation
- tools/actions
- feedback-driven adaptation
- policy control & audit trail

And it can degrade gracefully if the model is removed.
