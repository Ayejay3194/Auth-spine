#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function die(msg, code = 2) {
  console.error(msg);
  process.exit(code);
}

const fileArg = process.argv[2] || "security-audit.json";
const filePath = path.resolve(process.cwd(), fileArg);

if (!fs.existsSync(filePath)) {
  die(`SECURITY GATE: Audit file not found: ${filePath}`, 2);
}

let audit;
try {
  const raw = fs.readFileSync(filePath, "utf8");
  audit = JSON.parse(raw);
} catch (e) {
  die(`SECURITY GATE: Failed to read/parse JSON: ${(e && e.message) || e}`, 2);
}

const status = audit?.gate?.result?.status;
const reasons = audit?.gate?.result?.reasons;

if (!status || !["PASS", "WARN", "FAIL"].includes(status)) {
  die(
    `SECURITY GATE: Missing/invalid gate.result.status. Expected PASS|WARN|FAIL, got: ${String(
      status
    )}`,
    2
  );
}

console.log(`SECURITY GATE RESULT: ${status}`);

if (Array.isArray(reasons) && reasons.length) {
  console.log("Reasons:");
  for (const r of reasons) console.log(`- ${r}`);
}

process.exit(status === "FAIL" ? 1 : 0);
