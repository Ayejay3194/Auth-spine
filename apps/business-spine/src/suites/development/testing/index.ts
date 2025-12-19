// Testing Suite - Testing Frameworks
// Exports testing-related functionality

// Testing Components
export { default as TestRunner } from './components/TestRunner';
export { default as TestResults } from './components/TestResults';
export { default as TestCoverage } from './components/TestCoverage';

// Testing Hooks
export { default as useTests } from './hooks/useTests';
export { default as useTestCoverage } from './hooks/useTestCoverage';

// Testing Services
export { default as testService } from './services/testService';

// Testing Types
export interface TestSuite {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  description: string;
  tests: TestCase[];
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  coverage?: TestCoverage;
  lastRun: Date;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  assertions: number;
}

export interface TestCoverage {
  lines: number;
  functions: number;
  branches: number;
  statements: number;
}

// Testing Constants
export const TEST_TYPES = {
  UNIT: 'unit',
  INTEGRATION: 'integration',
  E2E: 'e2e',
  PERFORMANCE: 'performance',
  SECURITY: 'security'
} as const;

export const TEST_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped'
} as const;
