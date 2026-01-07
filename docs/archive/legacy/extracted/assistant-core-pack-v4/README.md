# Assistant Core Pack v4 (10k NLU)

This is the bigger dataset version.
- `data/nlu_training.jsonl`: ~11k utterances with entities for intent+slot training
- `data/assistant_core.jsonl`: lots of human examples for response style
- `src/assistant/`: TS prompt builder + intent router (shuffled examples)
- `scripts/validate-jsonl.mjs`: validates both JSONL files

Run:
```bash
npm i
npm run validate
node examples/demo.mjs
```
