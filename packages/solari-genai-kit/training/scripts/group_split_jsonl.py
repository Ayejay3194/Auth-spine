#!/usr/bin/env python3
import argparse, json, os, random, sys
from collections import defaultdict

def get_path(obj, path):
    cur=obj
    for part in path.split("."):
        if isinstance(cur, dict) and part in cur:
            cur=cur[part]
        else:
            return None
    return cur

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--group_key", required=True, help="dotpath to grouping key, e.g. meta.userId or meta.docId")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--train", type=float, default=0.9)
    ap.add_argument("--val", type=float, default=0.1)
    ap.add_argument("--test", type=float, default=0.0)
    args=ap.parse_args()

    if abs((args.train+args.val+args.test)-1.0)>1e-9:
        raise SystemExit("train+val+test must sum to 1.0")

    groups = defaultdict(list)
    n=0
    with open(args.inp,"r",encoding="utf-8") as fin:
        for line in fin:
            line=line.strip()
            if not line: continue
            try: obj=json.loads(line)
            except Exception: continue
            n += 1
            g = get_path(obj, args.group_key)
            if g is None:
                g = "__MISSING__"
            groups[str(g)].append(line)

    keys=list(groups.keys())
    random.Random(args.seed).shuffle(keys)

    # allocate groups, not rows
    total=len(keys)
    n_train=int(total*args.train)
    n_val=int(total*args.val)
    train_keys=keys[:n_train]
    val_keys=keys[n_train:n_train+n_val]
    test_keys=keys[n_train+n_val:]

    def flatten(klist):
        out=[]
        for k in klist: out.extend(groups[k])
        return out

    train_lines=flatten(train_keys)
    val_lines=flatten(val_keys)
    test_lines=flatten(test_keys)

    os.makedirs(args.outdir, exist_ok=True)
    def write(path, lines):
        with open(path,"w",encoding="utf-8") as fo:
            for ln in lines: fo.write(ln.rstrip()+"\n")

    write(os.path.join(args.outdir,"train.jsonl"), train_lines)
    write(os.path.join(args.outdir,"val.jsonl"), val_lines)
    write(os.path.join(args.outdir,"test.jsonl"), test_lines)

    print(json.dumps({
        "rows": n,
        "groups": total,
        "group_key": args.group_key,
        "train_rows": len(train_lines),
        "val_rows": len(val_lines),
        "test_rows": len(test_lines)
    }, indent=2), file=sys.stderr)

if __name__=="__main__":
    main()
