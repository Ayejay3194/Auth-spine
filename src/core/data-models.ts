/**
 * Canonical Data Models
 * 
 * These are the core primitives that all features must use.
 * No custom primitives allowed - use these or extend them.
 */

import { z } from 'zod';

// Core Primitive Types
export type Role = 'admin' | 'user' | 'readonly';
export type Status = 'active' | 'inactive' | 'loading' | 'error';
export type Permission = string; // Format: "resource:action"
export type Source = 'user' | 'system' | 'external';
export type Confidence = number; // 0-1 scale

// User Primitive
export interface User {
  id: string; // UUID
  email: string; // Unique, verified
  name: string; // Display name
  avatar?: string; // URL
  roles: Role[]; // System roles
  permissions: Permission[]; // Granular permissions
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Task Primitive
export interface Task {
  id: string; // UUID
  title: string; // Human-readable
  description?: string; // Detailed description
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string; // User ID
  createdBy: string; // User ID
  dueDate?: Date; // Optional deadline
  completedAt?: Date; // Completion timestamp
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Event Primitive
export interface Event {
  id: string; // UUID
  type: string; // Event type identifier
  title: string; // Event title
  description?: string; // Event details
  startTime: Date; // Start timestamp
  endTime: Date; // End timestamp
  timezone: string; // IANA timezone
  location?: string; // Physical or virtual location
  attendees: string[]; // User IDs
  organizerId: string; // User ID
  calendarId: string; // Calendar source
  status: 'confirmed' | 'tentative' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// TimeRange Primitive
export interface TimeRange {
  start: Date;
  end: Date;
  timezone: string;
}

// Zod Validation Schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
  roles: z.array(z.enum(['admin', 'user', 'readonly'])),
  permissions: z.array(z.string()),
  status: z.enum(['active', 'inactive', 'suspended']),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().int().positive()
});

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedTo: z.string().uuid(),
  createdBy: z.string().uuid(),
  dueDate: z.date().optional(),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().int().positive()
});

export const eventSchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startTime: z.date(),
  endTime: z.date(),
  timezone: z.string(),
  location: z.string().max(500).optional(),
  attendees: z.array(z.string().uuid()),
  organizerId: z.string().uuid(),
  calendarId: z.string().uuid(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().int().positive()
});

// API Contract Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
    traceId: string;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    timestamp: string;
    version: string;
  };
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  roles?: Role[];
}

export interface CreateUserOutput {
  user: Omit<User, 'password'>;
}

export interface LoginInput {
  email: string;
  password: string;
  clientId: string;
}

export interface LoginOutput {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Task['priority'];
  assignedTo: string;
  dueDate?: string; // ISO date string
}

export interface CreateTaskOutput {
  task: Task;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assignedTo?: string;
  dueDate?: string;
}

export interface UpdateTaskOutput {
  task: Task;
}

export interface CreateEventInput {
  type: string;
  title: string;
  description?: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  timezone: string;
  location?: string;
  attendees: string[];
  calendarId: string;
}

export interface CreateEventOutput {
  event: Event;
}

export interface GetEventsInput {
  calendarIds?: string[];
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  attendeeIds?: string[];
  status?: Event['status'];
  limit?: number;
  offset?: number;
}

export interface GetEventsOutput {
  events: Event[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Error Codes
export enum ErrorCodes {
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // Business logic errors
  TASK_ALREADY_COMPLETED = 'TASK_ALREADY_COMPLETED',
  EVENT_TIME_CONFLICT = 'EVENT_TIME_CONFLICT',
  USER_NOT_AVAILABLE = 'USER_NOT_AVAILABLE'
}

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCodes;
    message: string;
    details?: Record<string, any>;
    traceId: string;
  };
  meta: {
    timestamp: string;
    version: string;
  };
}

// Migration Types
export interface Migration {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
  breakChanges: boolean;
}

// Data Repair Types
export interface RepairResult {
  repaired: number;
  errors: string[];
}

// State Validation Types
export interface StateValidation {
  required: string[];
  optional: string[];
  allowNull: string[];
  allowEmpty: string[];
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: number;
}

export interface CacheState {
  version: number;
  lastSync: number | null;
  pendingWrites: string[];
  conflicts: string[];
}

// Entity State for Redux
export interface EntityState<T> {
  ids: string[];
  entities: Record<string, T>;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// Null/Empty State Definitions
export const NullEmptyStates = {
  user: {
    avatar: "User has not uploaded an avatar",
    permissions: "User has no custom permissions"
  },
  task: {
    description: "No description provided",
    dueDate: "No deadline set"
  },
  event: {
    location: "No location specified",
    description: "No description provided"
  }
} as const;

// Validation Rules
export const StateValidationRules = {
  user: {
    required: ['id', 'email', 'name', 'roles', 'status', 'createdAt', 'updatedAt', 'version'],
    optional: ['avatar', 'permissions'],
    allowNull: ['avatar'],
    allowEmpty: ['permissions']
  },
  
  task: {
    required: ['id', 'title', 'status', 'priority', 'assignedTo', 'createdBy', 'createdAt', 'updatedAt', 'version'],
    optional: ['description', 'dueDate', 'completedAt'],
    allowNull: ['description', 'dueDate', 'completedAt'],
    allowEmpty: []
  },
  
  event: {
    required: ['id', 'type', 'title', 'startTime', 'endTime', 'timezone', 'attendees', 'organizerId', 'calendarId', 'status', 'createdAt', 'updatedAt', 'version'],
    optional: ['description', 'location'],
    allowNull: ['description', 'location'],
    allowEmpty: ['attendees']
  }
} as const;

// Data Validation Functions
export function validateUser(user: unknown): User {
  return userSchema.parse(user);
}

export function validateTask(task: unknown): Task {
  return taskSchema.parse(task);
}

export function validateEvent(event: unknown): Event {
  return eventSchema.parse(event);
}

// Type Guards
export function isValidUser(obj: any): obj is User {
  try {
    userSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

export function isValidTask(obj: any): obj is Task {
  try {
    taskSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

export function isValidEvent(obj: any): obj is Event {
  try {
    eventSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

// Utility Functions
export function createUserStub(overrides: Partial<User> = {}): User {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    email: '',
    name: '',
    roles: ['user'],
    permissions: [],
    status: 'active',
    createdAt: now,
    updatedAt: now,
    version: 1,
    ...overrides
  };
}

export function createTaskStub(overrides: Partial<Task> = {}): Task {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    title: '',
    status: 'pending',
    priority: 'medium',
    assignedTo: '',
    createdBy: '',
    createdAt: now,
    updatedAt: now,
    version: 1,
    ...overrides
  };
}

export function createEventStub(overrides: Partial<Event> = {}): Event {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return {
    id: crypto.randomUUID(),
    type: 'meeting',
    title: '',
    startTime: tomorrow,
    endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000),
    timezone: 'UTC',
    attendees: [],
    organizerId: '',
    calendarId: '',
    status: 'confirmed',
    createdAt: now,
    updatedAt: now,
    version: 1,
    ...overrides
  };
}

// Error Response Builder
export function createErrorResponse(
  code: ErrorCodes,
  message: string,
  details?: Record<string, any>,
  traceId?: string
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      traceId: traceId || crypto.randomUUID()
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  };
}

// Success Response Builder
export function createSuccessResponse<T>(
  data: T,
  meta?: ApiResponse<T>['meta']
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      ...meta
    }
  };
}
