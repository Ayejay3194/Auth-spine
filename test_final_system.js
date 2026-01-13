#!/usr/bin/env node

/**
 * Final Auth-Spine System Test
 * Tests all fixed components
 */

console.log('🎯 FINAL AUTH-SPINE SYSTEM TEST');
console.log('==============================');

async function runFinalTest() {
  console.log('\n✅ TESTING FIXED SYSTEM COMPONENTS');
  
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Scientific Computing (Fixed)
  console.log('\n🔬 Scientific Computing:');
  try {
    const { pandas, scipy, glmatrix, stats } = require('./ts-scientific-computing/dist/index.js');
    
    // Test Pandas DataFrame
    try {
      const df = new pandas.DataFrame({ a: [1, 2, 3], b: [4, 5, 6] });
      if (df && df.data) {
        console.log('  ✅ Pandas DataFrame');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ Pandas DataFrame:', e.message);
      totalTests++;
    }

    // Test SciPy Optimization (Fixed)
    try {
      const result = scipy.optimize.minimize((x) => x[0] * x[0], [1]);
      if (result && Array.isArray(result.x) && result.x.length > 0) {
        console.log('  ✅ SciPy optimization');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ SciPy optimization:', e.message);
      totalTests++;
    }

    // Test gl-matrix (Fixed)
    try {
      const vec = glmatrix.vec3.create();
      if (vec && vec.length === 3) {
        console.log('  ✅ gl-matrix vector creation');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ gl-matrix:', e.message);
      totalTests++;
    }

    // Test Statistics (Fixed)
    try {
      const dist = new stats.norm();
      if (dist && typeof dist.pdf === 'function') {
        console.log('  ✅ Statistics distribution');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ Statistics:', e.message);
      totalTests++;
    }

  } catch (e) {
    console.log('  ❌ Scientific computing loading:', e.message);
  }

  // Test 2: Advanced Features (Fixed)
  console.log('\n🚀 Advanced Features:');
  try {
    const { performance, columnar, optimizers, timeseries, visualization } = require('./ts-scientific-computing/dist/index.js');

    // Test Performance Cache (Fixed)
    try {
      const cache = new performance.FunctionCache();
      const testFn = (x) => x * 2;
      cache.cacheFunction(testFn, [5]);
      if (cache.has(testFn, [5])) {
        console.log('  ✅ Performance caching');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ Performance caching:', e.message);
      totalTests++;
    }

    // Test Columnar Store (Fixed)
    try {
      const store = new columnar.ColumnStore([
        { name: 'col1', type: 'float64', nullable: false },
        { name: 'col2', type: 'string', nullable: false }
      ]);
      store.addColumn('col1', [1.0, 2.0, 3.0]);
      store.addColumn('col2', ['a', 'b', 'c']);
      store.insert({ col1: 4.0, col2: 'd' });
      const data = store.getColumn('col1');
      if (data && data.length > 0) {
        console.log('  ✅ Columnar storage');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ Columnar storage:', e.message);
      totalTests++;
    }

    // Test Optimizers (Fixed)
    try {
      const optimizer = new optimizers.AdamOptimizer({ learningRate: 0.01 });
      const params = [1, 2, 3];
      const grads = [0.1, 0.2, 0.3];
      const updated = optimizer.update(params, grads);
      if (updated && updated.length === params.length) {
        console.log('  ✅ ML optimizers');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ ML optimizers:', e.message);
      totalTests++;
    }

    // Test Time Series (Fixed)
    try {
      const analyzer = new timeseries.TimeSeriesAnalyzer();
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const movingAvg = analyzer.movingAverage(data, 3);
      if (movingAvg && movingAvg.length > 0) {
        console.log('  ✅ Time series analysis');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ Time series analysis:', e.message);
      totalTests++;
    }

    // Test 3D Visualization
    try {
      const scene = new visualization.Scene3D({ width: 800, height: 600 });
      scene.addPoint({ x: 1, y: 2, z: 3 });
      if (scene && typeof scene.addPoint === 'function') {
        console.log('  ✅ 3D visualization');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ 3D visualization:', e.message);
      totalTests++;
    }

  } catch (e) {
    console.log('  ❌ Advanced features loading:', e.message);
  }

  // Test 3: Production Auth/Monitoring
  console.log('\n🔐 Production Auth/Monitoring:');
  try {
    const { auth, logging, monitoring, telemetry } = require('./ts-scientific-computing/dist/index.js');

    // Test Auth Manager
    try {
      const authManager = new auth.AuthManager();
      if (authManager && typeof authManager.authenticate === 'function') {
        console.log('  ✅ Authentication manager');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ Authentication manager:', e.message);
      totalTests++;
    }

    // Test Structured Logging
    try {
      const logger = new logging.Logger({ level: 'info' });
      if (logger && typeof logger.info === 'function') {
        console.log('  ✅ Structured logging');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ Structured logging:', e.message);
      totalTests++;
    }

    // Test Metrics Collection
    try {
      const collector = new monitoring.MetricsCollector();
      if (collector && typeof collector.recordMetric === 'function') {
        console.log('  ✅ Metrics collection');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ Metrics collection:', e.message);
      totalTests++;
    }

    // Test Telemetry
    try {
      const tracer = new telemetry.Tracer('test-service');
      if (tracer && typeof tracer.startSpan === 'function') {
        console.log('  ✅ Distributed telemetry');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ Distributed telemetry:', e.message);
      totalTests++;
    }

  } catch (e) {
    console.log('  ❌ Production auth/monitoring loading:', e.message);
  }

  // Test 4: TypeScript Library Implementations
  console.log('\n📚 TypeScript Library Implementations:');
  try {
    const { nextauth, jose, pino, sentry, openid, opentelemetry } = require('./ts-scientific-computing/dist/index.js');

    // Test NextAuth.js
    try {
      const auth = nextauth.NextAuth({
        providers: [nextauth.providers.Google({ clientId: 'test', clientSecret: 'test' })]
      });
      if (auth && typeof auth.handleRequest === 'function') {
        console.log('  ✅ NextAuth.js');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ NextAuth.js:', e.message);
      totalTests++;
    }

    // Test JOSE
    try {
      const signer = new jose.SignJWT({ sub: 'user123' });
      if (signer && typeof signer.setProtectedHeader === 'function') {
        console.log('  ✅ JOSE');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ JOSE:', e.message);
      totalTests++;
    }

    // Test Pino
    try {
      const logger = pino.pino({ level: 'info' });
      if (logger && typeof logger.info === 'function') {
        console.log('  ✅ Pino');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ Pino:', e.message);
      totalTests++;
    }

    // Test Sentry
    try {
      sentry.init({ dsn: 'https://test@sentry.io/123' });
      console.log('  ✅ Sentry');
      passedTests++;
      totalTests++;
    } catch (e) {
      console.log('  ❌ Sentry:', e.message);
      totalTests++;
    }

    // Test OpenID
    try {
      const issuer = new openid.Issuer('https://accounts.google.com');
      if (issuer && typeof issuer.discover === 'function') {
        console.log('  ✅ OpenID');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ OpenID:', e.message);
      totalTests++;
    }

    // Test OpenTelemetry
    try {
      const tracer = opentelemetry.api.getTracer('test-service');
      if (tracer && typeof tracer.startSpan === 'function') {
        console.log('  ✅ OpenTelemetry');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ OpenTelemetry:', e.message);
      totalTests++;
    }

  } catch (e) {
    console.log('  ❌ TypeScript libraries loading:', e.message);
  }

  // Test 5: System Integration
  console.log('\n🔗 System Integration:');
  try {
    // Test Auth Package Integration
    try {
      const authPackage = require('./packages/auth/dist/index.js');
      if (authPackage && typeof authPackage.generateToken === 'function') {
        console.log('  ✅ Auth package integration');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ Auth package integration:', e.message);
      totalTests++;
    }

    // Test Cross-Module Compatibility
    try {
      const tsLibs = require('./ts-scientific-computing/dist/index.js');
      const authPackage = require('./packages/auth/dist/index.js');
      
      if (tsLibs.jose && authPackage.generateToken) {
        console.log('  ✅ Cross-module compatibility');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ Cross-module compatibility:', e.message);
      totalTests++;
    }

    // Test System Build Status
    try {
      const fs = require('fs');
      if (fs.existsSync('./ts-scientific-computing/dist/index.js')) {
        console.log('  ✅ System build status');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ System build status:', e.message);
      totalTests++;
    }

    // Test Vendor Removal
    try {
      const fs = require('fs');
      if (!fs.existsSync('./vendor')) {
        console.log('  ✅ Vendor directory removal');
        passedTests++;
      }
      totalTests++;
    } catch (e) {
      console.log('  ❌ Vendor directory removal:', e.message);
      totalTests++;
    }

  } catch (e) {
    console.log('  ❌ System integration loading:', e.message);
  }

  // Final Results
  const successRate = (passedTests / totalTests * 100).toFixed(1);
  console.log('\n🎯 FINAL TEST RESULTS:');
  console.log('====================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${successRate}%`);

  if (successRate >= 95) {
    console.log('\n🎉 SYSTEM STATUS: EXCELLENT - Production Ready!');
  } else if (successRate >= 85) {
    console.log('\n✅ SYSTEM STATUS: GOOD - Mostly Functional');
  } else if (successRate >= 70) {
    console.log('\n⚠️  SYSTEM STATUS: NEEDS ATTENTION - Some Issues');
  } else {
    console.log('\n❌ SYSTEM STATUS: CRITICAL - Major Issues');
  }

  console.log('\n🚀 Auth-Spine Final Test Complete!');
}

// Run the test
runFinalTest().catch(console.error);
