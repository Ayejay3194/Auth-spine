# serve/
vLLM OpenAI-compatible server + optional auth proxy.

```bash
cp .env.example .env
docker compose up -d
```

- vLLM: http://localhost:8000/v1/chat/completions
- Proxy: http://localhost:8080/v1/chat/completions (requires x-api-key)
