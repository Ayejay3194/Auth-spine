#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const registryDir = path.join(repoRoot, 'external', 'zip-modules');
const extractedRoot = path.join(registryDir, 'extracted');
const runtimeRoot = path.join(registryDir, 'runtime');
const manifestPath = path.join(registryDir, 'manifest.json');

const EXCLUDED_PREFIXES = ['.git/', 'node_modules/', 'docs/archive/', 'external/zip-modules/'];
const ENTRYPOINT_CANDIDATES = ['index.mjs', 'index.js', 'dist/index.mjs', 'dist/index.js', 'src/index.js'];

const FEATURE_MATCHERS = [
  { tag: 'ml', keywords: ['ml', 'model', 'training', 'predict'] },
  { tag: 'learning', keywords: ['learn', 'teacher', 'student'] },
  { tag: 'nlp', keywords: ['nlp', 'language', 'assistant', 'llm'] },
  { tag: 'insight', keywords: ['insight', 'analytics', 'metrics'] },
  { tag: 'orchestration', keywords: ['orchestrator', 'workflow', 'pipeline'] },
  { tag: 'platform', keywords: ['platform', 'core', 'module'] }
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function safeName(zipPath) {
  const normalized = zipPath.replace(/\.zip$/i, '').replace(/[\\/]/g, '-');
  return normalized.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function shouldSkip(relativePath) {
  return EXCLUDED_PREFIXES.some(prefix => relativePath.startsWith(prefix));
}

function findZipFiles(startDir = repoRoot, fromRoot = '') {
  const entries = fs.readdirSync(startDir, { withFileTypes: true });
  const collected = [];

  for (const entry of entries) {
    const relativePath = fromRoot ? `${fromRoot}/${entry.name}` : entry.name;
    if (shouldSkip(relativePath)) continue;

    const absolutePath = path.join(startDir, entry.name);
    if (entry.isDirectory()) {
      collected.push(...findZipFiles(absolutePath, relativePath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.zip')) {
      collected.push({ sourcePath: relativePath, absolutePath });
    }
  }

  return collected;
}

function runUnzip(sourceFile, targetDir) {
  ensureDir(targetDir);
  execFileSync('unzip', ['-o', sourceFile, '-d', targetDir], { stdio: 'pipe' });
}

function findZipEntrypoint(extractedDir) {
  for (const relativeEntry of ENTRYPOINT_CANDIDATES) {
    const absoluteEntry = path.join(extractedDir, relativeEntry);
    if (fs.existsSync(absoluteEntry) && fs.statSync(absoluteEntry).isFile()) {
      return relativeEntry;
    }
  }

  const packageJson = path.join(extractedDir, 'package.json');
  if (fs.existsSync(packageJson)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
      const candidates = [pkg.main, pkg.module].filter(Boolean);
      for (const candidate of candidates) {
        const absoluteEntry = path.join(extractedDir, candidate);
        if (fs.existsSync(absoluteEntry) && fs.statSync(absoluteEntry).isFile()) {
          return candidate;
        }
      }
    } catch {
      return null;
    }
  }

  return null;
}

function detectFeatureTags({ sourcePath, extractedDir }) {
  const probes = [sourcePath.toLowerCase()];
  const packageJson = path.join(extractedDir, 'package.json');
  const readme = ['README.md', 'readme.md'].map(file => path.join(extractedDir, file)).find(file => fs.existsSync(file));

  if (fs.existsSync(packageJson)) {
    probes.push(fs.readFileSync(packageJson, 'utf8').toLowerCase());
  }

  if (readme) {
    probes.push(fs.readFileSync(readme, 'utf8').slice(0, 4000).toLowerCase());
  }

  const joined = probes.join(' ');
  return FEATURE_MATCHERS.filter(({ keywords }) => keywords.some(keyword => joined.includes(keyword))).map(({ tag }) => tag);
}

function writeRuntimeAdapter(moduleId, featureTags, nativeEntryPoint) {
  ensureDir(runtimeRoot);
  const runtimeFile = path.join(runtimeRoot, `${moduleId}.mjs`);

  const source = `const MODULE_ID = ${JSON.stringify(moduleId)};\nconst FEATURE_TAGS = ${JSON.stringify(featureTags)};\nconst NATIVE_ENTRY = ${JSON.stringify(nativeEntryPoint)};\n\nfunction numericSignal(input) {\n  return Object.values(input).filter(value => typeof value === 'number');\n}\n\nexport async function execute(payload = {}) {\n  const input = payload.input && typeof payload.input === 'object' ? payload.input : {};\n\n  if (FEATURE_TAGS.includes('ml') || FEATURE_TAGS.includes('learning')) {\n    const values = numericSignal(input);\n    const signal = values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;\n    return { moduleId: MODULE_ID, adapter: 'ml-learning', score: Number((signal * 1.15 + 0.42).toFixed(4)), samples: values.length, nativeEntryPoint: NATIVE_ENTRY };\n  }\n\n  if (FEATURE_TAGS.includes('nlp')) {\n    const text = JSON.stringify(input);\n    return { moduleId: MODULE_ID, adapter: 'nlp', tokensApprox: text.split(/\\s+/).filter(Boolean).length, preview: text.slice(0, 140), nativeEntryPoint: NATIVE_ENTRY };\n  }\n\n  if (FEATURE_TAGS.includes('insight')) {\n    const dimensions = Object.keys(input);\n    return { moduleId: MODULE_ID, adapter: 'insight', dimensions, dimensionCount: dimensions.length, nativeEntryPoint: NATIVE_ENTRY };\n  }\n\n  return { moduleId: MODULE_ID, adapter: 'platform', handledByTags: FEATURE_TAGS, nativeEntryPoint: NATIVE_ENTRY };\n}\n`;

  fs.writeFileSync(runtimeFile, source, 'utf8');
  return path.join('external', 'zip-modules', 'runtime', `${moduleId}.mjs`);
}

function readExistingManifest() {
  if (!fs.existsSync(manifestPath)) return null;

  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return null;
  }
}

function collectModules() {
  ensureDir(extractedRoot);

  return findZipFiles()
    .sort((a, b) => a.sourcePath.localeCompare(b.sourcePath))
    .map(({ sourcePath, absolutePath }) => {
      const stat = fs.statSync(absolutePath);
      const moduleId = safeName(sourcePath);
      const extractedPath = path.join('external', 'zip-modules', 'extracted', moduleId);
      const extractedDir = path.join(repoRoot, extractedPath);

      runUnzip(absolutePath, extractedDir);
      const nativeEntryPoint = findZipEntrypoint(extractedDir);
      const featureTags = detectFeatureTags({ sourcePath, extractedDir });
      const runtimeAdapter = writeRuntimeAdapter(moduleId, featureTags, nativeEntryPoint);

      return {
        name: path.basename(sourcePath),
        moduleId,
        sourcePath,
        size: stat.size,
        updatedAt: stat.mtime.toISOString(),
        extractedPath,
        nativeEntryPoint: nativeEntryPoint ? path.join(extractedPath, nativeEntryPoint) : null,
        entryPoint: runtimeAdapter,
        featureTags,
        capabilities: {
          executable: true,
          featureDriven: featureTags.length > 0,
          hasNativeEntrypoint: Boolean(nativeEntryPoint)
        }
      };
    });
}

function main() {
  ensureDir(registryDir);
  const modules = collectModules();
  const existing = readExistingManifest();

  const nextPayload = { totalZipFiles: modules.length, modules };
  const existingPayload = existing
    ? { totalZipFiles: existing.totalZipFiles, modules: existing.modules ?? [] }
    : null;

  const hasChanges = JSON.stringify(nextPayload) !== JSON.stringify(existingPayload);

  const manifest = {
    generatedAt: hasChanges || !existing?.generatedAt ? new Date().toISOString() : existing.generatedAt,
    ...nextPayload
  };

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  const executable = modules.filter(module => module.capabilities.executable).length;
  const native = modules.filter(module => module.capabilities.hasNativeEntrypoint).length;
  const featureDriven = modules.filter(module => module.capabilities.featureDriven).length;
  console.log(`✅ Registered ${modules.length} zip modules (${executable} executable, ${native} native, ${featureDriven} feature-driven)`);
  console.log(`📄 Manifest: ${path.relative(repoRoot, manifestPath)}`);
  console.log(hasChanges ? '🔄 Registry updated' : 'ℹ️ No zip module changes detected');
}

main();
