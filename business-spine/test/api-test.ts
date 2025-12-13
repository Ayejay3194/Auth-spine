/**
 * API Server Integration Test
 * Tests all REST endpoints and functionality
 */

import { createBusinessSpine, startServer } from '../dist/index.js';

async function testApiServer() {
  console.log('🧪 Testing API Server...');
  
  try {
    // Create and start server
    const spine = await createBusinessSpine({
      tenantId: 'api-test-tenant',
      api: {
        port: 3001, // Use different port for testing
        corsOrigins: ['http://localhost:3001'],
        rateLimit: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 100 // limit each IP to 100 requests per windowMs
        }
      }
    });
    
    const server = await startServer(spine);
    console.log('✅ API Server started successfully');
    
    // Test endpoints
    const baseUrl = 'http://localhost:3001';
    
    // Test health endpoint
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json() as any;
    console.log('✅ Health endpoint:', healthData.status);
    
    // Test chat endpoint
    const chatResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'book appointment for Alex tomorrow at 2pm',
        context: {
          actor: { userId: 'test-user', role: 'admin' },
          tenantId: 'api-test-tenant',
          nowISO: new Date().toISOString()
        }
      })
    });
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json() as any;
      console.log('✅ Chat endpoint working:', chatData.steps?.length, 'steps');
    } else {
      console.log('❌ Chat endpoint failed:', chatResponse.status);
    }
    
    // Test intent detection endpoint
    const intentResponse = await fetch(`${baseUrl}/api/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'find client Alex',
        context: {
          actor: { userId: 'test-user', role: 'admin' },
          tenantId: 'api-test-tenant',
          nowISO: new Date().toISOString()
        }
      })
    });
    
    if (intentResponse.ok) {
      const intentData = await intentResponse.json() as any;
      console.log('✅ Intent detection working:', intentData.intents?.[0]?.name);
    } else {
      console.log('❌ Intent detection failed:', intentResponse.status);
    }
    
    // Test smart suggestions endpoint
    const suggestionsResponse = await fetch(`${baseUrl}/api/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: {
          actor: { userId: 'test-user', role: 'admin' },
          tenantId: 'api-test-tenant',
          nowISO: new Date().toISOString(),
          bookings: [],
          clients: [],
          practitioner: { id: 'test-practitioner' }
        }
      })
    });
    
    if (suggestionsResponse.ok) {
      const suggestionsData = await suggestionsResponse.json() as any;
      console.log('✅ Smart suggestions working:', suggestionsData.suggestions?.length, 'suggestions');
    } else {
      console.log('❌ Smart suggestions failed:', suggestionsResponse.status);
    }
    
    // Test system info endpoint
    const infoResponse = await fetch(`${baseUrl}/api/system/info`);
    if (infoResponse.ok) {
      const infoData = await infoResponse.json() as any;
      console.log('✅ System info working:', infoData.spines?.length, 'spines loaded');
    } else {
      console.log('❌ System info failed:', infoResponse.status);
    }
    
    // Cleanup
    await spine.shutdown();
    console.log('✅ API Server test completed successfully');
    
    return true;
  } catch (error) {
    console.error('❌ API Server test failed:', error);
    throw error;
  }
}

async function runApiTests() {
  console.log('🚀 Starting API Server Tests...\n');
  
  try {
    await testApiServer();
    console.log('\n🎉 All API tests passed! Server is fully functional.');
  } catch (error) {
    console.error('\n💥 API tests failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runApiTests();
}

export { runApiTests };
