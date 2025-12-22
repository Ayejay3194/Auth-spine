# Security Gate

This is a tiny CI-friendly gate that reads your LLM security audit JSON and exits with the right code.

## What it enforces

- Reads `gate.result.status` from the audit JSON
- Exits **1** on `FAIL`
- Exits **0** on `PASS` or `WARN`
- Exits **2** on malformed / missing fields

## Files

- `scripts/security-gate.mjs` (Node, no deps)
- `scripts/security-gate.ts` (TypeScript version)
- `schemas/audit-gate.schema.json` (minimal schema for gate fields)
- `scripts/validate-audit.mjs` (optional validator using Ajv)
- `examples/security-audit.pass.json`, `warn.json`, `fail.json`

## Usage (Node)

```bash
node scripts/security-gate.mjs examples/security-audit.fail.json
```

## Usage (TypeScript)

```bash
npx tsx scripts/security-gate.ts examples/security-audit.fail.json
```

## Optional: validate schema

Install Ajv:

```bash
npm i -D ajv
```

Then:

```bash
node scripts/validate-audit.mjs examples/security-audit.fail.json schemas/audit-gate.schema.json
```

## Suggested package.json scripts

```json
{
  "scripts": {
    "security:validate": "node scripts/validate-audit.mjs security-audit.json schemas/audit-gate.schema.json",
    "security:gate": "node scripts/security-gate.mjs security-audit.json"
  }
}
```
