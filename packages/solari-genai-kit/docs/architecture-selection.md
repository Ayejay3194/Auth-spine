# Architecture selection criteria (Solari/Decans/Drift/Beauty Booking)

You're not picking a model to write poems. You're picking a model to behave like software.

## Primary requirement: controlled output + tool obedience
Your product requirements:
- JSON schema compliance (high)
- deterministic grounding via tools (very high)
- low hallucination tolerance (very low)
- long context is "nice", not mandatory (unless you do heavy RAG)

## What actually matters
### 1) Base model family
Pick a model known for instruction following and stability.
Signals:
- consistent formatting
- low jailbreak drift
- strong structured output

### 2) Context length
- If you do RAG properly (top-k, compressed chunks), 4k–8k is usually enough.
- If you stuff everything into context, you'll need 16k+ and still get worse behavior.

### 3) Quantization tolerance
You want QLoRA training + 4-bit/8-bit serving.
Pick a base model that doesn't fall apart when quantized.

### 4) Structured output reliability
This is the killer metric for you.
Measure:
- JSON parse rate
- schema pass rate
- repair rate
under token pressure.

## Recommended approach
1) Start with a small/medium instruct model
2) Add your runtime constraints (schema + repair + tool grounding)
3) Fine-tune with your failures (learning loop)
4) Only then consider scaling the base model

## Anti-patterns (how people waste months)
- training before you have evals
- scaling model size instead of fixing data/tool grounding
- prompt-only systems with no schema enforcement
- mixing tokenizers (train one, serve another)

## Decision tree
If schema pass rate < 0.95:
- Fix dataset format + add correction examples + reduce creativity (temperature)
If tool grounding fails:
- Add explicit "tool required" examples + cite tool output
If truncation happens:
- Reduce output verbosity OR raise max tokens OR increase model context length
If repair rate > 0.10:
- Model is unstable OR prompts too permissive OR tokenizer mismatch
