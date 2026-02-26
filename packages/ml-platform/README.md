# ml-platform (Unified ML System for AJ's products)

This is a **guardrailed, auditable ML platform** intended to serve multiple products:
- **Decans / Astrology**: deterministic ephemeris + supervised residuals
- **Solari**: interpretive ranking, memory retrieval, personalization
- **Drift**: social map recommendations, matching, safety + abuse detection
- **Beauty Booking**: discovery, scheduling prediction, churn/retention, fraud/spam defenses

Design principles:
1) Deterministic / rule-based truth stays primary where it exists.
2) ML is **additive**, clamped, and reversible.
3) Every model runs behind gates: confidence, drift, canary, schema hashes.
4) Offline training can happen outside TS; inference is deterministic and audit-friendly.

Packages:
- `@aj/ml-core`         Core types, metrics, guardrails, policy engine
- `@aj/ml-astro`        Astrology-specific residual correction engine
- `@aj/ml-ranking`      Learning-to-rank + calibration for feeds/search results
- `@aj/ml-recs`         Recommend/match layer (two-tower stubs + bandits)
- `@aj/ml-risk`         Abuse/fraud/spam risk scoring + throttles
- `@aj/ml-forecast`     Time-series forecasting for demand/churn/return visits
- `@aj/ml-search`       Retrieval helpers (embeddings interface + reranker hooks)
- `apps/examples`       Usage demos and integration patterns

Build:
```bash
pnpm i
pnpm -r build
```
