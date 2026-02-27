# ml-core (Hybrid ML Layer for Deterministic Ephemeris)

This package is an auditable ML subsystem meant to sit **on top of** a deterministic astronomy/astrology engine.

## What it includes
- Supervised residual correction (predicts small lon/lat residuals in arcseconds)
- Unsupervised helpers (anomaly detection, clustering assignment)
- Guardrails (clamps, confidence gates, drift kill-switch, canary runner)
- Feature pipeline (schema-stable featurization)
- Policy engine (centralized toggles and thresholds)

## Install
```bash
pnpm i
pnpm build
```

## Build
```bash
pnpm build
```

## Use
See `src/index.ts` for `HybridEphemerisEngine`.
