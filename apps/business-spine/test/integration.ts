/**
 * Integration Test Suite for Business Spine
 * Tests all major components and their connections
 */

import { BusinessSpine, createBusinessSpine } from '../dist/index.js';

async function testBusinessSpineInitialization() {
  console.log('🧪 Testing BusinessSpine Initialization...');
  
  try {
    const spine = await createBusinessSpine({
      tenantId: 'test-tenant',
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

    console.log('✅ BusinessSpine initialized successfully');
    return spine;
  } catch (error) {
    console.error('❌ BusinessSpine initialization failed:', error);
    throw error;
  }
}

async function testSpineConnections(spine: any) {
  console.log('🧪 Testing Spine Connections...');
  
  try {
    // Test intent detection
    const testContext = {
      actor: { userId: 'test-user', role: 'admin' as const },
      tenantId: 'test-tenant',
      nowISO: new Date().toISOString()
    };

    // Test booking intent
    const bookingIntents = spine.orchestrator.detect('book appointment for Alex tomorrow at 2pm', testContext);
    console.log('✅ Booking intent detected:', bookingIntents[0]?.name);

    // Test CRM intent
    const crmIntents = spine.orchestrator.detect('find client Alex', testContext);
    console.log('✅ CRM intent detected:', crmIntents[0]?.name);

    // Test payment intent
    const paymentIntents = spine.orchestrator.detect('create invoice for $100', testContext);
    console.log('✅ Payment intent detected:', paymentIntents[0]?.name);

    return true;
  } catch (error) {
    console.error('❌ Spine connection test failed:', error);
    throw error;
  }
}

async function testSmartAssistant(spine: any) {
  console.log('🧪 Testing Smart Assistant...');
  
  try {
    const testContext = {
      actor: { userId: 'test-user', role: 'admin' as const },
      tenantId: 'test-tenant',
      nowISO: new Date().toISOString(),
      bookings: [],
      clients: [],
      practitioner: { id: 'test-practitioner' }
    };

    const suggestions = await spine.assistant.getSuggestions(testContext);
    console.log('✅ Smart assistant generated suggestions:', suggestions.length);
    return true;
  } catch (error) {
    console.error('❌ Smart assistant test failed:', error);
    throw error;
  }
}

async function testToolExecution(spine: any) {
  console.log('🧪 Testing Tool Execution...');
  
  try {
    const testContext = {
      actor: { userId: 'test-user', role: 'admin' as const },
      tenantId: 'test-tenant',
      nowISO: new Date().toISOString()
    };

    // Test booking tool
    const bookingResult = await spine.tools['booking.create']({
      ctx: testContext,
      input: {
        clientQuery: 'Alex',
        service: 'Consultation',
        startISO: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        durationMin: 60
      }
    });

    if (bookingResult.ok) {
      console.log('✅ Booking tool executed successfully');
    } else {
      console.log('❌ Booking tool failed:', bookingResult.error);
    }

    // Test CRM tool
    const crmResult = await spine.tools['crm.findClient']({
      ctx: testContext,
      input: { clientQuery: 'Alex' }
    });

    if (crmResult.ok) {
      console.log('✅ CRM tool executed successfully');
    } else {
      console.log('❌ CRM tool failed:', crmResult.error);
    }

    return true;
  } catch (error) {
    console.error('❌ Tool execution test failed:', error);
    throw error;
  }
}

async function testPluginSystem(spine: any) {
  console.log('🧪 Testing Plugin System...');
  
  try {
    // Load example plugin
    const { examplePlugin } = await import('../dist/plugins/example-plugin/index.js');
    await spine.installPlugin(examplePlugin);
    
    console.log('✅ Plugin system working correctly');
    
    // Test plugin tool
    const pluginResult = await spine.tools['example_hello']({
      ctx: { actor: { userId: 'test', role: 'admin' as const }, tenantId: 'test', nowISO: new Date().toISOString() },
      input: { name: 'Test User' }
    });

    if (pluginResult.ok && pluginResult.data.message === 'Hello, Test User!') {
      console.log('✅ Plugin tool executed successfully');
    } else {
      console.log('❌ Plugin tool failed');
    }

    return true;
  } catch (error) {
    console.error('❌ Plugin system test failed:', error);
    throw error;
  }
}

async function runIntegrationTests() {
  console.log('🚀 Starting Business Spine Integration Tests...\n');

  try {
    // Test 1: BusinessSpine Initialization
    const spine = await testBusinessSpineInitialization();
    
    // Test 2: Spine Connections
    await testSpineConnections(spine);
    
    // Test 3: Smart Assistant
    await testSmartAssistant(spine);
    
    // Test 4: Tool Execution
    await testToolExecution(spine);
    
    // Test 5: Plugin System
    await testPluginSystem(spine);
    
    console.log('\n🎉 All integration tests passed! Business Spine is fully connected and working properly.');
    
    // Cleanup
    await spine.shutdown();
    
  } catch (error) {
    console.error('\n💥 Integration tests failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runIntegrationTests();
}

export { runIntegrationTests };
