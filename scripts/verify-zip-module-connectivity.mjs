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
let adapterFallbackExecutions = 0;

for (const mod of manifest.modules) {
  const executionCandidates = [mod.nativeEntryPoint, mod.entryPoint, mod.runtimeAdapter].filter(Boolean);
  if (executionCandidates.length === 0) {
    throw new Error(`Module ${mod.moduleId} has no entryPoint/runtimeAdapter/nativeEntryPoint`);
  }

  const hasNativeEntrypoint = Boolean(mod.capabilities?.hasNativeEntrypoint && mod.nativeEntryPoint);
  if (hasNativeEntrypoint) {
    nativeEntrypoints += 1;
  } else {
    runtimeAdapters += 1;
  }

  let moduleExecuted = false;
  let executedWithFallback = false;

  for (const candidate of executionCandidates) {
    const absolute = path.join(repoRoot, candidate);
    if (!fs.existsSync(absolute)) {
      continue;
    }

    try {
      const imported = await import(pathToFileURL(absolute).href);
      const execute = imported.execute ?? imported.default?.execute;
      if (typeof execute !== 'function') {
        continue;
      }

      const result = await execute({
        integration: 'database',
        operation: 'verify',
        tenantId: 'health-check',
        input: { a: 1, b: 2, text: 'connectivity check' }
      });

      if (!result || typeof result !== 'object') {
        throw new Error(`Module ${mod.moduleId} execute() returned invalid payload`);
      }

      moduleExecuted = true;
      executedWithFallback = hasNativeEntrypoint && candidate !== mod.nativeEntryPoint;
      break;
    } catch {
      // Try next candidate (native -> entryPoint -> runtime adapter)
    }
  }

  if (!moduleExecuted) {
    throw new Error(`Module ${mod.moduleId} failed to execute across all candidates`);
  }

  if (executedWithFallback) {
    adapterFallbackExecutions += 1;
  }

  executable += 1;
}

console.log(`✅ Verified ${executable}/${manifest.modules.length} zip modules are executable`);
console.log(`📊 Native entrypoints declared: ${nativeEntrypoints}`);
console.log(`📊 Runtime-adapter-only modules: ${runtimeAdapters}`);
console.log(`📊 Native->adapter fallbacks during execution: ${adapterFallbackExecutions}`);

if (requireNative && (runtimeAdapters > 0 || adapterFallbackExecutions > 0)) {
  throw new Error(
    `Native execution requirement failed (runtime-adapter-only=${runtimeAdapters}, native-fallbacks=${adapterFallbackExecutions}).`
  );
}
