#!/usr/bin/env python3
import argparse, json, sys, statistics

def msg_text_len(m): 
    c = m.get("content","")
    return len(c) if isinstance(c,str) else 0

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", required=True)
    ap.add_argument("--mode", choices=["chat","instruction"], required=True)
    ap.add_argument("--label_path", default=None, help="dotpath to label for imbalance stats (e.g. meta.label or y)")
    ap.add_argument("--out", required=True, help="write JSON report here")
    args=ap.parse_args()

    lengths=[]
    label_counts={}
    n=0
    n_missing_label=0

    def get_path(obj, path):
        cur=obj
        for part in path.split("."):
            if isinstance(cur, dict) and part in cur:
                cur=cur[part]
            else:
                return None
        return cur

    with open(args.inp,"r",encoding="utf-8") as fin:
        for line in fin:
            line=line.strip()
            if not line: continue
            try: obj=json.loads(line)
            except Exception: continue
            n += 1
            if args.mode=="chat":
                msgs=obj.get("messages") or []
                lengths.append(sum(msg_text_len(m) for m in msgs if isinstance(m,dict)))
            else:
                lengths.append(sum(len(str(obj.get(k,""))) for k in ("instruction","input","output")))

            if args.label_path:
                lab=get_path(obj, args.label_path)
                if lab is None:
                    n_missing_label += 1
                else:
                    key=str(lab)
                    label_counts[key]=label_counts.get(key,0)+1

    report = {
        "count": n,
        "length_chars": {
            "min": min(lengths) if lengths else 0,
            "p50": statistics.median(lengths) if lengths else 0,
            "p90": statistics.quantiles(lengths, n=10)[8] if len(lengths) >= 10 else (max(lengths) if lengths else 0),
            "max": max(lengths) if lengths else 0,
            "mean": statistics.mean(lengths) if lengths else 0
        },
        "labels": {
            "label_path": args.label_path,
            "missing": n_missing_label,
            "counts": dict(sorted(label_counts.items(), key=lambda kv: kv[1], reverse=True))
        } if args.label_path else None
    }

    with open(args.out,"w",encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(json.dumps({"wrote": args.out, "count": n}, indent=2), file=sys.stderr)

if __name__=="__main__":
    main()
