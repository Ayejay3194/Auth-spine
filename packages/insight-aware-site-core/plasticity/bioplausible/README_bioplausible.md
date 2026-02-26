# Bioplausible Learning Playground (DFA/FA/PC/EP)

This is a small TypeScript codebase implementing **pluggable learning rules**:
- **DFA** (Direct Feedback Alignment)
- **FA** (Feedback Alignment)
- **Predictive Coding** (PC) refinement
- **Equilibrium Propagation** (EP) audit mode

It uses a tiny built-in tensor backend (`MatrixTensor`) so it runs anywhere.

## Run

### 1) Install deps
```bash
npm i
```

### 2) Build + run
```bash
npm run build
npm start
```

### Dev run (optional)
```bash
npm run dev
```

You should see periodic loss logs and an EP audit note every 200 steps.

## Where to look
- `src/core/tensor_matrix.ts` – minimal tensor backend + seeded RNG
- `src/core/nn.ts` – MLP, activations, MSE loss
- `src/learners/*` – DFA / FA / PC / EP learners
- `src/trainer/trainer.ts` – training step + EP-vs-main cosine audit

## Notes
This is intentionally minimal and educational. Swap `MatrixTensor` with your real backend (GPU/WASM/etc) by implementing the `Tensor` interface.
