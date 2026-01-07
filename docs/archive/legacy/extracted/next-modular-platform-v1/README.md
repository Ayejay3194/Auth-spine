# Modular Platform V1 (Next.js)

This project boots the module registry for modules 33–47 and exposes simple API routes to test the event system.

## Run

```bash
npm install
npm run dev
```

Open:
- http://localhost:3000
- http://localhost:3000/test

## API
- `GET /api/registry` -> list modules
- `POST /api/publish` -> publish an arbitrary event
- `POST /api/smoke` -> seeds a few aggregates + publishes smoke events
