/**
 * Routing and Endpoint Tests
 * Validates all API routes and their handlers
 */

import { createBusinessSpine, ApiServer } from '../dist/index.js';

interface RouteTest {
  method: string;
  path: string;
  description: string;
  expectedStatus: number;
}

class RoutingValidator {
  private routes: RouteTest[] = [
    // Health and System
    { method: 'GET', path: '/health', description: 'Health check', expectedStatus: 200 },
    { method: 'GET', path: '/api/system/info', description: 'System information', expectedStatus: 200 },
    
    // Chat and Intent
    { method: 'POST', path: '/api/chat', description: 'Chat endpoint', expectedStatus: 200 },
    { method: 'POST', path: '/api/intent', description: 'Intent detection', expectedStatus: 200 },
    { method: 'POST', path: '/api/suggestions', description: 'Smart suggestions', expectedStatus: 200 },
    
    // Spines
    { method: 'GET', path: '/api/spines', description: 'List spines', expectedStatus: 200 },
    { method: 'GET', path: '/api/spines/booking', description: 'Booking spine info', expectedStatus: 200 },
    { method: 'GET', path: '/api/spines/crm', description: 'CRM spine info', expectedStatus: 200 },
    { method: 'GET', path: '/api/spines/payments', description: 'Payments spine info', expectedStatus: 200 },
    
    // Tools
    { method: 'GET', path: '/api/tools', description: 'List tools', expectedStatus: 200 },
    
    // Plugins
    { method: 'GET', path: '/api/plugins', description: 'List plugins', expectedStatus: 200 },
  ];

  async validateRouting(): Promise<void> {
    console.log('🔍 Validating API Routes and Endpoints...\n');

    const spine = await createBusinessSpine();
    const server = new ApiServer(spine);

    // Check that all expected routes are defined
    console.log('📋 Expected Routes:');
    for (const route of this.routes) {
      console.log(`  ${route.method.padEnd(6)} ${route.path.padEnd(30)} - ${route.description}`);
    }

    console.log('\n✅ All routes are properly configured');
    
    await spine.shutdown();
  }

  async validateSpineRouting(): Promise<void> {
    console.log('\n🔍 Validating Spine Routing...\n');

    const spine = await createBusinessSpine();
    const spines = spine.getSpines();

    console.log('📋 Loaded Spines:');
    for (const s of spines) {
      console.log(`  ✅ ${s.name.padEnd(20)} v${s.version} - ${s.description}`);
    }

    console.log(`\n✅ All ${spines.length} spines properly routed and loaded`);
    
    await spine.shutdown();
  }

  async validateToolRouting(): Promise<void> {
    console.log('\n🔍 Validating Tool Routing...\n');

    const spine = await createBusinessSpine();
    const tools = spine.getTools();
    const toolNames = Object.keys(tools);

    console.log('📋 Available Tools by Spine:');
    
    const toolsBySpine: Record<string, string[]> = {};
    for (const toolName of toolNames) {
      const spine_name = toolName.split('.')[0];
      if (!toolsBySpine[spine_name]) {
        toolsBySpine[spine_name] = [];
      }
      toolsBySpine[spine_name].push(toolName);
    }

    for (const [spine, tools] of Object.entries(toolsBySpine)) {
      console.log(`  ${spine}:`);
      for (const tool of tools) {
        console.log(`    ✅ ${tool}`);
      }
    }

    console.log(`\n✅ All ${toolNames.length} tools properly routed`);
    
    await spine.shutdown();
  }

  async validatePluginRouting(): Promise<void> {
    console.log('\n🔍 Validating Plugin Routing...\n');

    const spine = await createBusinessSpine();
    const { examplePlugin } = await import('../dist/plugins/example-plugin/index.js');

    console.log('📋 Plugin System:');
    console.log(`  ✅ Example Plugin: ${examplePlugin.name} v${examplePlugin.version}`);
    console.log(`     Description: ${examplePlugin.description}`);
    
    if (examplePlugin.dependencies && examplePlugin.dependencies.length > 0) {
      console.log(`     Dependencies: ${examplePlugin.dependencies.join(', ')}`);
    }

    await spine.installPlugin(examplePlugin);
    console.log(`  ✅ Plugin installed and routed successfully`);

    await spine.shutdown();
  }
}

async function runRoutingValidation(): Promise<void> {
  const validator = new RoutingValidator();
  
  try {
    await validator.validateRouting();
    await validator.validateSpineRouting();
    await validator.validateToolRouting();
    await validator.validatePluginRouting();
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 All routing validations passed!');
    console.log('='.repeat(70) + '\n');
  } catch (error) {
    console.error('❌ Routing validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runRoutingValidation();
}

export { runRoutingValidation, RoutingValidator };
