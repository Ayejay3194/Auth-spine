# aj-ml-modules (TypeScript)

A modular DS/ML toolkit you can embed into Solari / Drift / Beauty.

Includes:
- core (EDA, metrics, splits, preprocessing)
- models (linear/logistic regression, tiny NN, matrix factorization recommender)
- nlp (tokenization, TF-IDF, sentiment baseline, multilingual routing, toy LM bigram)
- pipelines (fit/predict/eval runner + config)
- abtest (experiment stats)
- mlops (artifact registry + eval gates)
- projects/* modules that map to your timestamp list

Install:
- pnpm i
Build:
- pnpm -r build
