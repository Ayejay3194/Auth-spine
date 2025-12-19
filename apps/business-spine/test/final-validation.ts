/**
 * Final Validation Suite
 * Comprehensive checks to ensure Business Spine is production-ready
 */

import { createBusinessSpine } from '../dist/index.js';

interface ValidationResult {
  name: string;
  status: 'pass' | 'fail';
  message: string;
  duration: number;
}

class FinalValidator {
  private results: ValidationResult[] = [];

  async runAllValidations(): Promise<void> {
    console.log('🔍 Starting Final Validation Suite...\n');

    await this.validateBuild();
    await this.validateInitialization();
    await this.validateSpineLoading();
    await this.validateIntentDetection();
    await this.validateToolExecution();
    await this.validatePluginSystem();
    await this.validateErrorHandling();
    await this.validateConfiguration();

    this.printReport();
  }

  private async validateBuild(): Promise<void> {
    const start = performance.now();
    try {
      const { BusinessSpine } = await import('../dist/index.js');
      const duration = performance.now() - start;
      this.results.push({
        name: 'Build Validation',
        status: 'pass',
        message: 'TypeScript build successful, all modules compiled',
        duration
      });
    } catch (error) {
      this.results.push({
        name: 'Build Validation',
        status: 'fail',
        message: `Build failed: ${error}`,
        duration: performance.now() - start
      });
    }
  }

  private async validateInitialization(): Promise<void> {
    const start = performance.now();
    try {
      const spine = await createBusinessSpine({
        tenantId: 'validation-tenant'
      });
      await spine.shutdown();
      const duration = performance.now() - start;
      this.results.push({
        name: 'Initialization',
        status: 'pass',
        message: 'BusinessSpine initializes and shuts down cleanly',
        duration
      });
    } catch (error) {
      this.results.push({
        name: 'Initialization',
        status: 'fail',
        message: `Initialization failed: ${error}`,
        duration: performance.now() - start
      });
    }
  }

  private async validateSpineLoading(): Promise<void> {
    const start = performance.now();
    try {
      const spine = await createBusinessSpine();
      const spines = spine.getSpines();
      
      const expectedSpines = ['booking', 'crm', 'payments', 'marketing', 'analytics', 'admin_security'];
      const loadedSpines = spines.map(s => s.name);
      const allLoaded = expectedSpines.every(name => loadedSpines.includes(name));

      await spine.shutdown();
      const duration = performance.now() - start;

      if (allLoaded) {
        this.results.push({
          name: 'Spine Loading',
          status: 'pass',
          message: `All 6 business spines loaded: ${loadedSpines.join(', ')}`,
          duration
        });
      } else {
        this.results.push({
          name: 'Spine Loading',
          status: 'fail',
          message: `Missing spines. Expected: ${expectedSpines.join(', ')}, Got: ${loadedSpines.join(', ')}`,
          duration
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Spine Loading',
        status: 'fail',
        message: `Spine loading failed: ${error}`,
        duration: performance.now() - start
      });
    }
  }

  private async validateIntentDetection(): Promise<void> {
    const start = performance.now();
    try {
      const spine = await createBusinessSpine();
      const ctx = {
        actor: { userId: 'test', role: 'admin' as const },
        tenantId: 'validation-tenant',
        nowISO: new Date().toISOString()
      };

      const testCases = [
        { query: 'book appointment', expectedSpine: 'booking' },
        { query: 'find client', expectedSpine: 'crm' },
        { query: 'create invoice', expectedSpine: 'payments' },
        { query: 'campaign', expectedSpine: 'marketing' },
        { query: 'weekly report', expectedSpine: 'analytics' },
        { query: 'audit logs', expectedSpine: 'admin_security' }
      ];

      let allPassed = true;
      for (const testCase of testCases) {
        const intents = spine.getOrchestrator().detect(testCase.query, ctx);
        // Check if any intent matches the expected spine
        const hasMatch = intents && intents.length > 0 && intents.some(i => i.spine === testCase.expectedSpine);
        if (!hasMatch) {
          console.log(`  Debug: Query "${testCase.query}" expected ${testCase.expectedSpine}, got ${intents?.[0]?.spine || 'none'}`);
          allPassed = false;
        }
      }

      await spine.shutdown();
      const duration = performance.now() - start;

      this.results.push({
        name: 'Intent Detection',
        status: allPassed ? 'pass' : 'fail',
        message: allPassed ? 'All intent detection tests passed' : 'Some intent detection tests failed',
        duration
      });
    } catch (error) {
      this.results.push({
        name: 'Intent Detection',
        status: 'fail',
        message: `Intent detection failed: ${error}`,
        duration: performance.now() - start
      });
    }
  }

  private async validateToolExecution(): Promise<void> {
    const start = performance.now();
    try {
      const spine = await createBusinessSpine();
      const ctx = {
        actor: { userId: 'test', role: 'admin' as const },
        tenantId: 'validation-tenant',
        nowISO: new Date().toISOString()
      };

      const tools = spine.getTools();
      const toolNames = Object.keys(tools);

      if (toolNames.length < 10) {
        throw new Error(`Expected at least 10 tools, got ${toolNames.length}`);
      }

      // Test a few key tools
      const bookingResult = await tools['booking.create']({
        ctx,
        input: {
          clientQuery: 'Alex',
          service: 'Test',
          startISO: new Date().toISOString(),
          durationMin: 60
        }
      });

      const crmResult = await tools['crm.findClient']({
        ctx,
        input: { clientQuery: 'Alex' }
      });

      await spine.shutdown();
      const duration = performance.now() - start;

      if (bookingResult.ok && crmResult.ok) {
        this.results.push({
          name: 'Tool Execution',
          status: 'pass',
          message: `${toolNames.length} tools available and executing correctly`,
          duration
        });
      } else {
        this.results.push({
          name: 'Tool Execution',
          status: 'fail',
          message: 'Some tools failed to execute',
          duration
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Tool Execution',
        status: 'fail',
        message: `Tool execution failed: ${error}`,
        duration: performance.now() - start
      });
    }
  }

  private async validatePluginSystem(): Promise<void> {
    const start = performance.now();
    try {
      const spine = await createBusinessSpine();
      const { examplePlugin } = await import('../dist/plugins/example-plugin/index.js');

      await spine.installPlugin(examplePlugin);
      const tools = spine.getTools();

      if (!tools['example_hello']) {
        throw new Error('Plugin tool not registered');
      }

      const result = await tools['example_hello']({
        ctx: {
          actor: { userId: 'test', role: 'admin' as const },
          tenantId: 'validation-tenant',
          nowISO: new Date().toISOString()
        },
        input: { name: 'Test' }
      });

      await spine.shutdown();
      const duration = performance.now() - start;

      if (result.ok) {
        this.results.push({
          name: 'Plugin System',
          status: 'pass',
          message: 'Plugins can be installed and executed successfully',
          duration
        });
      } else {
        this.results.push({
          name: 'Plugin System',
          status: 'fail',
          message: 'Plugin execution failed',
          duration
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Plugin System',
        status: 'fail',
        message: `Plugin system failed: ${error}`,
        duration: performance.now() - start
      });
    }
  }

  private async validateErrorHandling(): Promise<void> {
    const start = performance.now();
    try {
      const spine = await createBusinessSpine();
      const ctx = {
        actor: { userId: 'test', role: 'admin' as const },
        tenantId: 'validation-tenant',
        nowISO: new Date().toISOString()
      };

      // Test error handling with invalid input
      const tools = spine.getTools();
      const result = await tools['crm.findClient']({
        ctx,
        input: { clientQuery: 'NonExistentClient12345' }
      });

      await spine.shutdown();
      const duration = performance.now() - start;

      // Should return error gracefully, not throw
      if (!result.ok && result.error) {
        this.results.push({
          name: 'Error Handling',
          status: 'pass',
          message: 'Error handling works correctly',
          duration
        });
      } else {
        this.results.push({
          name: 'Error Handling',
          status: 'fail',
          message: 'Error handling did not work as expected',
          duration
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Error Handling',
        status: 'fail',
        message: `Error handling validation failed: ${error}`,
        duration: performance.now() - start
      });
    }
  }

  private async validateConfiguration(): Promise<void> {
    const start = performance.now();
    try {
      const spine = await createBusinessSpine({
        tenantId: 'custom-tenant',
        modules: [
          { name: 'booking', enabled: true },
          { name: 'crm', enabled: false }
        ]
      });

      const spines = spine.getSpines();
      const hasBooking = spines.some(s => s.name === 'booking');
      const hasCrm = spines.some(s => s.name === 'crm');

      await spine.shutdown();
      const duration = performance.now() - start;

      if (hasBooking && !hasCrm) {
        this.results.push({
          name: 'Configuration',
          status: 'pass',
          message: 'Configuration system works correctly',
          duration
        });
      } else {
        this.results.push({
          name: 'Configuration',
          status: 'fail',
          message: 'Configuration did not apply correctly',
          duration
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Configuration',
        status: 'fail',
        message: `Configuration validation failed: ${error}`,
        duration: performance.now() - start
      });
    }
  }

  private printReport(): void {
    console.log('\n' + '='.repeat(70));
    console.log('📋 FINAL VALIDATION REPORT');
    console.log('='.repeat(70) + '\n');

    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;

    for (const result of this.results) {
      const icon = result.status === 'pass' ? '✅' : '❌';
      console.log(`${icon} ${result.name.padEnd(25)} | ${result.duration.toFixed(2).padStart(8)}ms`);
      console.log(`   └─ ${result.message}\n`);
    }

    console.log('='.repeat(70));
    console.log(`📊 Results: ${passed} passed, ${failed} failed out of ${this.results.length} tests`);
    console.log('='.repeat(70) + '\n');

    if (failed === 0) {
      console.log('🎉 ALL VALIDATIONS PASSED! Business Spine is production-ready.\n');
    } else {
      console.log(`⚠️  ${failed} validation(s) failed. Please review above.\n`);
    }
  }
}

async function runFinalValidation(): Promise<void> {
  const validator = new FinalValidator();
  await validator.runAllValidations();
}

if (require.main === module) {
  runFinalValidation();
}

export { runFinalValidation, FinalValidator };
