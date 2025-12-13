# Non‑LLM Assistant Pack (Next.js + TypeScript)

A bundle of deterministic, explainable “AI-feeling” automation engines:
scheduling optimization, churn/no-show scoring, rebooking automation, dynamic pricing suggestions,
segmentation, notification orchestration, review automation, waitlist matching, inventory forecasting,
cashflow forecasting, marketing attribution, and more.

## Run
```bash
npm i
npm run dev
```

## Core idea
Everything is **rules + patterns + math**, driven off your own data. No hallucinations. No API bills.

- `src/assistant/` core types + runner
- `src/engines/` each differentiator module
- `src/app/demo/` demo page that runs sample data through engines
