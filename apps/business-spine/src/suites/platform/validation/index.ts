// Validation Suite - Data Validation
// Exports validation-related functionality

// Validation Components
// export { default as ValidationForm } from './components/ValidationForm';
// export { default as ValidationErrors } from './components/ValidationErrors';
// export { default as ValidationSummary } from './components/ValidationSummary';

// Validation Hooks
// export { default as useValidation } from './hooks/useValidation';
// export { default as useFormValidation } from './hooks/useFormValidation';

// Validation Services
// export { default as validationService } from './services/validationService';

// Validation Types
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data: Record<string, any>;
}

// Validation Constants
export const VALIDATION_RULES = {
  REQUIRED: 'required',
  MIN: 'min',
  MAX: 'max',
  PATTERN: 'pattern',
  CUSTOM: 'custom'
} as const;

export const COMMON_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^https?:\/\/.+/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
} as const;
