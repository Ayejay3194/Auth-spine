export interface WorkflowStep {
  id: string;
  name: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  config: Record<string, any>;
  nextStepId?: string;
  conditionBranches?: { condition: string; stepId: string }[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  trigger: WorkflowStep;
  steps: WorkflowStep[];
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  tenantId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startedAt: Date;
  completedAt?: Date;
  steps: ExecutionStep[];
  error?: string;
}

export interface ExecutionStep {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, any>;
  output: Record<string, any>;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

const workflows = new Map<string, Workflow>();
const executions = new Map<string, WorkflowExecution>();

export function createWorkflow(workflow: Workflow): void {
  workflows.set(workflow.id, workflow);
}

export function getWorkflow(workflowId: string): Workflow | undefined {
  return workflows.get(workflowId);
}

export function listWorkflows(tenantId: string): Workflow[] {
  return Array.from(workflows.values()).filter(w => w.tenantId === tenantId);
}

export function updateWorkflow(workflowId: string, updates: Partial<Workflow>): void {
  const workflow = workflows.get(workflowId);
  if (workflow) {
    Object.assign(workflow, updates, { updatedAt: new Date() });
  }
}

export function deleteWorkflow(workflowId: string): boolean {
  return workflows.delete(workflowId);
}

export function executeWorkflow(workflowId: string, tenantId: string, input: Record<string, any>): WorkflowExecution {
  const workflow = getWorkflow(workflowId);
  if (!workflow) {
    throw new Error('Workflow not found');
  }

  const execution: WorkflowExecution = {
    id: `exec_${Date.now()}`,
    workflowId,
    tenantId,
    status: 'running',
    startedAt: new Date(),
    steps: [],
  };

  executions.set(execution.id, execution);

  // Execute workflow steps
  executeSteps(execution, workflow.steps, input);

  return execution;
}

function executeSteps(
  execution: WorkflowExecution,
  steps: WorkflowStep[],
  input: Record<string, any>
): void {
  let currentInput = input;

  for (const step of steps) {
    const executionStep: ExecutionStep = {
      stepId: step.id,
      status: 'running',
      input: currentInput,
      output: {},
      startedAt: new Date(),
    };

    try {
      switch (step.type) {
        case 'action':
          executionStep.output = executeAction(step, currentInput);
          executionStep.status = 'completed';
          break;
        case 'condition':
          const conditionMet = evaluateCondition(step, currentInput);
          executionStep.output = { conditionMet };
          executionStep.status = 'completed';
          break;
        case 'delay':
          const delayMs = step.config.delayMs || 1000;
          // In production, use actual async delay
          executionStep.output = { delayed: true };
          executionStep.status = 'completed';
          break;
      }

      executionStep.completedAt = new Date();
      execution.steps.push(executionStep);
      currentInput = executionStep.output;
    } catch (error) {
      executionStep.status = 'failed';
      executionStep.error = String(error);
      executionStep.completedAt = new Date();
      execution.steps.push(executionStep);
      execution.status = 'failed';
      execution.error = String(error);
      execution.completedAt = new Date();
      break;
    }
  }

  if (execution.status === 'running') {
    execution.status = 'completed';
    execution.completedAt = new Date();
  }
}

function executeAction(step: WorkflowStep, input: Record<string, any>): Record<string, any> {
  const { actionType, ...params } = step.config;

  switch (actionType) {
    case 'send_email':
      return { emailSent: true, messageId: `msg_${Date.now()}` };
    case 'send_sms':
      return { smsSent: true, messageId: `msg_${Date.now()}` };
    case 'create_booking':
      return { bookingCreated: true, bookingId: `booking_${Date.now()}` };
    case 'update_client':
      return { clientUpdated: true };
    case 'create_invoice':
      return { invoiceCreated: true, invoiceId: `inv_${Date.now()}` };
    case 'webhook':
      return { webhookCalled: true };
    default:
      return { actionExecuted: true };
  }
}

function evaluateCondition(step: WorkflowStep, input: Record<string, any>): boolean {
  const { field, operator, value } = step.config;
  const fieldValue = input[field];

  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'not_equals':
      return fieldValue !== value;
    case 'greater_than':
      return fieldValue > value;
    case 'less_than':
      return fieldValue < value;
    case 'contains':
      return String(fieldValue).includes(value);
    case 'in':
      return Array.isArray(value) && value.includes(fieldValue);
    default:
      return false;
  }
}

export function getExecution(executionId: string): WorkflowExecution | undefined {
  return executions.get(executionId);
}

export function listExecutions(workflowId: string): WorkflowExecution[] {
  return Array.from(executions.values()).filter(e => e.workflowId === workflowId);
}
