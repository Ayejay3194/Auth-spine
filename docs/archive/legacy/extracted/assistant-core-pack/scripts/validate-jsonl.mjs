// scripts/validate-jsonl.mjs
import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);

const recordSchema = JSON.parse(fs.readFileSync(new URL("../schemas/record.schema.json", import.meta.url), "utf-8"));
const intentsSchema = JSON.parse(fs.readFileSync(new URL("../schemas/intents.schema.json", import.meta.url), "utf-8"));
const validateRecord = ajv.compile(recordSchema);
const validateIntents = ajv.compile(intentsSchema);

function loadJsonl(p) {
  const raw = fs.readFileSync(p, "utf-8");
  return raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => JSON.parse(l));
}

const intentsPath = path.resolve("data/intents.json");
const intents = JSON.parse(fs.readFileSync(intentsPath, "utf-8"));
if (!validateIntents(intents)) {
  console.error("Intents config invalid:", validateIntents.errors);
  process.exit(1);
}

const jsonlPath = path.resolve("data/assistant_core.jsonl");
const rows = loadJsonl(jsonlPath);

let ok = true;
rows.forEach((r, i) => {
  if (!validateRecord(r)) {
    ok = false;
    console.error(`Record #${i} invalid:`, validateRecord.errors);
  }
});

if (!ok) process.exit(1);
console.log("✅ Validation passed:", rows.length, "records");
