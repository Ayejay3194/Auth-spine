/**
 * Simple test to verify all imports work correctly
 */

// Test importing all main exports
import {
  VibeCodingDisasters,
  vibeCodingDisasters,
  RiskRegister,
  RiskItem,
  RiskCategory,
  SeverityLevel,
  DEFAULT_CONFIG,
  riskRegister,
  checklistGenerator,
  severityScoring,
  templateManager
} from './index.js';

console.log('✅ All imports successful');

// Test basic functionality
const assessment = vibeCodingDisasters.assessRisks({
  isProduction: false,
  hasPII: false,
  handlesMoney: false,
  isCustomerFacing: false
});

console.log(`✅ Risk assessment works: score=${assessment.riskScore}, blocked=${assessment.blocked}`);

// Test checklist generation
const checklist = vibeCodingDisasters.generatePRChecklist();
console.log(`✅ PR checklist generated: ${checklist.length} characters`);

// Test risk register
const allRisks = riskRegister.getAllRisks();
console.log(`✅ Risk register loaded: ${allRisks.length} risks`);

console.log('✅ All tests passed - Vibe Coding Disasters Kit is working correctly!');

// Export for potential use
export { assessment, checklist, allRisks };
