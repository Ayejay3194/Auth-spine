#!/usr/bin/env node
/**
 * Minimal schema validator for the audit JSON.
 * No external dependencies required.
 */
import fs from "node:fs";

const auditFile = process.argv[2] || "security-audit.json";

if (!auditFile) {
  console.error("Usage: node validate-audit.mjs <audit-file>");
  process.exit(2);
}

try {
  const audit = JSON.parse(fs.readFileSync(auditFile, "utf8"));
  
  // Basic validation without external dependencies
  if (!audit.gate) {
    console.error("❌ Missing 'gate' property");
    process.exit(1);
  }
  
  if (!audit.gate.result) {
    console.error("❌ Missing 'gate.result' property");
    process.exit(1);
  }
  
  if (!audit.gate.result.status) {
    console.error("❌ Missing 'gate.result.status' property");
    process.exit(1);
  }
  
  const validStatuses = ["PASS", "WARN", "FAIL"];
  if (!validStatuses.includes(audit.gate.result.status)) {
    console.error(`❌ Invalid status: ${audit.gate.result.status}. Must be one of: ${validStatuses.join(", ")}`);
    process.exit(1);
  }

  console.log("✅ Audit file is valid");
  console.log(`📋 Status: ${audit.gate.result.status}`);
  if (audit.gate.result.reasons && audit.gate.result.reasons.length > 0) {
    console.log("📝 Reasons:");
    audit.gate.result.reasons.forEach(reason => console.log(`   - ${reason}`));
  }
} catch (e) {
  console.error("❌ Error:", e.message);
  process.exit(2);
}

console.log("VALIDATOR: OK");
process.exit(0);
