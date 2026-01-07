/**
 * Dummy Data for UI Development
 * 
 * Realistic seeded data covering all edge cases and states.
 * Use this for UI development before backend integration.
 */

import { User, Task, Event } from '../core/data-models';

// Realistic Users
export const dummyUsers: User[] = [
  {
    id: "user_001",
    email: "sarah.chen@techcorp.com",
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    roles: ["admin"],
    permissions: ["users:read", "users:write", "tasks:read", "tasks:write"],
    status: "active",
    createdAt: new Date("2024-01-15T10:30:00Z"),
    updatedAt: new Date("2024-12-01T14:20:00Z"),
    version: 3
  },
  {
    id: "user_002", 
    email: "marcus.johnson@startup.io",
    name: "Marcus Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus",
    roles: ["user"],
    permissions: ["tasks:read", "tasks:write"],
    status: "active",
    createdAt: new Date("2024-02-20T09:15:00Z"),
    updatedAt: new Date("2024-11-28T16:45:00Z"),
    version: 2
  },
  {
    id: "user_003",
    email: "elena.rodriguez@design.co",
    name: "Elena Rodriguez", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena",
    roles: ["user"],
    permissions: ["tasks:read"],
    status: "active",
    createdAt: new Date("2024-03-10T13:45:00Z"),
    updatedAt: new Date("2024-12-02T11:30:00Z"),
    version: 1
  },
  {
    id: "user_004",
    email: "david.kim@enterprise.com",
    name: "David Kim",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
    roles: ["readonly"],
    permissions: ["tasks:read"],
    status: "inactive",
    createdAt: new Date("2024-04-05T11:20:00Z"),
    updatedAt: new Date("2024-11-15T09:30:00Z"),
    version: 1
  },
  {
    id: "user_005",
    email: "alex.thompson@freelance.io",
    name: "Alex Thompson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    roles: ["user"],
    permissions: ["tasks:read", "tasks:write"],
    status: "suspended",
    createdAt: new Date("2024-05-12T14:45:00Z"),
    updatedAt: new Date("2024-11-20T16:00:00Z"),
    version: 2
  }
];

// Realistic Tasks
export const dummyTasks: Task[] = [
  {
    id: "task_001",
    title: "Implement user authentication flow",
    description: "Add JWT-based authentication with refresh tokens and secure cookie handling. Include password reset functionality and MFA support.",
    status: "in_progress",
    priority: "high",
    assignedTo: "user_001",
    createdBy: "user_001",
    dueDate: new Date("2024-12-15T23:59:59Z"),
    createdAt: new Date("2024-12-01T10:00:00Z"),
    updatedAt: new Date("2024-12-10T15:30:00Z"),
    version: 4
  },
  {
    id: "task_002",
    title: "Design dashboard mockups",
    description: "Create high-fidelity mockups for the admin dashboard with responsive layouts. Include user management, task board, and calendar views.",
    status: "completed",
    priority: "medium",
    assignedTo: "user_003",
    createdBy: "user_002",
    dueDate: new Date("2024-12-08T23:59:59Z"),
    completedAt: new Date("2024-12-07T17:30:00Z"),
    createdAt: new Date("2024-11-25T14:20:00Z"),
    updatedAt: new Date("2024-12-07T17:30:00Z"),
    version: 3
  },
  {
    id: "task_003",
    title: "Fix production database connection issue",
    description: "Resolve intermittent connection timeouts in production environment. Check connection pooling and retry logic.",
    status: "pending",
    priority: "urgent",
    assignedTo: "user_002",
    createdBy: "user_001",
    dueDate: new Date("2024-12-05T23:59:59Z"),
    createdAt: new Date("2024-12-03T08:45:00Z"),
    updatedAt: new Date("2024-12-04T12:15:00Z"),
    version: 2
  },
  {
    id: "task_004",
    title: "Write API documentation",
    description: "Document all API endpoints with examples, error codes, and authentication requirements.",
    status: "pending",
    priority: "low",
    assignedTo: "user_004",
    createdBy: "user_001",
    createdAt: new Date("2024-12-05T13:20:00Z"),
    updatedAt: new Date("2024-12-05T13:20:00Z"),
    version: 1
  },
  {
    id: "task_005",
    title: "Optimize database queries",
    description: "Review and optimize slow database queries. Add proper indexes and query caching.",
    status: "cancelled",
    priority: "medium",
    assignedTo: "user_002",
    createdBy: "user_001",
    createdAt: new Date("2024-11-20T10:15:00Z"),
    updatedAt: new Date("2024-12-01T09:45:00Z"),
    version: 3
  }
];

// Realistic Events
export const dummyEvents: Event[] = [
  {
    id: "event_001",
    type: "meeting",
    title: "Sprint Planning Session",
    description: "Q1 2025 sprint planning and backlog grooming. Review priorities and assign tasks.",
    startTime: new Date("2024-12-12T14:00:00Z"),
    endTime: new Date("2024-12-12T16:00:00Z"),
    timezone: "America/New_York",
    location: "Conference Room A",
    attendees: ["user_001", "user_002", "user_003"],
    organizerId: "user_001",
    calendarId: "cal_main",
    status: "confirmed",
    createdAt: new Date("2024-12-01T10:30:00Z"),
    updatedAt: new Date("2024-12-05T09:15:00Z"),
    version: 2
  },
  {
    id: "event_002",
    type: "review",
    title: "Security Audit Review",
    description: "Review findings from recent security audit and plan remediation efforts.",
    startTime: new Date("2024-12-13T10:00:00Z"),
    endTime: new Date("2024-12-13T11:30:00Z"),
    timezone: "America/New_York",
    location: "Virtual - Zoom",
    attendees: ["user_001"],
    organizerId: "user_001",
    calendarId: "cal_security",
    status: "confirmed",
    createdAt: new Date("2024-12-02T14:20:00Z"),
    updatedAt: new Date("2024-12-02T14:20:00Z"),
    version: 1
  },
  {
    id: "event_003",
    type: "1on1",
    title: "1:1 with Marcus",
    description: "Weekly check-in with Marcus to discuss project progress and blockers.",
    startTime: new Date("2024-12-11T15:00:00Z"),
    endTime: new Date("2024-12-11T15:30:00Z"),
    timezone: "America/New_York",
    location: "Virtual - Google Meet",
    attendees: ["user_001", "user_002"],
    organizerId: "user_001",
    calendarId: "cal_1on1",
    status: "tentative",
    createdAt: new Date("2024-12-01T16:45:00Z"),
    updatedAt: new Date("2024-12-09T11:20:00Z"),
    version: 2
  },
  {
    id: "event_004",
    type: "workshop",
    title: "Design System Workshop",
    description: "Workshop to establish design system guidelines and component library.",
    startTime: new Date("2024-12-16T13:00:00Z"),
    endTime: new Date("2024-12-16T17:00:00Z"),
    timezone: "America/New_York",
    location: "Design Studio",
    attendees: ["user_002", "user_003"],
    organizerId: "user_003",
    calendarId: "cal_design",
    status: "confirmed",
    createdAt: new Date("2024-12-03T09:30:00Z"),
    updatedAt: new Date("2024-12-03T09:30:00Z"),
    version: 1
  }
];

// Edge Case Data
export const edgeCaseData = {
  // Empty states
  empty: {
    users: [],
    tasks: [],
    events: [],
    notifications: []
  },
  
  // Loading states
  loading: {
    users: { loading: true, data: null, error: null },
    tasks: { loading: true, data: null, error: null },
    events: { loading: true, data: null, error: null }
  },
  
  // Error states
  error: {
    users: { loading: false, error: "Failed to load users", data: null },
    tasks: { loading: false, error: "Network timeout", data: null },
    events: { loading: false, error: "Permission denied", data: null }
  },
  
  // Partial states
  partial: {
    users: {
      loaded: dummyUsers.slice(0, 2),
      pending: ["user_003"],
      failed: []
    },
    tasks: {
      loaded: dummyTasks.filter(t => t.status !== "pending"),
      pending: ["task_003"],
      failed: []
    }
  },
  
  // Corrupted states
  corrupted: {
    users: [
      { ...dummyUsers[0], email: "invalid-email" }, // Invalid email
      { ...dummyUsers[1], name: "" }, // Empty name
      { ...dummyUsers[2], roles: [] } // No roles
    ],
    tasks: [
      { ...dummyTasks[0], assignedTo: "nonexistent-user" }, // Invalid assignee
      { ...dummyTasks[1], dueDate: new Date("2020-01-01") } // Past due date
    ],
    events: [
      { ...dummyEvents[0], endTime: new Date("2024-12-12T13:00:00Z") }, // End before start
      { ...dummyEvents[1], attendees: ["nonexistent-user"] } // Invalid attendee
    ]
  }
};

// State generators for testing
export const stateGenerators = {
  // Generate users with specific characteristics
  generateUsers: (count: number, options: {
    status?: User['status'];
    roles?: User['roles'];
    includeInactive?: boolean;
  } = {}): User[] => {
    const { status, roles, includeInactive = false } = options;
    
    return Array.from({ length: count }, (_, i) => ({
      id: `generated_user_${i + 1}`,
      email: `user${i + 1}@example.com`,
      name: `Generated User ${i + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}`,
      roles: roles || ["user"],
      permissions: ["tasks:read"],
      status: status || (includeInactive && i % 3 === 0 ? "inactive" : "active"),
      createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
      updatedAt: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)),
      version: 1
    }));
  },
  
  // Generate tasks with specific statuses
  generateTasks: (count: number, options: {
    status?: Task['status'];
    priority?: Task['priority'];
    assignee?: string;
  } = {}): Task[] => {
    const { status, priority, assignee } = options;
    
    return Array.from({ length: count }, (_, i) => ({
      id: `generated_task_${i + 1}`,
      title: `Generated Task ${i + 1}`,
      description: `This is a generated task for testing purposes.`,
      status: status || (i % 3 === 0 ? "completed" : i % 2 === 0 ? "in_progress" : "pending"),
      priority: priority || (i % 4 === 0 ? "urgent" : i % 3 === 0 ? "high" : "medium"),
      assignedTo: assignee || dummyUsers[i % dummyUsers.length].id,
      createdBy: dummyUsers[0].id,
      dueDate: i % 2 === 0 ? new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000) : undefined,
      completedAt: status === "completed" ? new Date(Date.now() - (i * 60 * 60 * 1000)) : undefined,
      createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
      updatedAt: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)),
      version: 1
    }));
  },
  
  // Generate events for date range
  generateEvents: (count: number, options: {
    startDate?: Date;
    endDate?: Date;
    organizerId?: string;
  } = {}): Event[] => {
    const { startDate = new Date(), endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), organizerId } = options;
    
    const dateRange = endDate.getTime() - startDate.getTime();
    
    return Array.from({ length: count }, (_, i) => {
      const eventStart = new Date(startDate.getTime() + (i * dateRange / count));
      const eventEnd = new Date(eventStart.getTime() + (60 + Math.random() * 120) * 60 * 1000);
      
      return {
        id: `generated_event_${i + 1}`,
        type: ["meeting", "review", "1on1", "workshop"][i % 4],
        title: `Generated Event ${i + 1}`,
        description: `This is a generated event for testing purposes.`,
        startTime: eventStart,
        endTime: eventEnd,
        timezone: "America/New_York",
        location: i % 2 === 0 ? "Conference Room" : "Virtual",
        attendees: [dummyUsers[i % dummyUsers.length].id],
        organizerId: organizerId || dummyUsers[0].id,
        calendarId: "cal_main",
        status: i % 4 === 0 ? "tentative" : "confirmed",
        createdAt: new Date(eventStart.getTime() - (7 * 24 * 60 * 60 * 1000)),
        updatedAt: new Date(eventStart.getTime() - (6 * 24 * 60 * 60 * 1000)),
        version: 1
      };
    });
  }
};

// Mock API responses
export const mockApiResponses = {
  // Success responses
  success: {
    getUsers: {
      success: true,
      data: dummyUsers,
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      }
    },
    
    getTasks: {
      success: true,
      data: dummyTasks,
      meta: {
        pagination: {
          page: 1,
          limit: 10,
          total: dummyTasks.length,
          pages: 1
        },
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      }
    },
    
    getEvents: {
      success: true,
      data: dummyEvents,
      meta: {
        pagination: {
          page: 1,
          limit: 10,
          total: dummyEvents.length,
          pages: 1
        },
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      }
    }
  },
  
  // Error responses
  error: {
    networkError: {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Unable to connect to server",
        traceId: "trace_123456"
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      }
    },
    
    permissionError: {
      success: false,
      error: {
        code: "INSUFFICIENT_PERMISSIONS",
        message: "You don't have permission to access this resource",
        traceId: "trace_789012"
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      }
    },
    
    validationError: {
      success: false,
      error: {
        code: "VALIDATION_FAILED",
        message: "Invalid input data",
        details: {
          email: "Invalid email format",
          name: "Name is required"
        },
        traceId: "trace_345678"
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      }
    }
  },
  
  // Loading states (simulated delays)
  simulateDelay: <T>(data: T, delay: number = 1000): Promise<T> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(data), delay);
    });
  },
  
  simulateError: (errorType: 'network' | 'permission' | 'validation', delay: number = 500): Promise<any> => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        const errors = {
          network: mockApiResponses.error.networkError,
          permission: mockApiResponses.error.permissionError,
          validation: mockApiResponses.error.validationError
        };
        reject(errors[errorType]);
      }, delay);
    });
  }
};

// Data validation helpers
export const dataValidation = {
  validateUser: (user: any): boolean => {
    return user && 
           typeof user.id === 'string' &&
           typeof user.email === 'string' &&
           user.email.includes('@') &&
           typeof user.name === 'string' &&
           user.name.length > 0 &&
           Array.isArray(user.roles) &&
           user.roles.length > 0;
  },
  
  validateTask: (task: any): boolean => {
    return task &&
           typeof task.id === 'string' &&
           typeof task.title === 'string' &&
           task.title.length > 0 &&
           ['pending', 'in_progress', 'completed', 'cancelled'].includes(task.status) &&
           ['low', 'medium', 'high', 'urgent'].includes(task.priority) &&
           typeof task.assignedTo === 'string';
  },
  
  validateEvent: (event: any): boolean => {
    return event &&
           typeof event.id === 'string' &&
           typeof event.title === 'string' &&
           event.title.length > 0 &&
           event.startTime instanceof Date &&
           event.endTime instanceof Date &&
           event.endTime > event.startTime &&
           typeof event.timezone === 'string';
  }
};
