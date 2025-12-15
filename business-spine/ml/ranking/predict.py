"""Generic ranker predictor."""
import argparse, joblib, json
import pandas as pd

def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--model", required=True)
  ap.add_argument("--csv", required=True)
  ap.add_argument("--features", required=True)
  ap.add_argument("--out", required=True)
  args = ap.parse_args()

  model = joblib.load(args.model)
  feats = json.loads(Path(args.features).read_text(encoding="utf-8"))

  df = pd.read_csv(args.csv)
  X = df[feats]
  score = model.predict_proba(X)[:,1]

  with open(args.out, "w", encoding="utf-8") as f:
    for i, r in df.iterrows():
      f.write(json.dumps({"row_id": r.get("row_id"), "score": float(score[i])}, ensure_ascii=False) + "\n")
  print("Wrote", args.out)

if __name__ == "__main__":
  from pathlib import Path
  main()
