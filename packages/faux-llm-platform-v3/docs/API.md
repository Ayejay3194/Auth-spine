# Orchestrator API

Each app server exposes:

## POST /ingest
Body:
```json
{ "docId": "doc1", "text": "..." }
```

## POST /chat
Body:
```json
{ "sessionId": "user-123", "text": "your question", "goal": "optional goal text" }
```

## POST /feedback
Body:
```json
{ "sessionId": "user-123", "turnId": "turn_...", "score": 1, "note": "optional" }
```

Score:
- `1` good
- `0` neutral
- `-1` bad
