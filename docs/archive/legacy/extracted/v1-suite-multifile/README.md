# V1 Suite (Multi-file)

This is a clean V1 backbone:
- Lightweight NLU (rule-based)
- Decision responder (human-sounding, structured)
- Prompt builder that can also load your JSONL packs
- Event bus + analytics sink

Run:
```bash
npm i
npm run build
npm run demo
```

Data:
- Put your JSONL pack at `data/assistant_core.jsonl` (optional)
- Put intent tags at `data/intents.json` (optional)

If the JSONL files are present, the demo will build a prompt payload you can send to an LLM.
