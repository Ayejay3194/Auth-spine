#!/usr/bin/env node
/**
 * Minimal schema validator for the audit JSON.
 * Uses Ajv (dev dependency). If you don't want deps, skip this step.
 */
import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";

function die(msg, code = 2) {
  console.error(msg);
  process.exit(code);
}

const auditFile = process.argv[2] || "security-audit.json";
const schemaFile = process.argv[3] || "schemas/audit-gate.schema.json";

const auditPath = path.resolve(process.cwd(), auditFile);
const schemaPath = path.resolve(process.cwd(), schemaFile);

if (!fs.existsSync(auditPath)) die(`VALIDATOR: Audit file not found: ${auditPath}`, 2);
if (!fs.existsSync(schemaPath)) die(`VALIDATOR: Schema file not found: ${schemaPath}`, 2);

let audit, schema;
try { audit = JSON.parse(fs.readFileSync(auditPath, "utf8")); }
catch (e) { die(`VALIDATOR: Failed to parse audit JSON: ${e?.message || e}`, 2); }

try { schema = JSON.parse(fs.readFileSync(schemaPath, "utf8")); }
catch (e) { die(`VALIDATOR: Failed to parse schema JSON: ${e?.message || e}`, 2); }

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

const ok = validate(audit);
if (!ok) {
  console.error("VALIDATOR: Audit JSON does not match schema.");
  for (const err of validate.errors || []) {
    console.error(`- ${err.instancePath || "(root)"}: ${err.message}`);
  }
  process.exit(2);
}

console.log("VALIDATOR: OK");
process.exit(0);
