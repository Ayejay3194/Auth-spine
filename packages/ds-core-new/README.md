# ds-core (TypeScript)

A lightweight, auditable data science core you can reuse across products.

**Includes**
- Data: dataset types, deterministic train/test split, batching
- Features: feature encoders, pipelines, scaling (standardization), simple encoders
- Models: linear regression, logistic regression (binary)
- Training: fit options, early stopping utility
- Validation: metrics (MSE/MAE/Accuracy/LogLoss/AUC/Brier), k-fold (repeated split) CV
- Experiments: in-memory tracker + JSON artifacts

## Install (monorepo)
Copy `packages/ds-core` into your repo and set your workspace scope.
Then:

```bash
pnpm -C packages/ds-core install
pnpm -C packages/ds-core build
```

## Quick use

See `src/examples/run_example.ts` for an end-to-end example.

## Design notes
- Deterministic, readable, no heavy deps.
- Numeric arrays use Float64Array.
- This is intentionally minimal: strong primitives you can compose.
