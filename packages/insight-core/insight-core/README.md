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
