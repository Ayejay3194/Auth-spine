// Patterns Suite - Anti-pattern Prevention
// Exports pattern-related functionality

// Pattern Components
export { default as PatternDetector } from './components/PatternDetector';
export { default as PatternReport } from './components/PatternReport';
export { default as PatternSolutions } from './components/PatternSolutions';

// Pattern Hooks
export { default as usePatterns } from './hooks/usePatterns';
export { default as usePatternDetection } from './hooks/usePatternDetection';

// Pattern Services
export { default as patternService } from './services/patternService';

// Pattern Types
export interface CodePattern {
  id: string;
  name: string;
  type: 'anti-pattern' | 'best-practice' | 'architecture' | 'security';
  description: string;
  examples: string[];
  solution?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
}

export interface PatternDetection {
  patternId: string;
  file: string;
  line: number;
  column: number;
  code: string;
  context: string;
}

export interface PatternReport {
  id: string;
  timestamp: Date;
  patterns: PatternDetection[];
  summary: {
    total: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
  };
}

// Pattern Constants
export const PATTERN_TYPES = {
  ANTI_PATTERN: 'anti-pattern',
  BEST_PRACTICE: 'best-practice',
  ARCHITECTURE: 'architecture',
  SECURITY: 'security'
} as const;

export const PATTERN_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;
