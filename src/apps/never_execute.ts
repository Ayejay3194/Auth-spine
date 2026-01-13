/**
 * NEVER EXECUTE - HARD SAFETY RULES
 * 
 * This module enforces the absolute rule: LLM NEVER executes tools directly.
 * All actions must go through the deterministic policy engine.
 * 
 * This is the security boundary between AI suggestions and system actions.
 */

import { Logger } from '../utils/logger.js';

export interface ActionRequest {
  type: string;
  target: string;
  parameters: any;
  source: 'llm' | 'user' | 'system';
  requiresConfirmation: boolean;
}

export interface ExecutionResult {
  allowed: boolean;
  reason: string;
  requiresHumanConfirmation: boolean;
  suggestedNextStep?: string;
}

/**
 * HARD RULE: LLM CAN NEVER EXECUTE TOOLS
 * 
 * This function is the ultimate safety check.
 * It blocks any direct LLM tool execution.
 */
export function canExecute(request: ActionRequest): ExecutionResult {
  const logger = new Logger({ level: 'info', format: 'json' });
  
  // RULE 1: LLM CAN NEVER EXECUTE TOOLS DIRECTLY
  if (request.source === 'llm') {
    logger.warn('BLOCKED: LLM attempted to execute tool directly', {
      type: request.type,
      target: request.target,
      timestamp: new Date().toISOString()
    });
    
    return {
      allowed: false,
      reason: 'LLM cannot execute tools directly. Use suggestion system instead.',
      requiresHumanConfirmation: true,
      suggestedNextStep: 'Generate suggestion for user review'
    };
  }
  
  // RULE 2: DANGEROUS ACTIONS ALWAYS REQUIRE CONFIRMATION
  const dangerousActions = [
    'delete', 'refund', 'payout', 'invoice', 'payment',
    'cancel', 'modify', 'update', 'create', 'schedule',
    'send', 'email', 'sms', 'notify', 'export', 'import'
  ];
  
  if (dangerousActions.some(action => request.type.toLowerCase().includes(action))) {
    logger.warn('BLOCKED: Dangerous action requires confirmation', {
      type: request.type,
      target: request.target,
      source: request.source
    });
    
    return {
      allowed: false,
      reason: 'This action requires human confirmation.',
      requiresHumanConfirmation: true,
      suggestedNextStep: 'Present action to user for approval'
    };
  }
  
  // RULE 3: FINANCIAL ACTIONS ARE NEVER ALLOWED FROM AI
  const financialActions = [
    'charge', 'refund', 'payout', 'transfer', 'invoice',
    'payment', 'billing', 'credit', 'debit'
  ];
  
  if (financialActions.some(action => request.type.toLowerCase().includes(action))) {
    logger.error('BLOCKED: Financial action attempted', {
      type: request.type,
      target: request.target,
      source: request.source
    });
    
    return {
      allowed: false,
      reason: 'Financial actions cannot be initiated by AI.',
      requiresHumanConfirmation: true,
      suggestedNextStep: 'User must manually initiate financial actions'
    };
  }
  
  // RULE 4: PERMISSION AND SECURITY ACTIONS ARE BLOCKED
  const securityActions = [
    'permission', 'role', 'access', 'auth', 'login', 'logout',
    'admin', 'security', 'encrypt', 'decrypt', 'key', 'secret'
  ];
  
  if (securityActions.some(action => request.type.toLowerCase().includes(action))) {
    logger.error('BLOCKED: Security action attempted', {
      type: request.type,
      target: request.target,
      source: request.source
    });
    
    return {
      allowed: false,
      reason: 'Security and permission actions require manual administrator intervention.',
      requiresHumanConfirmation: true,
      suggestedNextStep: 'Contact system administrator'
    };
  }
  
  // RULE 5: DATA EXPORT/IMPORT ACTIONS ARE RESTRICTED
  const dataActions = [
    'export', 'import', 'backup', 'restore', 'migrate',
    'delete_all', 'truncate', 'drop'
  ];
  
  if (dataActions.some(action => request.type.toLowerCase().includes(action))) {
    logger.warn('BLOCKED: Data action requires confirmation', {
      type: request.type,
      target: request.target,
      source: request.source
    });
    
    return {
      allowed: false,
      reason: 'Data operations require explicit human confirmation.',
      requiresHumanConfirmation: true,
      suggestedNextStep: 'Present data operation for administrator approval'
    };
  }
  
  // If we get here, it's a safe read-only operation
  logger.info('Allowed: Safe read-only operation', {
    type: request.type,
    target: request.target,
    source: request.source
  });
  
  return {
    allowed: true,
    reason: 'Safe read-only operation allowed.',
    requiresHumanConfirmation: false
  };
}

/**
 * VALIDATE LLM OUTPUT ENSURES IT'S SUGGESTIONS ONLY
 */
export function validateLLMOutput(output: any): {
  isValid: boolean;
  isSuggestion: boolean;
  containsActions: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let containsActions = false;
  
  // Check for direct action commands
  const actionKeywords = [
    'execute', 'run', 'perform', 'do', 'execute_tool',
    'call_function', 'invoke', 'trigger', 'activate'
  ];
  
  const outputStr = JSON.stringify(output).toLowerCase();
  
  for (const keyword of actionKeywords) {
    if (outputStr.includes(keyword)) {
      warnings.push(`Contains potentially dangerous keyword: ${keyword}`);
      containsActions = true;
    }
  }
  
  // Check for structured action format
  if (output.action || output.tool_call || output.function) {
    warnings.push('Contains structured action data');
    containsActions = true;
  }
  
  // Check for proposed action (allowed but requires confirmation)
  if (output.proposedAction) {
    warnings.push('Contains proposed action (requires confirmation)');
    // This is allowed but must be handled carefully
  }
  
  // Validate it's structured as a suggestion
  const isSuggestion = (
    output.recommendation || 
    output.suggestion || 
    output.explanation || 
    output.draft ||
    output.proposedAction
  );
  
  if (!isSuggestion && !containsActions) {
    warnings.push('Output is not clearly structured as suggestion');
  }
  
  return {
    isValid: !containsActions,
    isSuggestion: !!isSuggestion,
    containsActions,
    warnings
  };
}

/**
 * SANITIZE LLM OUTPUT TO REMOVE ANY EXECUTABLE CONTENT
 */
export function sanitizeLLMOutput(output: any): any {
  const sanitized = { ...output };
  
  // Remove any potentially executable fields
  const dangerousFields = [
    'execute', 'run', 'perform', 'action', 'tool_call',
    'function', 'invoke', 'trigger', 'activate', 'command'
  ];
  
  for (const field of dangerousFields) {
    if (sanitized[field]) {
      delete sanitized[field];
    }
  }
  
  // Ensure proposed actions have confirmation flag
  if (sanitized.proposedAction) {
    sanitized.proposedAction.requiresConfirmation = true;
  }
  
  return sanitized;
}

/**
 * CREATE USER CONFIRMATION PROMPT FOR PROPOSED ACTIONS
 */
export function createConfirmationPrompt(proposedAction: any): string {
  if (!proposedAction) {
    return 'No action to confirm.';
  }
  
  const { type, target, description, impact, risks } = proposedAction;
  
  let prompt = `⚠️  ACTION REQUIRES CONFIRMATION\n\n`;
  prompt += `Action: ${type}\n`;
  prompt += `Target: ${target}\n`;
  prompt += `Description: ${description}\n`;
  
  if (impact) {
    prompt += `Impact: ${impact}\n`;
  }
  
  if (risks && risks.length > 0) {
    prompt += `\nRisks:\n`;
    risks.forEach((risk: string, index: number) => {
      prompt += `${index + 1}. ${risk}\n`;
    });
  }
  
  prompt += `\nDo you want to proceed with this action?\n`;
  prompt += `Reply 'CONFIRM' to approve or 'CANCEL' to reject.\n`;
  
  return prompt;
}

/**
 * AUDIT LOG FOR AI INTERACTIONS
 */
export function auditAIInteraction(
  type: string,
  input: any,
  output: any,
  executionBlocked: boolean
): void {
  const logger = new Logger({ level: 'info', format: 'json' });
  
  const auditEntry = {
    timestamp: new Date().toISOString(),
    type,
    inputHash: hashInput(input),
    outputValidated: validateLLMOutput(output),
    executionBlocked,
    containsActions: validateLLMOutput(output).containsActions,
    metadata: {
      inputSize: JSON.stringify(input).length,
      outputSize: JSON.stringify(output).length
    }
  };
  
  logger.info('AI Interaction Audited', auditEntry);
}

function hashInput(input: any): string {
  // Simple hash for audit logging
  const str = JSON.stringify(input);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * SAFETY CHECKLIST - MUST BE CALLED BEFORE ANY EXECUTION
 */
export function safetyChecklist(request: ActionRequest): {
  passed: boolean;
  failures: string[];
  critical: boolean;
} {
  const failures: string[] = [];
  let critical = false;
  
  // Check 1: Source validation
  if (request.source === 'llm') {
    failures.push('LLM cannot be execution source');
    critical = true;
  }
  
  // Check 2: Action type validation
  const blockedTypes = [
    'delete', 'refund', 'payment', 'permission', 'export'
  ];
  
  if (blockedTypes.some(type => request.type.toLowerCase().includes(type))) {
    failures.push(`Blocked action type: ${request.type}`);
    critical = true;
  }
  
  // Check 3: Confirmation requirement
  if (!request.requiresConfirmation && 
      ['create', 'update', 'schedule', 'send'].some(type => 
        request.type.toLowerCase().includes(type))) {
    failures.push('Action requires confirmation flag');
  }
  
  // Check 4: Parameter validation
  if (request.parameters && 
      typeof request.parameters === 'object' &&
      (request.parameters.apiKey || 
       request.parameters.secret || 
       request.parameters.token)) {
    failures.push('Parameters contain sensitive data');
    critical = true;
  }
  
  return {
    passed: failures.length === 0,
    failures,
    critical
  };
}

// Export the main safety function
export const NEVER_EXECUTE = {
  canExecute,
  validateLLMOutput,
  sanitizeLLMOutput,
  createConfirmationPrompt,
  auditAIInteraction,
  safetyChecklist
};

/**
 * REMINDER: THIS MODULE ENFORCES THE #1 RULE
 * 
 * LLM IS THE COACH, NOT THE CASHIER
 * LLM IS THE TEACHER, NOT THE EXECUTOR
 * LLM SUGGESTS, HUMANS CONFIRM
 * 
 * NEVER LET AI DIRECTLY EXECUTE BUSINESS ACTIONS
 */
