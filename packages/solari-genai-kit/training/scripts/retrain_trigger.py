#!/usr/bin/env python3
# Reads evals/results/results.json and triggers retraining if thresholds are violated.
# Optionally harvests failures into training-ready chat JSONL.

import argparse, json, os, sys
from datetime import datetime

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--results", required=True)
    ap.add_argument("--out", required=False)
    ap.add_argument("--min_pass", type=float, default=0.95)
    ap.add_argument("--max_repair", type=float, default=0.10)
    args = ap.parse_args()

    with open(args.results, "r", encoding="utf-8") as f:
        r = json.load(f)

    pass_rate = float(r.get("passRate", 0))
    repair_rate = float(r.get("repairedRate", 0))
    taxonomy = r.get("taxonomy") or {}

    schema_bad = int(taxonomy.get("SCHEMA", 0))
    parse_bad = int(taxonomy.get("JSON_PARSE", 0))

    need = []
    if pass_rate < args.min_pass: need.append(f"passRate<{args.min_pass}")
    if repair_rate > args.max_repair: need.append(f"repairedRate>{args.max_repair}")
    if schema_bad > 0: need.append("SCHEMA>0")
    if parse_bad > 0: need.append("JSON_PARSE>0")

    if not need:
        print("OK: thresholds satisfied. No retrain triggered.")
        sys.exit(0)

    print("RETRAIN TRIGGERED:", ", ".join(need))
    print("Snapshot:", {"passRate": pass_rate, "repairedRate": repair_rate, "taxonomy": taxonomy})

    if args.out:
        os.makedirs(os.path.dirname(args.out), exist_ok=True)
        n=0
        with open(args.out, "a", encoding="utf-8") as fo:
            for d in r.get("details", []):
                if d.get("ok") is True:
                    continue
                row = {
                    "messages": [
                        {"role":"system","content":"You MUST output valid JSON matching the report schema and nothing else."},
                        {"role":"user","content":f"Produce a schema-valid report for test: {d.get('name')}"},
                        {"role":"assistant","content":str(d.get('error') or '')},
                        {"role":"user","content":"Fix it. Return JSON only. Include all required keys, even if citations is empty."},
                        {"role":"assistant","content":json.dumps({
                            "title":"Fallback report",
                            "summary":"Schema-safe fallback because the previous attempt failed.",
                            "bullets":["Add targeted training examples for this failure","Run evals after training","Keep tool grounding strict"],
                            "actions":["Harvest failures into JSONL","Fine-tune with QLoRA SFT","Re-run edge-case suites"],
                            "cautions":["Do not output non-JSON","Do not fabricate facts"],
                            "citations":[]
                        }, ensure_ascii=False)}
                    ],
                    "meta": {"suite": d.get("suite"), "name": d.get("name"), "status": d.get("status"), "ts": datetime.utcnow().isoformat()+"Z"}
                }
                fo.write(json.dumps(row, ensure_ascii=False)+"\n")
                n += 1
        print(f"harvested_failures={n} -> {args.out}")

    print("\nSuggested next commands (edit paths):")
    print("  python training/scripts/validate_jsonl.py --in training/data/auto_failures.jsonl --mode chat --out_bad training/data/rejects.jsonl")
    print("  python training/scripts/dedupe_jsonl.py --in training/data/auto_failures.jsonl --out training/data/auto_failures.dedup.jsonl")
    print("  python training/scripts/group_split_jsonl.py --in training/data/auto_failures.dedup.jsonl --outdir training/data/auto_splits --group_key meta.name --seed 42")
    print("  # Fine-tune with Axolotl: point training/axolotl/config_chat_qlora.yml to auto_splits/train.jsonl")
    print("  npm --prefix evals run run")
    sys.exit(1)

if __name__ == "__main__":
    main()
