import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { runFeatureAdapter } from './zip-module-feature-adapters.js';

export interface ZipModuleRecord {
  name: string;
  moduleId: string;
  sourcePath: string;
  size: number;
  updatedAt: string;
  extractedPath?: string;
  entryPoint?: string | null;
  nativeEntryPoint?: string | null;
  runtimeAdapter?: string | null;
  featureTags?: string[];
  capabilities?: {
    executable?: boolean;
    featureDriven?: boolean;
    hasNativeEntrypoint?: boolean;
    executesNativeByDefault?: boolean;
  };
}

interface ZipManifest {
  generatedAt: string;
  totalZipFiles: number;
  modules: ZipModuleRecord[];
}

interface ZipModuleExecutor {
  execute?: (payload: Record<string, unknown>) => Promise<unknown> | unknown;
  default?: {
    execute?: (payload: Record<string, unknown>) => Promise<unknown> | unknown;
  };
}

export class ZipModuleConnector {
  private readonly repoRoot: string;
  private readonly manifestPath: string;

  constructor(repoRoot = process.cwd()) {
    this.repoRoot = repoRoot;
    this.manifestPath = path.join(this.repoRoot, 'external', 'zip-modules', 'manifest.json');
  }

  listModules(): ZipModuleRecord[] {
    const manifest = this.readManifest();
    return manifest?.modules ?? [];
  }

  getModule(moduleId: string): ZipModuleRecord | null {
    return this.listModules().find(module => module.moduleId === moduleId) ?? null;
  }

  hasModule(moduleId: string): boolean {
    return this.getModule(moduleId) !== null;
  }

  async invoke(moduleId: string, payload: Record<string, unknown>): Promise<unknown> {
    const moduleRecord = this.getModule(moduleId);

    if (!moduleRecord) {
      throw new Error(`Module ${moduleId} is unavailable in the zip registry`);
    }

    const executionEntries = this.resolveExecutionEntries(moduleRecord);
    for (const entryPoint of executionEntries) {
      const absoluteEntry = path.join(this.repoRoot, entryPoint);
      if (!fs.existsSync(absoluteEntry)) {
        continue;
      }

      try {
        const imported = (await import(pathToFileURL(absoluteEntry).href)) as ZipModuleExecutor;
        const execute = imported.execute ?? imported.default?.execute;
        if (typeof execute === 'function') {
          return execute(payload);
        }
      } catch {
        // Fall through to next candidate (typically runtime adapter fallback)
      }
    }

    return runFeatureAdapter({
      integration: String(payload.integration ?? 'database') as 'database' | 'cache' | 'queue',
      operation: String(payload.operation ?? 'process'),
      tenantId: String(payload.tenantId ?? 'default'),
      userId: typeof payload.userId === 'string' ? payload.userId : undefined,
      input: (payload.input as Record<string, unknown>) ?? {},
      featureTags: moduleRecord.featureTags ?? []
    });
  }

  private resolveExecutionEntries(moduleRecord: ZipModuleRecord): string[] {
    const entries = [
      moduleRecord.nativeEntryPoint,
      moduleRecord.entryPoint,
      moduleRecord.runtimeAdapter
    ].filter((entryPoint): entryPoint is string => Boolean(entryPoint));

    return [...new Set(entries)];
  }

  private readManifest(): ZipManifest | null {
    if (!fs.existsSync(this.manifestPath)) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(this.manifestPath, 'utf8')) as ZipManifest;
    } catch {
      return null;
    }
  }
}

export const zipModuleConnector = new ZipModuleConnector();
