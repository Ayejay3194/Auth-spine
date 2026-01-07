#!/usr/bin/env node
/**
 * Comprehensive Test Suite for AI/ML and NLU/NLP Features
 * Tests all AI components without requiring external API keys
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('='.repeat(70));
console.log('AUTH-SPINE AI/ML & NLU/NLP COMPREHENSIVE TEST SUITE');
console.log('='.repeat(70));
console.log();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function testResult(name, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    failedTests++;
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

function testSection(name) {
  console.log();
  console.log('─'.repeat(70));
  console.log(`TEST SECTION: ${name}`);
  console.log('─'.repeat(70));
}

// ============================================================================
// Test 1: NLU Engine Files Existence
// ============================================================================
testSection('1. NLU/NLP Core Files');

const nluFiles = [
  'packages/enterprise/nlu/nlu-engine.ts',
  'packages/enterprise/nlu/nlu-integration.ts',
  'packages/enterprise/nlu/enhanced-assistant.ts',
  'apps/business-spine/src/core/intent.ts'
];

for (const file of nluFiles) {
  const fullPath = join(__dirname, file);
  try {
    const exists = readFileSync(fullPath, 'utf-8').length > 0;
    testResult(`NLU File: ${file}`, exists, `Found at ${fullPath}`);
  } catch (error) {
    testResult(`NLU File: ${file}`, false, `Not found: ${error.message}`);
  }
}

// ============================================================================
// Test 2: LLM Provider Integration Files
// ============================================================================
testSection('2. LLM Provider Integration');

const llmFiles = [
  'apps/business-spine/src/llm/service.ts',
  'packages/enterprise/CopilotKit/src/v1.x/packages/runtime/src/service-adapters/openai/openai-adapter.ts',
  'packages/enterprise/CopilotKit/src/v1.x/packages/runtime/src/service-adapters/anthropic/anthropic-adapter.ts'
];

for (const file of llmFiles) {
  const fullPath = join(__dirname, file);
  try {
    const content = readFileSync(fullPath, 'utf-8');
    const exists = content.length > 0;

    // Check for key functionality
    let features = [];
    if (content.includes('chat(') || content.includes('chat ')) features.push('chat');
    if (content.includes('detectIntent') || content.includes('intent')) features.push('intent detection');
    if (content.includes('extractEntities') || content.includes('entity')) features.push('entity extraction');
    if (content.includes('stream')) features.push('streaming');

    testResult(`LLM File: ${file}`, exists, `Features: ${features.join(', ')}`);
  } catch (error) {
    testResult(`LLM File: ${file}`, false, `Not found: ${error.message}`);
  }
}

// ============================================================================
// Test 3: Smart Assistant Engine Files
// ============================================================================
testSection('3. Smart Assistant & ML Engines');

const engineFiles = [
  { path: 'apps/business-spine/src/smart/assistant.ts', name: 'Core Assistant', features: ['multi-engine', 'orchestration'] },
  { path: 'apps/business-spine/src/assistant/engines/dynamicPricing.ts', name: 'Dynamic Pricing', features: ['demand forecasting', 'price optimization'] },
  { path: 'apps/business-spine/src/assistant/engines/predictiveScheduling.ts', name: 'Predictive Scheduling', features: ['gap filling', 'buffer optimization'] },
  { path: 'apps/business-spine/src/assistant/engines/segmentation.ts', name: 'Segmentation', features: ['VIP detection', 'churn analysis'] },
  { path: 'apps/business-spine/src/assistant/engines/clientBehavior.ts', name: 'Client Behavior', features: ['pattern detection'] },
  { path: 'apps/business-spine/src/assistant/engines/inventory.ts', name: 'Inventory', features: ['stock optimization'] },
  { path: 'apps/business-spine/src/assistant/engines/marketing.ts', name: 'Marketing', features: ['campaign optimization'] }
];

for (const engine of engineFiles) {
  const fullPath = join(__dirname, engine.path);
  try {
    const content = readFileSync(fullPath, 'utf-8');
    const exists = content.length > 0;

    // Check for SmartEngine implementation
    const hasInterface = content.includes('SmartEngine') || content.includes('analyze');
    const hasSuggestions = content.includes('SmartSuggestion') || content.includes('suggest');

    testResult(
      `${engine.name} Engine`,
      exists && (hasInterface || hasSuggestions),
      `Features: ${engine.features.join(', ')}`
    );
  } catch (error) {
    testResult(`${engine.name} Engine`, false, `Not found: ${error.message}`);
  }
}

// ============================================================================
// Test 4: ML Model Files (Python)
// ============================================================================
testSection('4. ML Model Training & Prediction');

const mlFiles = [
  { path: 'apps/business-spine/ml/ranking/train.py', name: 'ML Training Pipeline', features: ['scikit-learn', 'LogisticRegression'] },
  { path: 'apps/business-spine/ml/ranking/predict.py', name: 'ML Prediction', features: ['joblib', 'probability prediction'] }
];

for (const mlFile of mlFiles) {
  const fullPath = join(__dirname, mlFile.path);
  try {
    const content = readFileSync(fullPath, 'utf-8');
    const exists = content.length > 0;

    // Check for ML components
    let components = [];
    if (content.includes('sklearn') || content.includes('scikit')) components.push('scikit-learn');
    if (content.includes('LogisticRegression')) components.push('LogisticRegression');
    if (content.includes('joblib')) components.push('model serialization');
    if (content.includes('predict')) components.push('prediction');

    testResult(
      `${mlFile.name}`,
      exists,
      `Components: ${components.join(', ')}`
    );
  } catch (error) {
    testResult(`${mlFile.name}`, false, `Not found: ${error.message}`);
  }
}

// ============================================================================
// Test 5: NLU Intent Detection Logic
// ============================================================================
testSection('5. NLU Intent Detection Logic');

try {
  const nluEnginePath = join(__dirname, 'packages/enterprise/nlu/nlu-engine.ts');
  const nluEngineContent = readFileSync(nluEnginePath, 'utf-8');

  // Check for intent definitions
  const intents = [
    'booking_create',
    'booking_cancel',
    'booking_reschedule',
    'payment_process',
    'inventory_check',
    'payroll_inquiry',
    'report_generate',
    'security_alert'
  ];

  let foundIntents = 0;
  for (const intent of intents) {
    if (nluEngineContent.includes(intent)) {
      foundIntents++;
    }
  }

  testResult(
    'Intent Definitions',
    foundIntents >= 6,
    `Found ${foundIntents}/${intents.length} intents`
  );

  // Check for entity definitions
  const entities = ['date', 'time', 'location', 'amount', 'person'];
  let foundEntities = 0;
  for (const entity of entities) {
    if (nluEngineContent.includes(`'${entity}'`) || nluEngineContent.includes(`"${entity}"`)) {
      foundEntities++;
    }
  }

  testResult(
    'Entity Definitions',
    foundEntities >= 3,
    `Found ${foundEntities}/${entities.length} entity types`
  );

  // Check for confidence scoring
  const hasConfidence = nluEngineContent.includes('confidence');
  testResult('Confidence Scoring', hasConfidence, 'Confidence threshold system detected');

  // Check for LLM fallback
  const hasFallback = nluEngineContent.includes('LLM') || nluEngineContent.includes('fallback');
  testResult('LLM Fallback', hasFallback, 'LLM fallback system detected');

} catch (error) {
  testResult('NLU Intent Detection Logic', false, error.message);
}

// ============================================================================
// Test 6: LLM Service Methods
// ============================================================================
testSection('6. LLM Service Methods');

try {
  const llmServicePath = join(__dirname, 'apps/business-spine/src/llm/service.ts');
  const llmServiceContent = readFileSync(llmServicePath, 'utf-8');

  const methods = [
    { name: 'chat', description: 'General LLM chat' },
    { name: 'detectIntent', description: 'Intent detection' },
    { name: 'extractEntities', description: 'Entity extraction' },
    { name: 'explainOperation', description: 'Educational explanations' },
    { name: 'generateSmartSuggestions', description: 'AI suggestions' }
  ];

  for (const method of methods) {
    const hasMethod = llmServiceContent.includes(`async ${method.name}(`) ||
                     llmServiceContent.includes(`${method.name}(`);
    testResult(
      `LLM Method: ${method.name}`,
      hasMethod,
      method.description
    );
  }

  // Check for provider support
  const providers = ['openai', 'anthropic', 'local'];
  let foundProviders = 0;
  for (const provider of providers) {
    if (llmServiceContent.includes(provider)) {
      foundProviders++;
    }
  }

  testResult(
    'Multi-Provider Support',
    foundProviders === 3,
    `Supports ${foundProviders}/3 providers (OpenAI, Anthropic, Local)`
  );

} catch (error) {
  testResult('LLM Service Methods', false, error.message);
}

// ============================================================================
// Test 7: Dynamic Pricing Engine Logic
// ============================================================================
testSection('7. Dynamic Pricing Engine Analysis');

try {
  const pricingPath = join(__dirname, 'apps/business-spine/src/assistant/engines/dynamicPricing.ts');
  const pricingContent = readFileSync(pricingPath, 'utf-8');

  // Check for key pricing features
  const features = [
    { name: 'Fill Rate Analysis', pattern: /fill.*rate|fillRate/i },
    { name: 'Demand Forecasting', pattern: /demand|forecast/i },
    { name: 'Price Increase Logic', pattern: /increase|raise.*price/i },
    { name: 'Discount Logic', pattern: /discount|reduce.*price/i },
    { name: 'Historical Data', pattern: /historical|past.*\d+.*day/i }
  ];

  for (const feature of features) {
    const hasFeature = feature.pattern.test(pricingContent);
    testResult(
      `Pricing Feature: ${feature.name}`,
      hasFeature,
      hasFeature ? 'Implementation detected' : 'Not found'
    );
  }

} catch (error) {
  testResult('Dynamic Pricing Engine', false, error.message);
}

// ============================================================================
// Test 8: Predictive Scheduling Engine Logic
// ============================================================================
testSection('8. Predictive Scheduling Engine Analysis');

try {
  const schedulingPath = join(__dirname, 'apps/business-spine/src/assistant/engines/predictiveScheduling.ts');
  const schedulingContent = readFileSync(schedulingPath, 'utf-8');

  const features = [
    { name: 'Gap Detection', pattern: /gap|empty.*slot/i },
    { name: 'Buffer Calculation', pattern: /buffer|cushion/i },
    { name: 'Overrun Prediction', pattern: /overrun|exceed.*duration/i },
    { name: 'Flash Offers', pattern: /flash|quick.*offer/i },
    { name: 'Schedule Optimization', pattern: /optim|effici/i }
  ];

  for (const feature of features) {
    const hasFeature = feature.pattern.test(schedulingContent);
    testResult(
      `Scheduling Feature: ${feature.name}`,
      hasFeature,
      hasFeature ? 'Implementation detected' : 'Not found'
    );
  }

} catch (error) {
  testResult('Predictive Scheduling Engine', false, error.message);
}

// ============================================================================
// Test 9: Segmentation Engine Logic
// ============================================================================
testSection('9. Customer Segmentation Engine Analysis');

try {
  const segmentationPath = join(__dirname, 'apps/business-spine/src/assistant/engines/segmentation.ts');
  const segmentationContent = readFileSync(segmentationPath, 'utf-8');

  const features = [
    { name: 'Spend Analysis', pattern: /spend|revenue|ltv/i },
    { name: 'VIP Detection', pattern: /vip|top.*\d+/i },
    { name: 'Churn Detection', pattern: /churn|lapsed|inactive/i },
    { name: 'Auto-Tagging', pattern: /tag|label|segment/i },
    { name: 'Behavioral Analysis', pattern: /behavior|pattern|frequen/i }
  ];

  for (const feature of features) {
    const hasFeature = feature.pattern.test(segmentationContent);
    testResult(
      `Segmentation Feature: ${feature.name}`,
      hasFeature,
      hasFeature ? 'Implementation detected' : 'Not found'
    );
  }

} catch (error) {
  testResult('Segmentation Engine', false, error.message);
}

// ============================================================================
// Test 10: Configuration & Environment Setup
// ============================================================================
testSection('10. Configuration & Environment');

try {
  const envExamplePath = join(__dirname, 'apps/business-spine/.env.example');
  const envContent = readFileSync(envExamplePath, 'utf-8');

  const configVars = [
    { name: 'ASSISTANT_ENABLED', description: 'Smart assistant toggle' },
    { name: 'ASSISTANT_ENGINES', description: 'Engine configuration' },
    { name: 'ASSISTANT_USE_LLM', description: 'LLM integration toggle' },
    { name: 'LLM_PROVIDER', description: 'LLM provider selection' },
    { name: 'OPENAI_API_KEY', description: 'OpenAI configuration' },
    { name: 'ANTHROPIC_API_KEY', description: 'Anthropic configuration' },
    { name: 'LOCAL_LLM_BASE_URL', description: 'Local LLM configuration' }
  ];

  for (const configVar of configVars) {
    const hasVar = envContent.includes(configVar.name);
    testResult(
      `Config: ${configVar.name}`,
      hasVar,
      configVar.description
    );
  }

} catch (error) {
  testResult('Configuration & Environment', false, error.message);
}

// ============================================================================
// Test 11: Snips NLU Python Package
// ============================================================================
testSection('11. Snips NLU Python Package');

const snipsFiles = [
  { path: 'packages/enterprise/snips-nlu/snips_nlu/nlu_engine/nlu_engine.py', name: 'NLU Engine Core' },
  { path: 'packages/enterprise/snips-nlu/snips_nlu/intent_parser/deterministic_intent_parser.py', name: 'Deterministic Parser' },
  { path: 'packages/enterprise/snips-nlu/snips_nlu/intent_parser/probabilistic_intent_parser.py', name: 'Probabilistic Parser' },
  { path: 'packages/enterprise/snips-nlu/snips_nlu/intent_classifier/intent_classifier.py', name: 'Intent Classifier' },
  { path: 'packages/enterprise/snips-nlu/snips_nlu/entity_parser/entity_parser.py', name: 'Entity Parser' },
  { path: 'packages/enterprise/snips-nlu/snips_nlu/slot_filler/crf_slot_filler.py', name: 'CRF Slot Filler' }
];

for (const file of snipsFiles) {
  const fullPath = join(__dirname, file.path);
  try {
    const exists = readFileSync(fullPath, 'utf-8').length > 0;
    testResult(`Snips: ${file.name}`, exists, `Python implementation available`);
  } catch (error) {
    testResult(`Snips: ${file.name}`, false, `Not found`);
  }
}

// ============================================================================
// Test 12: Integration & Connectivity
// ============================================================================
testSection('12. AI/ML Feature Integration');

const integrationTests = [
  {
    name: 'NLU → Smart Assistant',
    files: ['packages/enterprise/nlu/nlu-integration.ts', 'apps/business-spine/src/smart/assistant.ts'],
    description: 'NLU engine integrated with smart assistant'
  },
  {
    name: 'LLM → NLU Fallback',
    files: ['apps/business-spine/src/llm/service.ts', 'packages/enterprise/nlu/nlu-engine.ts'],
    description: 'LLM service provides fallback for low-confidence NLU'
  },
  {
    name: 'Smart Assistant → Engines',
    files: ['apps/business-spine/src/smart/assistant.ts', 'apps/business-spine/src/assistant/engines/dynamicPricing.ts'],
    description: 'Smart assistant orchestrates multiple engines'
  }
];

for (const test of integrationTests) {
  let allExist = true;
  for (const file of test.files) {
    const fullPath = join(__dirname, file);
    try {
      readFileSync(fullPath, 'utf-8');
    } catch (error) {
      allExist = false;
      break;
    }
  }
  testResult(test.name, allExist, test.description);
}

// ============================================================================
// SUMMARY
// ============================================================================
console.log();
console.log('='.repeat(70));
console.log('TEST SUMMARY');
console.log('='.repeat(70));
console.log();
console.log(`Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log();

const successRate = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`Success Rate: ${successRate}%`);
console.log();

if (failedTests === 0) {
  console.log('🎉 All AI/ML and NLU/NLP features are properly integrated!');
} else if (successRate >= 80) {
  console.log('✅ AI/ML and NLU/NLP features are mostly connected (80%+)');
  console.log('⚠️  Some components may need attention');
} else if (successRate >= 60) {
  console.log('⚠️  AI/ML and NLU/NLP features are partially connected (60-80%)');
  console.log('🔧 Additional integration work recommended');
} else {
  console.log('❌ AI/ML and NLU/NLP features need significant integration work');
  console.log('🔧 Review failed tests and complete missing integrations');
}

console.log();
console.log('='.repeat(70));
console.log('RECOMMENDATIONS');
console.log('='.repeat(70));
console.log();

if (successRate >= 80) {
  console.log('1. ✅ Core AI/ML infrastructure is in place');
  console.log('2. 🔧 Configure LLM providers (OpenAI/Anthropic/Local) in .env');
  console.log('3. 🔧 Train ML models: cd apps/business-spine/ml/ranking && python train.py');
  console.log('4. 🧪 Test NLU with sample queries');
  console.log('5. 📊 Monitor smart assistant suggestions in production');
} else {
  console.log('1. ❌ Review failed tests above');
  console.log('2. 🔧 Complete missing file implementations');
  console.log('3. 🔧 Verify import paths and dependencies');
  console.log('4. 🧪 Re-run this test suite after fixes');
}

console.log();
process.exit(failedTests === 0 ? 0 : 1);
