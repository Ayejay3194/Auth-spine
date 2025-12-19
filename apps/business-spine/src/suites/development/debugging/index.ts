// Debugging Suite - Debugging Tools
// Exports debugging-related functionality

// Debugging Components
export { default as DebugConsole } from './components/DebugConsole';
export { default as DebugPanel } from './components/DebugPanel';
export { default as BreakpointManager } from './components/BreakpointManager';

// Debugging Hooks
export { default as useDebug } from './hooks/useDebug';
export { default as useBreakpoints } from './hooks/useBreakpoints';

// Debugging Services
export { default as debugService } from './services/debugService';

// Debugging Types
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

// Debugging Constants
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
