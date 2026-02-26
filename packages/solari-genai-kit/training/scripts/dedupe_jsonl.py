#!/usr/bin/env python3
import argparse, hashlib, json, sys

def h(obj):
    s=json.dumps(obj, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", required=True)
    ap.add_argument("--out", dest="out", required=True)
    args=ap.parse_args()
    seen=set(); n_in=n_out=0
    with open(args.inp,"r",encoding="utf-8") as fin, open(args.out,"w",encoding="utf-8") as fout:
        for line in fin:
            line=line.strip()
            if not line: continue
            n_in += 1
            try: obj=json.loads(line)
            except Exception: continue
            key=h(obj)
            if key in seen: continue
            seen.add(key)
            fout.write(json.dumps(obj, ensure_ascii=False)+"\n")
            n_out += 1
    print(f"dedupe: in={n_in} out={n_out}", file=sys.stderr)

if __name__=="__main__":
    main()
