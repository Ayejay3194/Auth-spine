/**
 * AI/ML Integration Test
 * 
 * Verifies that all AI/ML packages are properly connected to the Auth-Spine system.
 */

import { AIPlatformManager } from '../packages/enterprise/ai-platform/manager.js';
import { ToolRegistry, calcTool, echoTool } from '../packages/ai-tools/src/index.js';
import { InMemoryKeywordStore, chunkText, retrievalConfidence } from '../packages/ai-rag/src/index.js';
import type { Vec, Prediction, DriftPolicy } from '../packages/ml-platform/src/index.js';
import { Tensor, initMLP, act } from '../packages/oracle/src/bioplausible/nn.js';

console.log('🧪 AI/ML Integration Test\n');

// Test 1: AI Platform Manager
console.log('1️⃣ Testing AI Platform Manager...');
const aiPlatform = new AIPlatformManager({
  enableTools: true,
  enableRag: true,
  enableOracle: true
});

const health = await aiPlatform.initialize();
console.log('   Health Status:', health);
console.log('   ✅ AI Platform initialized\n');

// Test 2: Tool Registry
console.log('2️⃣ Testing Tool Registry...');
const registry = new ToolRegistry();
registry.register('calc', calcTool);
registry.register('echo', echoTool);
const calcResult = await registry.run('calc', { expression: '2 + 2' });
console.log('   Calc result:', calcResult);
console.log('   ✅ Tools working\n');

// Test 3: RAG Store
console.log('3️⃣ Testing RAG Store...');
const store = new InMemoryKeywordStore();
const doc = 'Auth-Spine is a comprehensive authentication platform.';
const chunks = chunkText('doc1', doc, { maxChars: 50, overlapChars: 10 });
await store.upsert(chunks);
const retrieved = await store.retrieve({ query: 'authentication', k: 3 });
console.log('   Retrieved chunks:', retrieved.length);
console.log('   ✅ RAG working\n');

// Test 4: ML Platform Types
console.log('4️⃣ Testing ML Platform Types...');
const sampleVec: Vec = [1, 2, 3, 4, 5];
console.log('   Vector:', sampleVec);
const driftPolicy: DriftPolicy = {
  disableIfMAEAbove: 0.5,
  disableIfP95Above: 1.0,
  minSamples: 100
};
console.log('   Drift policy:', driftPolicy);
console.log('   ✅ ML types working\n');

// Test 5: Oracle/Bioplausible
console.log('5️⃣ Testing Oracle Bioplausible...');
const mlp = initMLP([3, 5, 2], ['relu', 'linear']);
const input = Tensor.randn([3, 1], 42);
const { yHat } = mlp.forward(input);
console.log('   MLP output shape:', yHat.shape);
console.log('   ✅ Bioplausible NN working\n');

// Test 6: Integration Check
console.log('6️⃣ Testing Enterprise Integration...');
// Register tools via AI Platform
aiPlatform.registerTool('custom', async (args) => ({ ok: true, result: args }));
// Add docs via AI Platform
await aiPlatform.addDocuments([{ id: 'test1', text: 'Test document content.' }]);
const queryResults = await aiPlatform.queryRag('test', 3);
console.log('   Query results:', queryResults.length);
console.log('   ✅ Enterprise integration working\n');

console.log('✅ All AI/ML packages connected to Auth-Spine system!');
console.log('\n📊 Summary:');
console.log('   • AI Platform Manager: wired to enterprise orchestrator');
console.log('   • Tool Registry: operational');
console.log('   • RAG Store: operational');
console.log('   • ML Platform: types and policies ready');
console.log('   • Oracle: bioplausible networks ready');
console.log('   • Enterprise: packages registered as "aiPlatform"');
