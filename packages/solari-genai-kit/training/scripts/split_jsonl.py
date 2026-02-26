#!/usr/bin/env python3
import argparse, os, random, sys

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--train", type=float, default=0.9)
    ap.add_argument("--val", type=float, default=0.1)
    ap.add_argument("--test", type=float, default=0.0)
    args=ap.parse_args()
    if abs((args.train+args.val+args.test)-1.0)>1e-9:
        raise SystemExit("train+val+test must sum to 1.0")
    os.makedirs(args.outdir, exist_ok=True)
    with open(args.inp,"r",encoding="utf-8") as f:
        lines=[ln for ln in f if ln.strip()]
    random.Random(args.seed).shuffle(lines)
    n=len(lines)
    n_train=int(n*args.train)
    n_val=int(n*args.val)
    train=lines[:n_train]
    val=lines[n_train:n_train+n_val]
    test=lines[n_train+n_val:]
    def write(p, items):
        with open(p,"w",encoding="utf-8") as fo:
            for ln in items: fo.write(ln.rstrip()+"\n")
    write(os.path.join(args.outdir,"train.jsonl"), train)
    write(os.path.join(args.outdir,"val.jsonl"), val)
    write(os.path.join(args.outdir,"test.jsonl"), test)
    print(f"split: n={n} train={len(train)} val={len(val)} test={len(test)}", file=sys.stderr)

if __name__=="__main__":
    main()
