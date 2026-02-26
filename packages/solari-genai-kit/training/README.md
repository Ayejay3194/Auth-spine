# training/
Convert raw JSONL -> chat/instruction JSONL, dedupe, split, then train via Axolotl.

```bash
python scripts/convert_jsonl.py --in raw.jsonl --out data/chat.jsonl --mode chat
python scripts/dedupe_jsonl.py --in data/chat.jsonl --out data/chat.dedup.jsonl
python scripts/split_jsonl.py --in data/chat.dedup.jsonl --outdir data/splits --seed 42
```
