# Upgrades Checklist

## 1) Residual Atlas (mandatory)
- Run `npm run sweep:residuals`
- Inspect `out/residuals/summary.json`
- Look for:
  - body-specific spikes
  - era-specific spikes
  - fat tails (p99 close to max)

## 2) Golden Tests (mandatory)
- Run `npm run gen:golden`
- Commit `out/golden/golden-vectors.json` (or move to `testdata/`)
- Run `npm run test:golden` in CI

## 3) Teacher–Student (recommended)
- Use teacher truth to train residual correction tables/models
- Student core stays deterministic and fast
- Residual corrector is:
  - bounded (caps)
  - gated (confidence/anomaly)
  - auditable (logs)

## 4) Replace placeholders
- Teacher: JPL/DE (Chebyshev), Swiss Ephemeris, or your slow engine mode
- Student core: your TS ephemeris
- Corrector: swap `CappedGatedLinearCorrector` with your DFA/PC/EP MoE residual model

## 5) Production safety rails
- Version constants + model weights
- Lock precision modes
- Log drift metrics per deploy
