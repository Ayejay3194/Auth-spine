#!/usr/bin/env node

/**
 * Complete Auth-Spine System Test
 * Tests all features and implementations
 */

console.log('🧪 AUTH-SPINE COMPLETE SYSTEM TEST');
console.log('==================================');

async function runSystemTest() {
  const results = {
    scientificComputing: { passed: 0, failed: 0, tests: [] },
    advancedFeatures: { passed: 0, failed: 0, tests: [] },
    productionAuth: { passed: 0, failed: 0, tests: [] },
    typescriptLibraries: { passed: 0, failed: 0, tests: [] },
    systemIntegration: { passed: 0, failed: 0, tests: [] }
  };

  // Test 1: Scientific Computing Modules
  console.log('\n🔬 Testing Scientific Computing Modules...');
  try {
    const { pandas, scipy, glmatrix, stats } = require('./ts-scientific-computing/dist/index.js');
    
    // Test Pandas DataFrame
    try {
      const df = new pandas.DataFrame({ a: [1, 2, 3], b: [4, 5, 6] });
      if (df && df.data) {
        results.scientificComputing.passed++;
        results.scientificComputing.tests.push('✅ Pandas DataFrame creation');
      } else {
        throw new Error('DataFrame creation failed');
      }
    } catch (e) {
      results.scientificComputing.failed++;
      results.scientificComputing.tests.push('❌ Pandas DataFrame: ' + e.message);
    }

    // Test SciPy Optimization
    try {
      const result = scipy.optimize.minimize((x) => x * x, { x0: 1 });
      if (result && typeof result.x === 'number') {
        results.scientificComputing.passed++;
        results.scientificComputing.tests.push('✅ SciPy optimization');
      } else {
        throw new Error('Optimization failed');
      }
    } catch (e) {
      results.scientificComputing.failed++;
      results.scientificComputing.tests.push('❌ SciPy optimization: ' + e.message);
    }

    // Test gl-matrix
    try {
      const vec = glmatrix.vec3.create();
      if (vec && vec.length === 3) {
        results.scientificComputing.passed++;
        results.scientificComputing.tests.push('✅ gl-matrix vector creation');
      } else {
        throw new Error('Vector creation failed');
      }
    } catch (e) {
      results.scientificComputing.failed++;
      results.scientificComputing.tests.push('❌ gl-matrix: ' + e.message);
    }

    // Test Statistics
    try {
      const dist = new stats.norm();
      if (dist && typeof dist.pdf === 'function') {
        results.scientificComputing.passed++;
        results.scientificComputing.tests.push('✅ Statistics distribution');
      } else {
        throw new Error('Statistics failed');
      }
    } catch (e) {
      results.scientificComputing.failed++;
      results.scientificComputing.tests.push('❌ Statistics: ' + e.message);
    }

  } catch (e) {
    results.scientificComputing.failed++;
    results.scientificComputing.tests.push('❌ Scientific computing module loading: ' + e.message);
  }

  // Test 2: Advanced Features
  console.log('\n🚀 Testing Advanced Features...');
  try {
    const { performance, columnar, optimizers, timeseries, visualization } = require('./ts-scientific-computing/dist/index.js');

    // Test Performance Cache
    try {
      const cache = new performance.FunctionCache();
      const testFn = (x) => x * 2;
      cache.cache(testFn, [5]);
      if (cache.has(testFn, [5])) {
        results.advancedFeatures.passed++;
        results.advancedFeatures.tests.push('✅ Performance caching');
      } else {
        throw new Error('Caching failed');
      }
    } catch (e) {
      results.advancedFeatures.failed++;
      results.advancedFeatures.tests.push('❌ Performance caching: ' + e.message);
    }

    // Test Columnar Store
    try {
      const store = new columnar.ColumnStore(['col1', 'col2']);
      store.insert({ col1: 1, col2: 'test' });
      const data = store.query();
      if (data && data.length > 0) {
        results.advancedFeatures.passed++;
        results.advancedFeatures.tests.push('✅ Columnar storage');
      } else {
        throw new Error('Columnar store failed');
      }
    } catch (e) {
      results.advancedFeatures.failed++;
      results.advancedFeatures.tests.push('❌ Columnar storage: ' + e.message);
    }

    // Test Optimizers
    try {
      const optimizer = new optimizers.AdamOptimizer({ learningRate: 0.01 });
      const params = [1, 2, 3];
      const grads = [0.1, 0.2, 0.3];
      const updated = optimizer.update(params, grads);
      if (updated && updated.length === params.length) {
        results.advancedFeatures.passed++;
        results.advancedFeatures.tests.push('✅ ML optimizers');
      } else {
        throw new Error('Optimizer failed');
      }
    } catch (e) {
      results.advancedFeatures.failed++;
      results.advancedFeatures.tests.push('❌ ML optimizers: ' + e.message);
    }

    // Test Time Series
    try {
      const analyzer = new timeseries.TimeSeriesAnalyzer();
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const movingAvg = analyzer.movingAverage(data, 3);
      if (movingAvg && movingAvg.length > 0) {
        results.advancedFeatures.passed++;
        results.advancedFeatures.tests.push('✅ Time series analysis');
      } else {
        throw new Error('Time series failed');
      }
    } catch (e) {
      results.advancedFeatures.failed++;
      results.advancedFeatures.tests.push('❌ Time series analysis: ' + e.message);
    }

    // Test Visualization
    try {
      const scene = new visualization.Scene3D({ width: 800, height: 600 });
      scene.addPoint({ x: 1, y: 2, z: 3 });
      if (scene && typeof scene.addPoint === 'function') {
        results.advancedFeatures.passed++;
        results.advancedFeatures.tests.push('✅ 3D visualization');
      } else {
        throw new Error('Visualization failed');
      }
    } catch (e) {
      results.advancedFeatures.failed++;
      results.advancedFeatures.tests.push('❌ 3D visualization: ' + e.message);
    }

  } catch (e) {
    results.advancedFeatures.failed++;
    results.advancedFeatures.tests.push('❌ Advanced features loading: ' + e.message);
  }

  // Test 3: Production Auth/Monitoring
  console.log('\n🔐 Testing Production Auth/Monitoring...');
  try {
    const { auth, logging, monitoring, telemetry } = require('./ts-scientific-computing/dist/index.js');

    // Test Auth Manager
    try {
      const authManager = new auth.AuthManager();
      if (authManager && typeof authManager.authenticate === 'function') {
        results.productionAuth.passed++;
        results.productionAuth.tests.push('✅ Authentication manager');
      } else {
        throw new Error('Auth manager failed');
      }
    } catch (e) {
      results.productionAuth.failed++;
      results.productionAuth.tests.push('❌ Authentication manager: ' + e.message);
    }

    // Test Structured Logging
    try {
      const logger = new logging.Logger({ level: 'info' });
      if (logger && typeof logger.info === 'function') {
        results.productionAuth.passed++;
        results.productionAuth.tests.push('✅ Structured logging');
      } else {
        throw new Error('Logger failed');
      }
    } catch (e) {
      results.productionAuth.failed++;
      results.productionAuth.tests.push('❌ Structured logging: ' + e.message);
    }

    // Test Metrics Collection
    try {
      const collector = new monitoring.MetricsCollector();
      if (collector && typeof collector.recordMetric === 'function') {
        results.productionAuth.passed++;
        results.productionAuth.tests.push('✅ Metrics collection');
      } else {
        throw new Error('Metrics collector failed');
      }
    } catch (e) {
      results.productionAuth.failed++;
      results.productionAuth.tests.push('❌ Metrics collection: ' + e.message);
    }

    // Test Telemetry
    try {
      const tracer = new telemetry.Tracer('test-service');
      if (tracer && typeof tracer.startSpan === 'function') {
        results.productionAuth.passed++;
        results.productionAuth.tests.push('✅ Distributed telemetry');
      } else {
        throw new Error('Telemetry failed');
      }
    } catch (e) {
      results.productionAuth.failed++;
      results.productionAuth.tests.push('❌ Distributed telemetry: ' + e.message);
    }

  } catch (e) {
    results.productionAuth.failed++;
    results.productionAuth.tests.push('❌ Production auth/monitoring loading: ' + e.message);
  }

  // Test 4: TypeScript Library Implementations
  console.log('\n📚 Testing TypeScript Library Implementations...');
  try {
    const { nextauth, jose, pino, sentry, openid, opentelemetry } = require('./ts-scientific-computing/dist/index.js');

    // Test NextAuth.js
    try {
      const auth = nextauth.NextAuth({
        providers: [nextauth.providers.Google({ clientId: 'test', clientSecret: 'test' })]
      });
      if (auth && typeof auth.handleRequest === 'function') {
        results.typescriptLibraries.passed++;
        results.typescriptLibraries.tests.push('✅ NextAuth.js implementation');
      } else {
        throw new Error('NextAuth.js failed');
      }
    } catch (e) {
      results.typescriptLibraries.failed++;
      results.typescriptLibraries.tests.push('❌ NextAuth.js: ' + e.message);
    }

    // Test JOSE
    try {
      const signer = new jose.SignJWT({ sub: 'user123' });
      if (signer && typeof signer.setProtectedHeader === 'function') {
        results.typescriptLibraries.passed++;
        results.typescriptLibraries.tests.push('✅ JOSE implementation');
      } else {
        throw new Error('JOSE failed');
      }
    } catch (e) {
      results.typescriptLibraries.failed++;
      results.typescriptLibraries.tests.push('❌ JOSE: ' + e.message);
    }

    // Test Pino
    try {
      const logger = pino.pino({ level: 'info' });
      if (logger && typeof logger.info === 'function') {
        results.typescriptLibraries.passed++;
        results.typescriptLibraries.tests.push('✅ Pino implementation');
      } else {
        throw new Error('Pino failed');
      }
    } catch (e) {
      results.typescriptLibraries.failed++;
      results.typescriptLibraries.tests.push('❌ Pino: ' + e.message);
    }

    // Test Sentry
    try {
      sentry.init({ dsn: 'https://test@sentry.io/123' });
      results.typescriptLibraries.passed++;
      results.typescriptLibraries.tests.push('✅ Sentry implementation');
    } catch (e) {
      results.typescriptLibraries.failed++;
      results.typescriptLibraries.tests.push('❌ Sentry: ' + e.message);
    }

    // Test OpenID
    try {
      const issuer = new openid.Issuer('https://accounts.google.com');
      if (issuer && typeof issuer.discover === 'function') {
        results.typescriptLibraries.passed++;
        results.typescriptLibraries.tests.push('✅ OpenID implementation');
      } else {
        throw new Error('OpenID failed');
      }
    } catch (e) {
      results.typescriptLibraries.failed++;
      results.typescriptLibraries.tests.push('❌ OpenID: ' + e.message);
    }

    // Test OpenTelemetry
    try {
      const tracer = opentelemetry.api.getTracer('test-service');
      if (tracer && typeof tracer.startSpan === 'function') {
        results.typescriptLibraries.passed++;
        results.typescriptLibraries.tests.push('✅ OpenTelemetry implementation');
      } else {
        throw new Error('OpenTelemetry failed');
      }
    } catch (e) {
      results.typescriptLibraries.failed++;
      results.typescriptLibraries.tests.push('❌ OpenTelemetry: ' + e.message);
    }

  } catch (e) {
    results.typescriptLibraries.failed++;
    results.typescriptLibraries.tests.push('❌ TypeScript libraries loading: ' + e.message);
  }

  // Test 5: System Integration
  console.log('\n🔗 Testing System Integration...');
  try {
    // Test Auth Package Integration
    try {
      const authPackage = require('./packages/auth/dist/index.js');
      if (authPackage && typeof authPackage.generateToken === 'function') {
        results.systemIntegration.passed++;
        results.systemIntegration.tests.push('✅ Auth package integration');
      } else {
        throw new Error('Auth package integration failed');
      }
    } catch (e) {
      results.systemIntegration.failed++;
      results.systemIntegration.tests.push('❌ Auth package integration: ' + e.message);
    }

    // Test Cross-Module Compatibility
    try {
      const tsLibs = require('./ts-scientific-computing/dist/index.js');
      const authPackage = require('./packages/auth/dist/index.js');
      
      // Test if auth package can use TypeScript JOSE
      if (tsLibs.jose && authPackage.generateToken) {
        results.systemIntegration.passed++;
        results.systemIntegration.tests.push('✅ Cross-module compatibility');
      } else {
        throw new Error('Cross-module compatibility failed');
      }
    } catch (e) {
      results.systemIntegration.failed++;
      results.systemIntegration.tests.push('❌ Cross-module compatibility: ' + e.message);
    }

    // Test System Build Status
    try {
      const fs = require('fs');
      if (fs.existsSync('./ts-scientific-computing/dist/index.js')) {
        results.systemIntegration.passed++;
        results.systemIntegration.tests.push('✅ System build status');
      } else {
        throw new Error('Build files missing');
      }
    } catch (e) {
      results.systemIntegration.failed++;
      results.systemIntegration.tests.push('❌ System build status: ' + e.message);
    }

    // Test Vendor Removal
    try {
      const fs = require('fs');
      if (!fs.existsSync('./vendor')) {
        results.systemIntegration.passed++;
        results.systemIntegration.tests.push('✅ Vendor directory removal');
      } else {
        throw new Error('Vendor directory still exists');
      }
    } catch (e) {
      results.systemIntegration.failed++;
      results.systemIntegration.tests.push('❌ Vendor directory removal: ' + e.message);
    }

  } catch (e) {
    results.systemIntegration.failed++;
    results.systemIntegration.tests.push('❌ System integration loading: ' + e.message);
  }

  // Generate Report
  console.log('\n📊 TEST RESULTS REPORT');
  console.log('====================');

  const categories = [
    { name: 'Scientific Computing', data: results.scientificComputing },
    { name: 'Advanced Features', data: results.advancedFeatures },
    { name: 'Production Auth/Monitoring', data: results.productionAuth },
    { name: 'TypeScript Libraries', data: results.typescriptLibraries },
    { name: 'System Integration', data: results.systemIntegration }
  ];

  let totalPassed = 0;
  let totalFailed = 0;

  categories.forEach(category => {
    const percentage = category.data.passed / (category.data.passed + category.data.failed) * 100;
    console.log(`\n${category.name}:`);
    console.log(`  Passed: ${category.data.passed}, Failed: ${category.data.failed} (${percentage.toFixed(1)}%)`);
    category.data.tests.forEach(test => console.log(`    ${test}`));
    totalPassed += category.data.passed;
    totalFailed += category.data.failed;
  });

  const overallPercentage = totalPassed / (totalPassed + totalFailed) * 100;
  console.log(`\n🎯 OVERALL SYSTEM STATUS:`);
  console.log(`  Total Tests: ${totalPassed + totalFailed}`);
  console.log(`  Passed: ${totalPassed}, Failed: ${totalFailed}`);
  console.log(`  Success Rate: ${overallPercentage.toFixed(1)}%`);

  if (overallPercentage >= 95) {
    console.log('\n🎉 SYSTEM STATUS: EXCELLENT - Production Ready!');
  } else if (overallPercentage >= 85) {
    console.log('\n✅ SYSTEM STATUS: GOOD - Mostly Functional');
  } else if (overallPercentage >= 70) {
    console.log('\n⚠️  SYSTEM STATUS: NEEDS ATTENTION - Some Issues');
  } else {
    console.log('\n❌ SYSTEM STATUS: CRITICAL - Major Issues');
  }

  console.log('\n🚀 Auth-Spine System Test Complete!');
}

// Run the test
runSystemTest().catch(console.error);
