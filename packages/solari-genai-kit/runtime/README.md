# runtime/
Schema-locked generation + tool routing.

Run:
```bash
pnpm i
pnpm dev
```

POST:
- http://localhost:7777/generate

Body example:
```json
{
  "mode":"tools",
  "schemaName":"report",
  "modelBaseUrl":"http://localhost:8080",
  "apiKey":"change-me",
  "input":"Write a structured report about X",
  "context":{"product":"Decans"}
}
```
