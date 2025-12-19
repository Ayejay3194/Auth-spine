/**
 * Performance and Optimization Test Suite
 * Tests system performance under various loads and optimizes bottlenecks
 */

import { BusinessSpine, createBusinessSpine } from '../dist/index.js';

class PerformanceTester {
  private spine: BusinessSpine;
  private metrics: {
    initializationTime: number;
    intentDetectionTime: number;
    toolExecutionTime: number;
    memoryUsage: NodeJS.MemoryUsage[];
    errorCount: number;
  } = {
    initializationTime: 0,
    intentDetectionTime: 0,
    toolExecutionTime: 0,
    memoryUsage: [],
    errorCount: 0
  };

  constructor() {
    this.spine = null as any;
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Performance Tests...');
    
    const startTime = performance.now();
    
    this.spine = await createBusinessSpine({
      tenantId: 'performance-test-tenant',
      modules: [
        { name: 'booking', enabled: true },
        { name: 'crm', enabled: true },
        { name: 'payments', enabled: true },
        { name: 'marketing', enabled: true },
        { name: 'analytics', enabled: true },
        { name: 'admin_security', enabled: true }
      ],
      assistant: {
        enabled: true,
        engines: ['predictive_scheduling', 'client_behavior']
      }
    });
    
    this.metrics.initializationTime = performance.now() - startTime;
    console.log(`✅ Initialization completed in ${this.metrics.initializationTime.toFixed(2)}ms`);
  }

  async testIntentDetectionPerformance(): Promise<void> {
    console.log('🧪 Testing Intent Detection Performance...');
    
    const testContext = {
      actor: { userId: 'test-user', role: 'admin' as const },
      tenantId: 'performance-test-tenant',
      nowISO: new Date().toISOString()
    };

    const testQueries = [
      'book appointment for Alex tomorrow at 2pm',
      'find client Sarah Johnson',
      'create invoice for $150',
      'cancel booking 12345',
      'show weekly report',
      'add note to client John',
      'schedule follow-up for next week',
      'refund payment for invoice 67890',
      'create marketing campaign',
      'audit system logs'
    ];

    const startTime = performance.now();
    
    for (let i = 0; i < 100; i++) {
      const query = testQueries[i % testQueries.length];
      try {
        const intents = this.spine.getOrchestrator().detect(query, testContext);
        if (!intents || intents.length === 0) {
          this.metrics.errorCount++;
        }
      } catch (error) {
        this.metrics.errorCount++;
      }
      
      // Collect memory usage every 10 iterations
      if (i % 10 === 0) {
        this.metrics.memoryUsage.push(process.memoryUsage());
      }
    }
    
    this.metrics.intentDetectionTime = performance.now() - startTime;
    const avgTime = this.metrics.intentDetectionTime / 100;
    console.log(`✅ 100 intent detections completed in ${this.metrics.intentDetectionTime.toFixed(2)}ms`);
    console.log(`📊 Average time per detection: ${avgTime.toFixed(2)}ms`);
    console.log(`📊 Error rate: ${(this.metrics.errorCount / 100 * 100).toFixed(1)}%`);
  }

  async testToolExecutionPerformance(): Promise<void> {
    console.log('🧪 Testing Tool Execution Performance...');
    
    const testContext = {
      actor: { userId: 'test-user', role: 'admin' as const },
      tenantId: 'performance-test-tenant',
      nowISO: new Date().toISOString()
    };

    const toolTests = [
      {
        tool: 'booking.create',
        input: {
          clientQuery: 'Alex',
          service: 'Consultation',
          startISO: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          durationMin: 60
        }
      },
      {
        tool: 'crm.findClient',
        input: { clientQuery: 'Alex' }
      },
      {
        tool: 'payments.createInvoice',
        input: { clientQuery: 'Alex', amount: 100, memo: 'Test invoice' }
      },
      {
        tool: 'analytics.weekSummary',
        input: { nowISO: new Date().toISOString() }
      }
    ];

    const startTime = performance.now();
    
    for (let i = 0; i < 50; i++) {
      const toolTest = toolTests[i % toolTests.length];
      try {
        const result = await (this.spine as any).tools[toolTest.tool]({
          ctx: testContext,
          input: toolTest.input
        });
        
        if (!result.ok) {
          this.metrics.errorCount++;
        }
      } catch (error) {
        this.metrics.errorCount++;
      }
    }
    
    this.metrics.toolExecutionTime = performance.now() - startTime;
    const avgTime = this.metrics.toolExecutionTime / 50;
    console.log(`✅ 50 tool executions completed in ${this.metrics.toolExecutionTime.toFixed(2)}ms`);
    console.log(`📊 Average time per execution: ${avgTime.toFixed(2)}ms`);
  }

  async testMemoryUsage(): Promise<void> {
    console.log('🧪 Testing Memory Usage...');
    
    const initialMemory = process.memoryUsage();
    console.log(`📊 Initial memory: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    
    // Simulate heavy load
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(this.simulateHeavyLoad());
    }
    
    await Promise.all(promises);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage();
    console.log(`📊 Final memory: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`📊 Memory increase: ${((finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024).toFixed(2)}MB`);
  }

  private async simulateHeavyLoad(): Promise<void> {
    const testContext = {
      actor: { userId: 'test-user', role: 'admin' as const },
      tenantId: 'performance-test-tenant',
      nowISO: new Date().toISOString()
    };

    for (let i = 0; i < 100; i++) {
      // Simulate concurrent operations
      await Promise.all([
        (this.spine as any).orchestrator.detect(`test query ${i}`, testContext),
        (this.spine as any).tools['crm.findClient']({ ctx: testContext, input: { clientQuery: 'Alex' } })
      ]);
    }
  }

  async testConcurrentRequests(): Promise<void> {
    console.log('🧪 Testing Concurrent Request Handling...');
    
    const testContext = {
      actor: { userId: 'test-user', role: 'admin' as const },
      tenantId: 'performance-test-tenant',
      nowISO: new Date().toISOString()
    };

    const concurrentRequests = [];
    const startTime = performance.now();
    
    // Create 50 concurrent requests
    for (let i = 0; i < 50; i++) {
      concurrentRequests.push(
        this.spine.getOrchestrator().detect(`concurrent test ${i}`, testContext)
      );
    }
    
    const results = await Promise.allSettled(concurrentRequests);
    const endTime = performance.now();
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`✅ 50 concurrent requests completed in ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`📊 Successful: ${successful}, Failed: ${failed}`);
    console.log(`📊 Success rate: ${(successful / 50 * 100).toFixed(1)}%`);
  }

  generateReport(): void {
    console.log('\n📊 Performance Test Report');
    console.log('='.repeat(50));
    console.log(`⏱️  Initialization Time: ${this.metrics.initializationTime.toFixed(2)}ms`);
    console.log(`⚡ Intent Detection (100 calls): ${this.metrics.intentDetectionTime.toFixed(2)}ms`);
    console.log(`🔧 Tool Execution (50 calls): ${this.metrics.toolExecutionTime.toFixed(2)}ms`);
    console.log(`❌ Total Errors: ${this.metrics.errorCount}`);
    
    if (this.metrics.memoryUsage.length > 0) {
      const initialMemory = this.metrics.memoryUsage[0];
      const finalMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
      const memoryGrowth = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
      console.log(`💾 Memory Growth: ${memoryGrowth.toFixed(2)}MB`);
    }
    
    // Performance recommendations
    console.log('\n💡 Optimization Recommendations:');
    
    if (this.metrics.initializationTime > 1000) {
      console.log('⚠️  Consider optimizing module loading for faster startup');
    }
    
    if (this.metrics.intentDetectionTime > 500) {
      console.log('⚠️  Intent detection could be optimized with better algorithms');
    }
    
    if (this.metrics.toolExecutionTime > 1000) {
      console.log('⚠️  Tool execution may benefit from caching or batching');
    }
    
    if (this.metrics.errorCount > 5) {
      console.log('⚠️  High error rate detected - review error handling');
    }
    
    console.log('\n✅ Performance testing completed!');
  }

  async cleanup(): Promise<void> {
    if (this.spine) {
      await this.spine.shutdown();
    }
  }
}

async function runPerformanceTests(): Promise<void> {
  const tester = new PerformanceTester();
  
  try {
    await tester.initialize();
    await tester.testIntentDetectionPerformance();
    await tester.testToolExecutionPerformance();
    await tester.testMemoryUsage();
    await tester.testConcurrentRequests();
    tester.generateReport();
  } catch (error) {
    console.error('❌ Performance tests failed:', error);
  } finally {
    await tester.cleanup();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPerformanceTests();
}

export { runPerformanceTests, PerformanceTester };
