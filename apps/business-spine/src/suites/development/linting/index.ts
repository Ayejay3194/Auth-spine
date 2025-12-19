// Linting Suite - Code Quality
// Exports linting-related functionality

// Linting Components
// export { default as Linter } from './components/Linter';
// export { default as LintResults } from './components/LintResults';
// export { default as LintRules } from './components/LintRules';

// Linting Hooks
// export { default as useLinting } from './hooks/useLinting';
// export { default as useLintRules } from './hooks/useLintRules';

// Linting Services
// export { default as lintService } from './services/lintService';

// Linting Types
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

// Linting Constants
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
