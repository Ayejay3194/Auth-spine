/**
 * Consolidation Validation Test
 * Verifies that all consolidated modules are properly accessible
 */

import { describe, it, expect } from '@jest/globals';

describe('Consolidation Validation', () => {
  describe('Core Modules', () => {
    it('should import auth module', async () => {
      const { AuthManager } = await import('../src/core/auth');
      expect(AuthManager).toBeDefined();
    });

    it('should import monitoring module', async () => {
      const monitoring = await import('../src/core/monitoring');
      expect(monitoring).toBeDefined();
    });

    it('should import logging module', async () => {
      const logging = await import('../src/core/logging');
      expect(logging).toBeDefined();
    });

    it('should import telemetry module', async () => {
      const telemetry = await import('../src/core/telemetry');
      expect(telemetry).toBeDefined();
    });

    it('should import core index', async () => {
      const core = await import('../src/core');
      expect(core.CoreSystem).toBeDefined();
    });
  });

  describe('Library Wrappers', () => {
    it('should import jose library', async () => {
      const { jose } = await import('../src/libs/auth/jose');
      expect(jose).toBeDefined();
    });

    it('should import sentry library', async () => {
      const sentry = await import('../src/libs/monitoring/sentry');
      expect(sentry).toBeDefined();
    });

    it('should import pino library', async () => {
      const pino = await import('../src/libs/logging/pino');
      expect(pino).toBeDefined();
    });
  });

  describe('Computing Modules', () => {
    it('should import numpy ndarray', async () => {
      const { NDArray } = await import('../src/computing/data/numpy/core/ndarray');
      expect(NDArray).toBeDefined();
    });

    it('should import pandas dataframe', async () => {
      const pandas = await import('../src/computing/data/pandas/dataframe');
      expect(pandas).toBeDefined();
    });

    it('should import matplotlib pyplot', async () => {
      const pyplot = await import('../src/computing/visualization/matplotlib/pyplot');
      expect(pyplot).toBeDefined();
    });

    it('should import sklearn modules', async () => {
      const sklearn = await import('../src/computing/ml/sklearn');
      expect(sklearn).toBeDefined();
    });

    it('should import glmatrix', async () => {
      const { glmatrix } = await import('../src/computing/math/glmatrix');
      expect(glmatrix).toBeDefined();
    });

    it('should import scipy optimize', async () => {
      const scipy = await import('../src/computing/optimization/scipy/optimize');
      expect(scipy).toBeDefined();
    });
  });

  describe('Advanced Modules', () => {
    it('should import performance module', async () => {
      const performance = await import('../src/advanced/performance');
      expect(performance).toBeDefined();
    });

    it('should import ML optimizers', async () => {
      const optimizers = await import('../src/advanced/ml/optimizers');
      expect(optimizers).toBeDefined();
    });
  });

  describe('Utils Modules', () => {
    it('should import serialization utils', async () => {
      const serialization = await import('../src/utils/helpers/serialization');
      expect(serialization).toBeDefined();
    });

    it('should import validation utils', async () => {
      const validation = await import('../src/utils/validation/validation');
      expect(validation).toBeDefined();
    });
  });

  describe('Main Entry Point', () => {
    it('should import from main index', async () => {
      const main = await import('../src/index');
      expect(main).toBeDefined();
    });
  });

  describe('Path Aliases', () => {
    it('should support @core alias', async () => {
      // This test verifies tsconfig path aliases work
      expect(() => require.resolve('@core/auth')).not.toThrow();
    });

    it('should support @libs alias', async () => {
      expect(() => require.resolve('@libs/auth/jose')).not.toThrow();
    });

    it('should support @computing alias', async () => {
      expect(() => require.resolve('@computing/data/numpy')).not.toThrow();
    });
  });
});

describe('No Duplicate Files', () => {
  it('should not have duplicate auth.ts in src root', () => {
    const fs = require('fs');
    const path = require('path');
    const authPath = path.join(__dirname, '../src/auth.ts');
    expect(fs.existsSync(authPath)).toBe(false);
  });

  it('should not have duplicate monitoring.ts in src root', () => {
    const fs = require('fs');
    const path = require('path');
    const monitoringPath = path.join(__dirname, '../src/monitoring.ts');
    expect(fs.existsSync(monitoringPath)).toBe(false);
  });

  it('should not have duplicate logging.ts in src root', () => {
    const fs = require('fs');
    const path = require('path');
    const loggingPath = path.join(__dirname, '../src/logging.ts');
    expect(fs.existsSync(loggingPath)).toBe(false);
  });

  it('should not have duplicate telemetry.ts in src root', () => {
    const fs = require('fs');
    const path = require('path');
    const telemetryPath = path.join(__dirname, '../src/telemetry.ts');
    expect(fs.existsSync(telemetryPath)).toBe(false);
  });
});

describe('Structure Validation', () => {
  it('should have proper directory structure', () => {
    const fs = require('fs');
    const path = require('path');
    
    const requiredDirs = [
      'src/core',
      'src/libs',
      'src/computing',
      'src/advanced',
      'src/utils',
      'src/computing/data',
      'src/computing/math',
      'src/computing/optimization',
      'src/computing/visualization',
      'src/computing/ml',
    ];

    requiredDirs.forEach(dir => {
      const dirPath = path.join(__dirname, '..', dir);
      expect(fs.existsSync(dirPath)).toBe(true);
    });
  });

  it('should have index files for tree-shaking', () => {
    const fs = require('fs');
    const path = require('path');
    
    const requiredIndexes = [
      'src/core/index.ts',
      'src/libs/index.ts',
      'src/computing/index.ts',
      'src/advanced/index.ts',
      'src/utils/index.ts',
      'src/computing/data/index.ts',
      'src/computing/math/index.ts',
      'src/computing/ml/index.ts',
    ];

    requiredIndexes.forEach(indexFile => {
      const indexPath = path.join(__dirname, '..', indexFile);
      expect(fs.existsSync(indexPath)).toBe(true);
    });
  });
});
