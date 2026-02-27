# Foundations Map (timestamps → system reality)

## 00:34 Data curation
Data is curated, not collected.
- JSONL only, schema-validated
- Provenance, scope, timestamp required
- Belief revision (newer + higher confidence deprecates older)
- Active forgetting via expiration + deprecation
- No mixing facts, opinions, or questions

Failure mode prevented:
- Garbage-in permanence
- User hallucinations becoming system truth

---

## 06:50 Tokenization
Tokenization is infrastructure, not intelligence.
- Controlled chunk size + overlap
- Hard context limits
- Ordered context: MEMORY → RAG → USER
- Repair loop for truncation damage

Failure mode prevented:
- Prompt injection via long text
- Silent truncation corruption
- JSON breakage

---

## 08:03 Model architecture
Architecture = cognitive loop, not neural layers.

Sense → Retrieve → Constrain → Act → Remember → Learn

- LLM is a replaceable component
- Deterministic policies dominate
- Probabilistic generation is sandboxed

Failure mode prevented:
- Model-centric collapse
- Unexplainable behavior

---

## 12:08 Model training
Training = behavioral shaping, not backprop.

Implemented:
- Strategy bandit (RL-lite)
- Explicit feedback → reward
- Suppression of failed paths
- Preference learning without retraining

Failure mode prevented:
- Overfitting
- Catastrophic forgetting
- GPU worship

---

## 21:52 Evaluation
Evaluation is continuous and operational.

Implemented:
- Canary checks
- Schema validation
- Confidence-based refusal
- Event trace + audit log
- Regression gating

Failure mode prevented:
- Silent degradation
- Metrics theater
- Post-hoc excuses
