# AGENT & TOOLING SYSTEM - PHASE 6

**Date:** January 4, 2026  
**Status:** ✅ IMPLEMENTED  
**Purpose:** Tool definitions, loop rules, and agent execution system

---

## 🛠️ TOOL DEFINITION (MANDATORY SHAPE)

### Tool Interface
```typescript
interface Tool {
  name: string;
  purpose: string;
  whenToUse: string;
  parameters: ToolParameter[];
  execution: (params: Record<string, any>) => Promise<ToolResult>;
  returnSchema: z.ZodSchema;
}

interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  validation?: z.ZodSchema;
  defaultValue?: any;
}

interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    executionTime: number;
    toolUsed: string;
    parameters: Record<string, any>;
  };
}
```

### Tool Registry
```typescript
class ToolRegistry {
  private tools = new Map<string, Tool>();
  
  register(tool: Tool): void {
    // Validate tool definition
    this.validateTool(tool);
    
    // Register tool
    this.tools.set(tool.name, tool);
    console.log(`Tool registered: ${tool.name}`);
  }
  
  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }
  
  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }
  
  private validateTool(tool: Tool): void {
    if (!tool.name || !tool.purpose || !tool.whenToUse) {
      throw new Error(`Tool ${tool.name} missing required fields`);
    }
    
    if (!tool.parameters || !Array.isArray(tool.parameters)) {
      throw new Error(`Tool ${tool.name} missing parameters array`);
    }
    
    if (!tool.execution || typeof tool.execution !== 'function') {
      throw new Error(`Tool ${tool.name} missing execution function`);
    }
    
    if (!tool.returnSchema) {
      throw new Error(`Tool ${tool.name} missing return schema`);
    }
  }
}
```

---

## 🔧 CORE TOOLS

### Search Task Tool
```typescript
const searchTaskTool: Tool = {
  name: 'search_task',
  purpose: 'Search for tasks based on query parameters',
  whenToUse: 'When user wants to find specific tasks by title, status, assignee, or other criteria',
  parameters: [
    {
      name: 'query',
      type: 'string',
      required: false,
      description: 'Search query to match against task titles and descriptions'
    },
    {
      name: 'status',
      type: 'array',
      required: false,
      description: 'Filter by task status (pending, in_progress, completed, cancelled)'
    },
    {
      name: 'assignee',
      type: 'string',
      required: false,
      description: 'Filter by assignee user ID'
    },
    {
      name: 'priority',
      type: 'array',
      required: false,
      description: 'Filter by priority level (low, medium, high, urgent)'
    },
    {
      name: 'limit',
      type: 'number',
      required: false,
      description: 'Maximum number of results to return',
      defaultValue: 10
    }
  ],
  execution: async (params) => {
    const startTime = Date.now();
    
    try {
      // Get tasks from store
      const tasks = await store.dispatch(fetchTasks()).unwrap();
      
      // Apply filters
      let filteredTasks = tasks;
      
      if (params.query) {
        const query = params.query.toLowerCase();
        filteredTasks = filteredTasks.filter(task =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
        );
      }
      
      if (params.status && params.status.length > 0) {
        filteredTasks = filteredTasks.filter(task =>
          params.status.includes(task.status)
        );
      }
      
      if (params.assignee) {
        filteredTasks = filteredTasks.filter(task =>
          task.assignedTo === params.assignee
        );
      }
      
      if (params.priority && params.priority.length > 0) {
        filteredTasks = filteredTasks.filter(task =>
          params.priority.includes(task.priority)
        );
      }
      
      // Apply limit
      const results = filteredTasks.slice(0, params.limit || 10);
      
      return {
        success: true,
        data: {
          tasks: results,
          total: filteredTasks.length,
          query: params
        },
        metadata: {
          executionTime: Date.now() - startTime,
          toolUsed: 'search_task',
          parameters: params
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to search tasks: ${error}`,
        metadata: {
          executionTime: Date.now() - startTime,
          toolUsed: 'search_task',
          parameters: params
        }
      };
    }
  },
  returnSchema: z.object({
    success: z.boolean(),
    data: z.object({
      tasks: z.array(z.any()),
      total: z.number(),
      query: z.any()
    }).optional(),
    error: z.string().optional(),
    metadata: z.object({
      executionTime: z.number(),
      toolUsed: z.string(),
      parameters: z.any()
    })
  })
};
```

### Create Task Tool
```typescript
const createTaskTool: Tool = {
  name: 'create_task',
  purpose: 'Create a new task with specified parameters',
  whenToUse: 'When user wants to create a new task with title, description, assignee, etc.',
  parameters: [
    {
      name: 'title',
      type: 'string',
      required: true,
      description: 'Task title (required)'
    },
    {
      name: 'description',
      type: 'string',
      required: false,
      description: 'Detailed task description'
    },
    {
      name: 'assignee',
      type: 'string',
      required: true,
      description: 'User ID of the person assigned to the task'
    },
    {
      name: 'priority',
      type: 'string',
      required: false,
      description: 'Task priority (low, medium, high, urgent)',
      defaultValue: 'medium'
    },
    {
      name: 'dueDate',
      type: 'string',
      required: false,
      description: 'Due date in ISO format'
    }
  ],
  execution: async (params) => {
    const startTime = Date.now();
    
    try {
      // Validate assignee exists
      const users = await store.dispatch(fetchUsers()).unwrap();
      const assignee = users.find(u => u.id === params.assignee);
      if (!assignee) {
        return {
          success: false,
          error: `Assignee not found: ${params.assignee}`,
          metadata: {
            executionTime: Date.now() - startTime,
            toolUsed: 'create_task',
            parameters: params
          }
        };
      }
      
      // Create task
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: params.title,
        description: params.description,
        status: 'pending',
        priority: params.priority as Task['priority'],
        assignedTo: params.assignee,
        createdBy: getCurrentUserId(),
        dueDate: params.dueDate ? new Date(params.dueDate) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      };
      
      // Save task
      await store.dispatch(updateTask(newTask));
      
      return {
        success: true,
        data: {
          task: newTask
        },
        metadata: {
          executionTime: Date.now() - startTime,
          toolUsed: 'create_task',
          parameters: params
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create task: ${error}`,
        metadata: {
          executionTime: Date.now() - startTime,
          toolUsed: 'create_task',
          parameters: params
        }
      };
    }
  },
  returnSchema: z.object({
    success: z.boolean(),
    data: z.object({
      task: z.any()
    }).optional(),
    error: z.string().optional(),
    metadata: z.object({
      executionTime: z.number(),
      toolUsed: z.string(),
      parameters: z.any()
    })
  })
};
```

### Update Task Tool
```typescript
const updateTaskTool: Tool = {
  name: 'update_task',
  purpose: 'Update an existing task with new values',
  whenToUse: 'When user wants to modify an existing task\'s properties',
  parameters: [
    {
      name: 'taskId',
      type: 'string',
      required: true,
      description: 'ID of the task to update'
    },
    {
      name: 'title',
      type: 'string',
      required: false,
      description: 'New task title'
    },
    {
      name: 'description',
      type: 'string',
      required: false,
      description: 'New task description'
    },
    {
      name: 'status',
      type: 'string',
      required: false,
      description: 'New task status (pending, in_progress, completed, cancelled)'
    },
    {
      name: 'priority',
      type: 'string',
      required: false,
      description: 'New task priority (low, medium, high, urgent)'
    },
    {
      name: 'assignee',
      type: 'string',
      required: false,
      description: 'New assignee user ID'
    }
  ],
  execution: async (params) => {
    const startTime = Date.now();
    
    try {
      // Get existing task
      const tasks = await store.dispatch(fetchTasks()).unwrap();
      const existingTask = tasks.find(t => t.id === params.taskId);
      
      if (!existingTask) {
        return {
          success: false,
          error: `Task not found: ${params.taskId}`,
          metadata: {
            executionTime: Date.now() - startTime,
            toolUsed: 'update_task',
            parameters: params
          }
        };
      }
      
      // Validate assignee if provided
      if (params.assignee) {
        const users = await store.dispatch(fetchUsers()).unwrap();
        const assignee = users.find(u => u.id === params.assignee);
        if (!assignee) {
          return {
            success: false,
            error: `Assignee not found: ${params.assignee}`,
            metadata: {
              executionTime: Date.now() - startTime,
              toolUsed: 'update_task',
              parameters: params
            }
          };
        }
      }
      
      // Update task
      const updatedTask: Task = {
        ...existingTask,
        ...(params.title && { title: params.title }),
        ...(params.description && { description: params.description }),
        ...(params.status && { status: params.status as Task['status'] }),
        ...(params.priority && { priority: params.priority as Task['priority'] }),
        ...(params.assignee && { assignedTo: params.assignee }),
        updatedAt: new Date(),
        version: existingTask.version + 1
      };
      
      // Handle status change to completed
      if (params.status === 'completed' && existingTask.status !== 'completed') {
        updatedTask.completedAt = new Date();
      }
      
      // Save updated task
      await store.dispatch(updateTask(updatedTask));
      
      return {
        success: true,
        data: {
          task: updatedTask,
          previousVersion: existingTask
        },
        metadata: {
          executionTime: Date.now() - startTime,
          toolUsed: 'update_task',
          parameters: params
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update task: ${error}`,
        metadata: {
          executionTime: Date.now() - startTime,
          toolUsed: 'update_task',
          parameters: params
        }
      };
    }
  },
  returnSchema: z.object({
    success: z.boolean(),
    data: z.object({
      task: z.any(),
      previousVersion: z.any()
    }).optional(),
    error: z.string().optional(),
    metadata: z.object({
      executionTime: z.number(),
      toolUsed: z.string(),
      parameters: z.any()
    })
  })
};
```

### Get Calendar Accounts Tool
```typescript
const getCalendarAccountsTool: Tool = {
  name: 'get_calendar_accounts',
  purpose: 'Retrieve all calendar accounts for the current user',
  whenToUse: 'When checking calendar availability or scheduling events',
  parameters: [],
  execution: async (params) => {
    const startTime = Date.now();
    
    try {
      // Get current user
      const user = getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
          metadata: {
            executionTime: Date.now() - startTime,
            toolUsed: 'get_calendar_accounts',
            parameters: params
          }
        };
      }
      
      // Get events to determine calendar accounts
      const events = await store.dispatch(fetchEvents()).unwrap();
      
      // Group events by calendar
      const calendarAccounts = new Map<string, {
        id: string;
        name: string;
        type: string;
        owner: string;
        eventCount: number;
      }>();
      
      events.forEach(event => {
        const calendarId = event.calendarId;
        if (!calendarAccounts.has(calendarId)) {
          calendarAccounts.set(calendarId, {
            id: calendarId,
            name: calendarId === 'cal_main' ? 'Main Calendar' : 
                 calendarId === 'cal_work' ? 'Work Calendar' :
                 calendarId === 'cal_personal' ? 'Personal Calendar' :
                 calendarId,
            type: 'primary',
            owner: event.organizerId,
            eventCount: 0
          });
        }
        calendarAccounts.get(calendarId)!.eventCount++;
      });
      
      // Add default calendar if no events
      if (calendarAccounts.size === 0) {
        calendarAccounts.set('cal_main', {
          id: 'cal_main',
          name: 'Main Calendar',
          type: 'primary',
          owner: user.id,
          eventCount: 0
        });
      }
      
      const accounts = Array.from(calendarAccounts.values());
      
      return {
        success: true,
        data: {
          accounts: accounts.map(account => ({
            ...account,
            isOwner: account.owner === user.id,
            canAccess: true
          }))
        },
        metadata: {
          executionTime: Date.now() - startTime,
          toolUsed: 'get_calendar_accounts',
          parameters: params
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get calendar accounts: ${error}`,
        metadata: {
          executionTime: Date.now() - startTime,
          toolUsed: 'get_calendar_accounts',
          parameters: params
        }
      };
    }
  },
  returnSchema: z.object({
    success: z.boolean(),
    data: z.object({
      accounts: z.array(z.any())
    }).optional(),
    error: z.string().optional(),
    metadata: z.object({
      executionTime: z.number(),
      toolUsed: z.string(),
      parameters: z.any()
    })
  })
};
```

### Get Calendar Events Tool
```typescript
const getCalendarEventsTool: Tool = {
  name: 'get_calendar_events',
  purpose: 'Fetch calendar events for specified date range and filters',
  whenToUse: 'When checking availability or displaying calendar events',
  parameters: [
    {
      name: 'calendarIds',
      type: 'array',
      required: false,
      description: 'Specific calendar IDs to fetch events from'
    },
    {
      name: 'startDate',
      type: 'string',
      required: false,
      description: 'Start date in ISO format (defaults to today)'
    },
    {
      name: 'endDate',
      type: 'string',
      required: false,
      description: 'End date in ISO format (defaults to 7 days from start)'
    },
    {
      name: 'attendeeIds',
      type: 'array',
      required: false,
      description: 'Filter by specific attendee IDs'
    },
    {
      name: 'status',
      type: 'string',
      required: false,
      description: 'Filter by event status (confirmed, tentative, cancelled)'
    }
  ],
  execution: async (params) => {
    const startTime = Date.now();
    
    try {
      // Get all events
      const events = await store.dispatch(fetchEvents()).unwrap();
      
      // Set default date range
      const startDate = params.startDate ? new Date(params.startDate) : new Date();
      const endDate = params.endDate ? new Date(params.endDate) : 
                      new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      // Filter events
      let filteredEvents = events.filter(event => {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        
        // Date range filter
        if (eventEnd < startDate || eventStart > endDate) {
          return false;
        }
        
        // Calendar filter
        if (params.calendarIds && params.calendarIds.length > 0) {
          if (!params.calendarIds.includes(event.calendarId)) {
            return false;
          }
        }
        
        // Attendee filter
        if (params.attendeeIds && params.attendeeIds.length > 0) {
          const hasAttendee = params.attendeeIds.some(id => 
            event.attendees.includes(id)
          );
          if (!hasAttendee) {
            return false;
          }
        }
        
        // Status filter
        if (params.status && event.status !== params.status) {
          return false;
        }
        
        return true;
      });
      
      // Sort by start time
      filteredEvents.sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      
      return {
        success: true,
        data: {
          events: filteredEvents,
          dateRange: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          },
          filters: params
        },
        metadata: {
          executionTime: Date.now() - startTime,
          toolUsed: 'get_calendar_events',
          parameters: params
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get calendar events: ${error}`,
        metadata: {
          executionTime: Date.now() - startTime,
          toolUsed: 'get_calendar_events',
          parameters: params
        }
      };
    }
  },
  returnSchema: z.object({
    success: z.boolean(),
    data: z.object({
      events: z.array(z.any()),
      dateRange: z.object({
        startDate: z.string(),
        endDate: z.string()
      }),
      filters: z.any()
    }).optional(),
    error: z.string().optional(),
    metadata: z.object({
      executionTime: z.number(),
      toolUsed: z.string(),
      parameters: z.any()
    })
  })
};
```

---

## 🔄 TOOL LOOP RULES

### Agent Execution Engine
```typescript
class AgentExecutionEngine {
  private toolRegistry: ToolRegistry;
  private maxLoops = 3;
  private currentLoop = 0;
  
  constructor(toolRegistry: ToolRegistry) {
    this.toolRegistry = toolRegistry;
  }
  
  async executeAgent(
    initialRequest: string,
    context: AgentContext
  ): Promise<AgentResponse> {
    this.currentLoop = 0;
    
    let currentRequest = initialRequest;
    const executionHistory: ToolExecution[] = [];
    
    while (this.currentLoop < this.maxLoops) {
      console.log(`Agent loop ${this.currentLoop + 1}/${this.maxLoops}`);
      
      // Parse request and determine next action
      const plan = await this.planExecution(currentRequest, context, executionHistory);
      
      if (plan.action === 'exit') {
        return {
          success: true,
          finalResponse: plan.response,
          executionHistory,
          loopsUsed: this.currentLoop
        };
      }
      
      if (plan.action === 'execute_tool') {
        const result = await this.executeTool(plan.toolName, plan.parameters);
        executionHistory.push(result);
        
        // Update context with tool result
        context = this.updateContext(context, result);
        
        // Determine next request based on result
        currentRequest = this.generateNextRequest(currentRequest, result, plan);
        
        this.currentLoop++;
      } else {
        throw new Error(`Unknown action: ${plan.action}`);
      }
    }
    
    // Max loops reached - exit with current state
    return {
      success: false,
      finalResponse: 'I need more information or the task is too complex. Please provide more specific details.',
      executionHistory,
      loopsUsed: this.maxLoops,
      error: 'Max loops exceeded'
    };
  }
  
  private async planExecution(
    request: string,
    context: AgentContext,
    history: ToolExecution[]
  ): Promise<ExecutionPlan> {
    // Simple request parsing - in a real system, this would use NLP
    const lowerRequest = request.toLowerCase();
    
    // Check for task-related requests
    if (lowerRequest.includes('search') && lowerRequest.includes('task')) {
      return {
        action: 'execute_tool',
        toolName: 'search_task',
        parameters: this.parseSearchParameters(request)
      };
    }
    
    if (lowerRequest.includes('create') && lowerRequest.includes('task')) {
      return {
        action: 'execute_tool',
        toolName: 'create_task',
        parameters: this.parseCreateTaskParameters(request)
      };
    }
    
    if (lowerRequest.includes('update') && lowerRequest.includes('task')) {
      return {
        action: 'execute_tool',
        toolName: 'update_task',
        parameters: this.parseUpdateTaskParameters(request)
      };
    }
    
    // Check for calendar-related requests
    if (lowerRequest.includes('calendar') || lowerRequest.includes('schedule')) {
      if (lowerRequest.includes('availability') || lowerRequest.includes('free')) {
        return {
          action: 'execute_tool',
          toolName: 'get_calendar_accounts',
          parameters: {}
        };
      }
      
      if (lowerRequest.includes('events') || lowerRequest.includes('meetings')) {
        return {
          action: 'execute_tool',
          toolName: 'get_calendar_events',
          parameters: this.parseCalendarParameters(request)
        };
      }
    }
    
    // If no specific action, exit
    return {
      action: 'exit',
      response: this.generateGenericResponse(request, context, history)
    };
  }
  
  private async executeTool(toolName: string, parameters: Record<string, any>): Promise<ToolExecution> {
    const tool = this.toolRegistry.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }
    
    console.log(`Executing tool: ${toolName} with parameters:`, parameters);
    
    const result = await tool.execution(parameters);
    
    return {
      toolName,
      parameters,
      result,
      timestamp: Date.now()
    };
  }
  
  private updateContext(context: AgentContext, execution: ToolExecution): AgentContext {
    return {
      ...context,
      lastToolResult: execution.result,
      executionHistory: [...context.executionHistory, execution]
    };
  }
  
  private generateNextRequest(
    originalRequest: string,
    result: ToolResult,
    plan: ExecutionPlan
  ): string {
    // If tool failed, exit
    if (!result.success) {
      return originalRequest;
    }
    
    // If this was a search and we have results, we might be done
    if (plan.toolName === 'search_task' && result.data?.tasks?.length > 0) {
      return originalRequest; // Let the agent exit with results
    }
    
    // If this was create/update, we're done
    if (['create_task', 'update_task'].includes(plan.toolName)) {
      return originalRequest;
    }
    
    // If we got calendar accounts, we might want to get events
    if (plan.toolName === 'get_calendar_accounts') {
      return 'get calendar events for these accounts';
    }
    
    return originalRequest;
  }
  
  private generateGenericResponse(
    request: string,
    context: AgentContext,
    history: ToolExecution[]
  ): string {
    if (history.length === 0) {
      return "I'm not sure how to help with that request. You can ask me to search, create, or update tasks, or check calendar availability.";
    }
    
    const lastExecution = history[history.length - 1];
    
    if (lastExecution.result.success) {
      return "I've completed your request. Is there anything else you'd like me to help you with?";
    } else {
      return "I encountered an error while processing your request. Please try again or provide more details.";
    }
  }
  
  // Parameter parsing methods (simplified)
  private parseSearchParameters(request: string): Record<string, any> {
    const params: Record<string, any> = {};
    
    // Extract query terms
    const queryMatch = request.match(/search for ["']([^"']+)["']/i);
    if (queryMatch) {
      params.query = queryMatch[1];
    }
    
    // Extract status
    const statusMatch = request.match(/status[:\s]+(\w+)/i);
    if (statusMatch) {
      params.status = [statusMatch[1]];
    }
    
    // Extract assignee
    const assigneeMatch = request.match(/assignee[:\s]+(\w+)/i);
    if (assigneeMatch) {
      params.assignee = assigneeMatch[1];
    }
    
    return params;
  }
  
  private parseCreateTaskParameters(request: string): Record<string, any> {
    const params: Record<string, any> = {};
    
    // Extract title
    const titleMatch = request.match(/create task ["']([^"']+)["']/i);
    if (titleMatch) {
      params.title = titleMatch[1];
    }
    
    // Extract assignee
    const assigneeMatch = request.match(/assign to (\w+)/i);
    if (assigneeMatch) {
      params.assignee = assigneeMatch[1];
    }
    
    // Extract priority
    const priorityMatch = request.match(/priority[:\s]+(\w+)/i);
    if (priorityMatch) {
      params.priority = priorityMatch[1];
    }
    
    return params;
  }
  
  private parseUpdateTaskParameters(request: string): Record<string, any> {
    const params: Record<string, any> = {};
    
    // Extract task ID
    const idMatch = request.match(/task (\w+)/i);
    if (idMatch) {
      params.taskId = idMatch[1];
    }
    
    // Extract new status
    const statusMatch = request.match(/status to (\w+)/i);
    if (statusMatch) {
      params.status = statusMatch[1];
    }
    
    return params;
  }
  
  private parseCalendarParameters(request: string): Record<string, any> {
    const params: Record<string, any> = {};
    
    // Extract date range
    const dateMatch = request.match(/(\d{4}-\d{2}-\d{2})/g);
    if (dateMatch && dateMatch.length > 0) {
      params.startDate = dateMatch[0];
      if (dateMatch.length > 1) {
        params.endDate = dateMatch[1];
      }
    }
    
    return params;
  }
}
```

---

## 📋 AGENT INTERFACES

### Agent Context
```typescript
interface AgentContext {
  userId: string;
  timezone: string;
  currentDate: Date;
  lastToolResult?: ToolResult;
  executionHistory: ToolExecution[];
}

interface ExecutionPlan {
  action: 'execute_tool' | 'exit';
  toolName?: string;
  parameters?: Record<string, any>;
  response?: string;
}

interface ToolExecution {
  toolName: string;
  parameters: Record<string, any>;
  result: ToolResult;
  timestamp: number;
}

interface AgentResponse {
  success: boolean;
  finalResponse: string;
  executionHistory: ToolExecution[];
  loopsUsed: number;
  error?: string;
}
```

### Agent Service
```typescript
class AgentService {
  private executionEngine: AgentExecutionEngine;
  private toolRegistry: ToolRegistry;
  
  constructor() {
    this.toolRegistry = new ToolRegistry();
    this.executionEngine = new AgentExecutionEngine(this.toolRegistry);
    this.registerTools();
  }
  
  private registerTools(): void {
    this.toolRegistry.register(searchTaskTool);
    this.toolRegistry.register(createTaskTool);
    this.toolRegistry.register(updateTaskTool);
    this.toolRegistry.register(getCalendarAccountsTool);
    this.toolRegistry.register(getCalendarEventsTool);
  }
  
  async processRequest(request: string, userId: string): Promise<AgentResponse> {
    const context: AgentContext = {
      userId,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currentDate: new Date(),
      executionHistory: []
    };
    
    return await this.executionEngine.executeAgent(request, context);
  }
  
  getAvailableTools(): Tool[] {
    return this.toolRegistry.getAll();
  }
}

// Global agent service instance
export const agentService = new AgentService();
```

---

## 🚀 NEXT STEPS

With agent and tooling system implemented:

1. **Phase 7:** Calendar & Coordination
2. **Phase 8:** Feedback & Iteration

**The application now has a powerful agent system with defined tools and execution rules.**
