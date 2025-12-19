// Development Domain Suite Index
// Exports all development-related functionality

// Testing Suite
export * from './testing';

// Debugging Suite
export * from './debugging';

// Linting Suite
export * from './linting';

// Documentation Suite
export * from './documentation';

// Development Types
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

export interface DebugSession {
  id: string;
  name: string;
  type: 'breakpoint' | 'console' | 'network' | 'performance';
  status: 'active' | 'paused' | 'completed';
  startTime: Date;
  endTime?: Date;
  logs: DebugLog[];
  breakpoints: Breakpoint[];
}

export interface DebugLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  source: string;
  metadata?: Record<string, any>;
}

export interface Breakpoint {
  id: string;
  file: string;
  line: number;
  condition?: string;
  isActive: boolean;
  hitCount: number;
}

export interface LintRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  category: 'best-practices' | 'errors' | 'style' | 'security' | 'performance';
  isEnabled: boolean;
  configuration: Record<string, any>;
}

export interface LintReport {
  id: string;
  timestamp: Date;
  files: LintFile[];
  summary: LintSummary;
  duration: number;
}

export interface LintFile {
  path: string;
  errors: LintError[];
  warnings: LintError[];
  info: LintError[];
}

export interface LintError {
  rule: string;
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
}

export interface LintSummary {
  totalFiles: number;
  totalErrors: number;
  totalWarnings: number;
  totalInfo: number;
  fixableErrors: number;
  fixableWarnings: number;
}

export interface DocumentationPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  lastUpdated: Date;
  version: string;
}

export interface DocumentationCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  pages: string[];
}

// Development Constants
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

export const DEBUG_TYPES = {
  BREAKPOINT: 'breakpoint',
  CONSOLE: 'console',
  NETWORK: 'network',
  PERFORMANCE: 'performance'
} as const;

export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
} as const;

export const LINT_SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

export const LINT_CATEGORIES = {
  BEST_PRACTICES: 'best-practices',
  ERRORS: 'errors',
  STYLE: 'style',
  SECURITY: 'security',
  PERFORMANCE: 'performance'
} as const;
