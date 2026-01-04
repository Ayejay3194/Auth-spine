// scripts/validate-jsonl.mjs
import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);

const recordSchema = JSON.parse(fs.readFileSync(new URL("../schemas/record.schema.json", import.meta.url), "utf-8"));
const validateRecord = ajv.compile(recordSchema);

function validateFile(p) {
  const raw = fs.readFileSync(p, "utf-8");
  const rows = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => JSON.parse(l));
  let ok = true;
  rows.forEach((r, i) => {
    if (!validateRecord(r)) {
      ok = false;
      console.error(`Invalid record in ${p} @${i}:`, validateRecord.errors);
    }
  });
  if (ok) console.log("✅", path.basename(p), rows.length, "records");
  return ok;
}

const files = [path.resolve("data/assistant_core.jsonl"), path.resolve("data/nlu_training.jsonl")];
const allOk = files.map(validateFile).every(Boolean);
if (!allOk) process.exit(1);
