#!/usr/bin/env python3
import argparse, json, sys

def get_path(obj, path):
    cur = obj
    for part in path.split("."):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            return None
    return cur

def validate_chat(obj):
    msgs = obj.get("messages")
    if not isinstance(msgs, list) or len(msgs) < 2:
        return False, "missing/invalid messages"
    roles = {"system","user","assistant","tool"}
    for i,m in enumerate(msgs):
        if not isinstance(m, dict):
            return False, f"message[{i}] not object"
        if m.get("role") not in roles:
            return False, f"message[{i}] invalid role"
        if not isinstance(m.get("content"), str) or not m.get("content").strip():
            return False, f"message[{i}] missing content"
    has_user = any(m.get("role")=="user" for m in msgs)
    has_assistant = any(m.get("role")=="assistant" for m in msgs)
    if not (has_user and has_assistant):
        return False, "need at least one user and one assistant message"
    return True, None

def validate_instruction(obj):
    for k in ("instruction","input","output"):
        if k not in obj or not isinstance(obj[k], str):
            return False, f"missing/invalid {k}"
    if not obj["output"].strip():
        return False, "empty output"
    return True, None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", required=True)
    ap.add_argument("--mode", choices=["chat","instruction"], required=True)
    ap.add_argument("--require_meta", default=None, help="dotpath to required meta key (e.g. meta.userId)")
    ap.add_argument("--out_bad", default=None, help="write rejected rows to this file as JSONL")
    args = ap.parse_args()

    validator = validate_chat if args.mode=="chat" else validate_instruction
    n_in=n_ok=n_bad=0
    bad_out = open(args.out_bad, "w", encoding="utf-8") if args.out_bad else None

    with open(args.inp, "r", encoding="utf-8") as fin:
        for line in fin:
            line=line.strip()
            if not line: continue
            n_in += 1
            try: obj=json.loads(line)
            except Exception:
                n_bad += 1
                if bad_out: bad_out.write(json.dumps({"reason":"invalid_json","raw":line}, ensure_ascii=False)+"\n")
                continue

            ok, reason = validator(obj)
            if ok and args.require_meta:
                v = get_path(obj, args.require_meta)
                if v is None or (isinstance(v,str) and not v.strip()):
                    ok, reason = False, f"missing required field: {args.require_meta}"

            if ok:
                n_ok += 1
            else:
                n_bad += 1
                if bad_out:
                    bad_out.write(json.dumps({"reason":reason, "row":obj}, ensure_ascii=False)+"\n")

    if bad_out: bad_out.close()
    print(json.dumps({"in":n_in,"ok":n_ok,"bad":n_bad}, indent=2), file=sys.stderr)

if __name__=="__main__":
    main()
