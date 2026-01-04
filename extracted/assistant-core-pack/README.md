# Assistant Core Pack (JSONL + TS Runtime)

This zip is the "make it not dumb" starter kit:
- **JSONL**: system + policies + examples + templates (few-shot / seed corpora)
- **TS runtime**: loads JSONL, does lightweight intent routing, builds a prompt, and returns a structured response
- **Schemas**: validate the JSONL so it doesn't silently rot

## What's inside
- `data/assistant_core.jsonl` — core assistant corpus
- `data/intents.json` — intent tags + router config
- `data/prompt_preamble.txt` — your baseline instruction preamble
- `src/` — TypeScript runtime (no vendor lock)
- `examples/` — example API route + usage
- `schemas/` — JSON schema for records + config
- `scripts/` — validate + build prompt

## Install (Node 18+)
```bash
npm i
npm run validate
npm run demo
```

## Plug into your app
- Copy `data/` and `src/assistant/` into your repo
- Call `buildPrompt()` with the latest conversation messages
- Send prompt to your LLM provider

## Notes
- No images, no art assets.
- Defaults assume a web app assistant.
