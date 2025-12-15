"""Generic ranker trainer (copy per product)."""
import argparse, joblib, json
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, classification_report

def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--csv", required=True)
  ap.add_argument("--out", required=True)
  ap.add_argument("--label", required=True)
  ap.add_argument("--features", required=True, help="json list of feature column names")
  args = ap.parse_args()

  feats = json.loads(Path(args.features).read_text(encoding="utf-8"))
  df = pd.read_csv(args.csv).dropna(subset=[args.label])
  X = df[feats]; y = df[args.label].astype(int)

  Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y if y.nunique()>1 else None)

  model = Pipeline([("scaler", StandardScaler(with_mean=False)), ("clf", LogisticRegression(max_iter=3000, class_weight="balanced"))])
  model.fit(Xtr, ytr)

  proba = model.predict_proba(Xte)[:,1]
  if yte.nunique() > 1:
    print("AUC:", roc_auc_score(yte, proba))
  print(classification_report(yte, (proba>=0.5).astype(int), zero_division=0))

  out = Path(args.out); out.mkdir(parents=True, exist_ok=True)
  joblib.dump(model, out / "ranker.joblib")
  (out / "features.json").write_text(json.dumps(feats, indent=2), encoding="utf-8")
  print("Saved", out / "ranker.joblib")

if __name__ == "__main__":
  main()
