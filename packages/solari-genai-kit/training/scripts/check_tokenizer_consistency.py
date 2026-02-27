#!/usr/bin/env python3
# Checks that the tokenizer used in training matches what you serve.
# Avoids the classic: trained fine, prod JSON breaks.

import argparse, sys

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--train_tokenizer", required=True)
    ap.add_argument("--serve_tokenizer", required=True)
    args = ap.parse_args()

    same = args.train_tokenizer.strip() == args.serve_tokenizer.strip()
    if same:
        print("OK: tokenizer identifiers match")
        sys.exit(0)

    print("FAIL: tokenizer identifiers differ")
    print("train:", args.train_tokenizer)
    print("serve:", args.serve_tokenizer)
    print("Fix: train and serve must use the exact same tokenizer/model family.")
    sys.exit(2)

if __name__ == "__main__":
    main()
