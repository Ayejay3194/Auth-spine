# Orchestrator API

Each app server exposes:

## POST /ingest
Body:
```json
{ "tenantId":"public", "docId": "doc1", "text": "..." }
```

## POST /chat
Body:
```json
{ "tenantId":"public", "sessionId": "user-123", "text": "your question", "goal": "optional goal text" }
```

## POST /feedback
Body:
```json
{ "tenantId":"public", "sessionId": "user-123", "turnId": "turn_...", "score": 1, "note": "optional" }
```

Score:
- `1` good
- `0` neutral
- `-1` bad
