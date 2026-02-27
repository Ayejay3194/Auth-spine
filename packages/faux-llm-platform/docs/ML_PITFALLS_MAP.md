# ML Pitfalls Map (your timestamps -> enforcement)

This repo includes `packages/data` with checks + a checklist to prevent:

## Data-Related Issues
- Not cleaning properly -> `checkRequiredKeys`, schema validation, dedup
- Normalize/standardize -> `checkFeatureScale` + stable feature pipelines
- Data leakage -> `checkLeakage` + split-by-entity/time guideline
- Class imbalance -> `checkClassImbalance` + weighting/resampling plan
- Missing values -> `checkMissing` + imputation hooks

## Model Training
- Wrong metrics -> `packages/eval` (your eval suite is the truth)
- Over/underfitting -> canary suite + baseline comparisons
- Wrong learning rate -> enforced indirectly via eval gates
- Poor hyperparameters -> track configs + keep baselines
- No cross-validation -> split utilities (extend as needed)

## Implementation
- Train/test contamination -> immutable eval sets + hashed splits
- Wrong loss -> task templates define objectives
- Incorrect encoding -> schema-stable feature pipelines
- Not shuffling -> split/shuffle in builders
- Memory management -> streaming JSONL readers in `packages/data`

## Evaluation
- Not checking for bias -> add group metrics in eval cases
- Ignoring assumptions -> baseline + residual checks
- Poor validation -> canary + regression gates
- Misinterpreting results -> standardized reports

## Common Pitfalls
- Complex too early -> keyword RAG baseline + heuristic baselines
- Not understanding baseline -> baselines are first-class here
- Ignoring domain knowledge -> deterministic rules + tool layer
- Poor documentation -> markdown + schema versioning
- Not version controlling -> dataset/model/prompt hashes everywhere
