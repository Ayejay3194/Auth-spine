# Solari Astrology UI (Threaded, Non-repeating)

This is a lightweight in-browser "consultation" UI:
- Upload JSONL book data (one JSON record per line)
- Ask questions (planet/sign/house)
- It retrieves relevant passages and rewrites them in a consistent voice
- Keeps a threaded conversation view

## Run
```bash
npm install
npm run dev
```

## JSONL format (one per line)
```json
{"id":"optional","book":"Title","topic":"sun","sign":"scorpio","house":7,"text":"...","keywords":["..."]}
```

Tip: include `keywords` for better matching.
