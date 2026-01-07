# Assistant Core Pack v3 (Bigger + Human)

This pack is intentionally larger so your NLU/assistant doesn't sound stiff or rude.
Includes:
- `data/assistant_core.jsonl` — 100s of human response examples across intents
- `data/nlu_training.jsonl` — 1000+ intent/entity training utterances
- `src/assistant/` — TS prompt builder + intent router (shuffles examples to reduce repetition)

Run:
```bash
npm i
npm run validate
node examples/demo.mjs
```
