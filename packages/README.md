# Insight-Aware Site Core (TS, no deps)

This repo is a **core engine scaffold** for:
- Ephemeris → astro signals (aspects, windows, strength)
- "Vibes detector" → smoothed state + confidence
- Fusion layer → NowContext
- Modules (structured insight)
- Renderers (sassy vs clinical)
- Deterministic tests + demo

## Install / build / run

```bash
npm i
npm run build
npm run test
npm run dev:demo
```

## Plug in your real ephemeris
Replace `src/ephemeris/ephemerisProvider.ts` implementation with your VSOP/ELP + ML-corrected engine.

Everything downstream consumes `AstroNowSignals` and `NowContext`.



## Plasticity (bioplausible learning add-on)

This repo now includes an optional **online personalization layer** under `src/plasticity/`.

- Uses local-ish learning rules (DFA + Predictive Coding refine) to learn *bounded deltas* on top of deterministic signals.
- Default behavior is conservative: it **only reorders suggested modules** (it does *not* change astronomy/ephemeris math).
- Includes periodic EP audits (cosine similarity check vs EP update direction).

### Quick demo

```bash
npm install
npm run build
node dist/demo/run-demo.js
```

### Use in code

```ts
import { InsightEngine } from "./engine.js";

const engine = new InsightEngine({ plasticity: true });

const ctx = engine.buildContext({ utc, jd, convo, user });
const chat = engine.chat(ctx);

// After user clicks a module (or marks it helpful):
engine.submitFeedback(ctx, { moduleId: "PressureWindow", helpful: 1.0 });
```


## Teacher–Student + Oracle
See `README_TEACHER_STUDENT.md`. Run `npm run dev:teacher-student-demo`.
