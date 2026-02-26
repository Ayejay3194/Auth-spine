#!/usr/bin/env python3
import argparse, json, sys

def to_chat(obj):
    if "messages" in obj:
        return {"messages": obj["messages"]}
    msgs = []
    if obj.get("system"): msgs.append({"role":"system","content":str(obj["system"])})
    if obj.get("user"): msgs.append({"role":"user","content":str(obj["user"])})
    elif obj.get("prompt"): msgs.append({"role":"user","content":str(obj["prompt"])})
    if obj.get("assistant"): msgs.append({"role":"assistant","content":str(obj["assistant"])})
    elif obj.get("completion"): msgs.append({"role":"assistant","content":str(obj["completion"])})
    return {"messages": msgs} if len(msgs) >= 2 else None

def to_instruction(obj):
    if all(k in obj for k in ("instruction","input","output")):
        return {"instruction": obj["instruction"], "input": obj["input"], "output": obj["output"]}
    if "prompt" in obj and "completion" in obj:
        return {"instruction":"Follow the user request.","input":obj["prompt"],"output":obj["completion"]}
    if "user" in obj and "assistant" in obj:
        return {"instruction":"Follow the user request.","input":obj["user"],"output":obj["assistant"]}
    return None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", required=True)
    ap.add_argument("--out", dest="out", required=True)
    ap.add_argument("--mode", choices=["chat","instruction"], required=True)
    args = ap.parse_args()

    conv = to_chat if args.mode == "chat" else to_instruction
    n_in = n_out = 0
    with open(args.inp, "r", encoding="utf-8") as fin, open(args.out, "w", encoding="utf-8") as fout:
        for line in fin:
            line=line.strip()
            if not line: continue
            n_in += 1
            try: obj=json.loads(line)
            except Exception: continue
            out=conv(obj)
            if out is None: continue
            fout.write(json.dumps(out, ensure_ascii=False)+"\n")
            n_out += 1
    print(f"converted: in={n_in} out={n_out}", file=sys.stderr)

if __name__ == "__main__":
    main()
