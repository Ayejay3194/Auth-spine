export interface WorkflowStep {
    id: string;
    name: string;
    type: 'trigger' | 'action' | 'condition' | 'delay';
    config: Record<string, any>;
    nextStepId?: string;
    conditionBranches?: {
        condition: string;
        stepId: string;
    }[];
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
export declare function createWorkflow(workflow: Workflow): void;
export declare function getWorkflow(workflowId: string): Workflow | undefined;
export declare function listWorkflows(tenantId: string): Workflow[];
export declare function updateWorkflow(workflowId: string, updates: Partial<Workflow>): void;
export declare function deleteWorkflow(workflowId: string): boolean;
export declare function executeWorkflow(workflowId: string, tenantId: string, input: Record<string, any>): WorkflowExecution;
export declare function getExecution(executionId: string): WorkflowExecution | undefined;
export declare function listExecutions(workflowId: string): WorkflowExecution[];
//# sourceMappingURL=workflow.d.ts.map