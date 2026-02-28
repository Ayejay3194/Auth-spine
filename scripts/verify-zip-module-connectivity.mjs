#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repoRoot = process.cwd();
const manifestPath = path.join(repoRoot, 'external', 'zip-modules', 'manifest.json');
const requireNative = process.argv.includes('--require-native');

if (!fs.existsSync(manifestPath)) {
  throw new Error(`Missing manifest at ${manifestPath}`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

let executable = 0;
let nativeEntrypoints = 0;
let runtimeAdapters = 0;
let placeholderStyleResults = 0;

for (const mod of manifest.modules) {
  if (!mod.entryPoint) {
    throw new Error(`Module ${mod.moduleId} has no entryPoint`);
  }

  const absolute = path.join(repoRoot, mod.entryPoint);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Entry point missing for ${mod.moduleId}: ${mod.entryPoint}`);
  }

  const imported = await import(pathToFileURL(absolute).href);
  if (typeof imported.execute !== 'function') {
    throw new Error(`Entry point for ${mod.moduleId} does not export execute(payload)`);
  }

  const result = await imported.execute({
    integration: 'database',
    operation: 'verify',
    tenantId: 'health-check',
    input: { a: 1, b: 2, text: 'connectivity check' }
  });

  if (!result || typeof result !== 'object') {
    throw new Error(`Module ${mod.moduleId} execute() returned invalid payload`);
  }

  const hasNativeEntrypoint = Boolean(mod.capabilities?.hasNativeEntrypoint);
  if (hasNativeEntrypoint) {
    nativeEntrypoints += 1;
  } else {
    runtimeAdapters += 1;
  }

  if (typeof result.adapter === 'string') {
    placeholderStyleResults += 1;
  }

  executable += 1;
}

console.log(`✅ Verified ${executable}/${manifest.modules.length} zip modules are executable`);
console.log(`📊 Native entrypoints: ${nativeEntrypoints}`);
console.log(`📊 Runtime adapters: ${runtimeAdapters}`);
console.log(`📊 Adapter-shaped (placeholder-style) responses: ${placeholderStyleResults}`);

if (requireNative && runtimeAdapters > 0) {
  throw new Error(
    `Found ${runtimeAdapters} module(s) still using runtime adapters. Real native data path is not complete yet.`
  );
}
