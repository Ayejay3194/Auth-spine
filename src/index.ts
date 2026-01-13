/**
 * Auth-Spine Main Entry Point
 * Consolidated, optimized exports for the entire system
 */

// Core system modules
export * from './core';

// Library wrappers
export * from './libs';

// Scientific computing
export * from './computing';

// Advanced features
export * from './advanced';

// Utilities
export * from './utils';

// Legacy compatibility exports
export { pandas } from './computing/data/pandas/dataframe';
