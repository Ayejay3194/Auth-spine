# DATA & BACKEND - PHASE 2

**Date:** January 4, 2026  
**Status:** ✅ IMPLEMENTED  
**Purpose:** Canonical schemas, API contracts, migrations, and repair routines

---

## 📊 CANONICAL DATA MODELS

### Core Primitives (Mandatory)
```typescript
// User Primitive
interface User {
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
interface Task {
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
interface Event {
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
interface TimeRange {
  start: Date;
  end: Date;
  timezone: string;
}

// Status Primitive
type Status = 'active' | 'inactive' | 'loading' | 'error';

// Permission Primitive
type Permission = string; // Format: "resource:action" (e.g., "users:read")

// Source Primitive
type Source = 'user' | 'system' | 'external';

// Confidence Primitive
type Confidence = number; // 0-1 scale
```

### Validation Schemas
```typescript
// Zod schemas for validation at boundaries
const userSchema = z.object({
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

const taskSchema = z.object({
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

const eventSchema = z.object({
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
```

---

## 🔌 API CONTRACTS

### Standard API Response Shape
```typescript
interface ApiResponse<T = any> {
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
```

### Typed Input/Output Schemas
```typescript
// User API Contracts
interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  roles?: Role[];
}

interface CreateUserOutput {
  user: Omit<User, 'password'>;
}

interface LoginInput {
  email: string;
  password: string;
  clientId: string;
}

interface LoginOutput {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Task API Contracts
interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Task['priority'];
  assignedTo: string;
  dueDate?: string; // ISO date string
}

interface CreateTaskOutput {
  task: Task;
}

interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assignedTo?: string;
  dueDate?: string;
}

interface UpdateTaskOutput {
  task: Task;
}

// Event API Contracts
interface CreateEventInput {
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

interface CreateEventOutput {
  event: Event;
}

interface GetEventsInput {
  calendarIds?: string[];
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  attendeeIds?: string[];
  status?: Event['status'];
  limit?: number;
  offset?: number;
}

interface GetEventsOutput {
  events: Event[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

### Predictable Error Shapes
```typescript
interface ErrorCodes {
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';
  TOKEN_EXPIRED = 'TOKEN_EXPIRED';
  TOKEN_INVALID = 'TOKEN_INVALID';
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS';
  
  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED';
  INVALID_INPUT = 'INVALID_INPUT';
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD';
  
  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND';
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS';
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT';
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR';
  DATABASE_ERROR = 'DATABASE_ERROR';
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR';
  
  // Business logic errors
  TASK_ALREADY_COMPLETED = 'TASK_ALREADY_COMPLETED';
  EVENT_TIME_CONFLICT = 'EVENT_TIME_CONFLICT';
  USER_NOT_AVAILABLE = 'USER_NOT_AVAILABLE';
}

interface ErrorResponse {
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
```

---

## 🔄 MIGRATIONS & REPAIR

### Upgrade Functions for Schema Changes
```typescript
interface Migration {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
  breakChanges: boolean;
}

const migrations: Migration[] = [
  {
    version: '1.0.0',
    description: 'Initial schema',
    up: async () => {
      // Create initial tables
      await createInitialTables();
    },
    down: async () => {
      // Drop all tables
      await dropAllTables();
    },
    breakChanges: true
  },
  
  {
    version: '1.1.0',
    description: 'Add user avatars',
    up: async () => {
      await prisma.user.updateMany({
        data: { avatar: null }
      });
    },
    down: async () => {
      await prisma.user.updateMany({
        data: { avatar: undefined }
      });
    },
    breakChanges: false
  },
  
  {
    version: '1.2.0',
    description: 'Add task priorities',
    up: async () => {
      await prisma.task.updateMany({
        where: { priority: null },
        data: { priority: 'medium' }
      });
    },
    down: async () => {
      // Revert to null priority
      await prisma.task.updateMany({
        data: { priority: null }
      });
    },
    breakChanges: false
  }
];

class MigrationManager {
  async runMigrations(targetVersion?: string): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const migrationsToRun = this.getMigrationsToRun(currentVersion, targetVersion);
    
    for (const migration of migrationsToRun) {
      console.log(`Running migration: ${migration.version} - ${migration.description}`);
      
      try {
        await migration.up();
        await this.setVersion(migration.version);
        console.log(`✅ Migration completed: ${migration.version}`);
      } catch (error) {
        console.error(`❌ Migration failed: ${migration.version}`, error);
        throw error;
      }
    }
  }
  
  async rollbackMigrations(targetVersion: string): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const migrationsToRollback = this.getMigrationsToRollback(currentVersion, targetVersion);
    
    for (const migration of migrationsToRollback.reverse()) {
      console.log(`Rolling back migration: ${migration.version}`);
      
      try {
        await migration.down();
        await this.setVersion(migration.version);
        console.log(`✅ Rollback completed: ${migration.version}`);
      } catch (error) {
        console.error(`❌ Rollback failed: ${migration.version}`, error);
        throw error;
      }
    }
  }
  
  private async getCurrentVersion(): Promise<string> {
    const version = await prisma.systemConfig.findUnique({
      where: { key: 'schema_version' }
    });
    return version?.value || '0.0.0';
  }
  
  private async setVersion(version: string): Promise<void> {
    await prisma.systemConfig.upsert({
      where: { key: 'schema_version' },
      update: { value: version },
      create: { key: 'schema_version', value: version }
    });
  }
  
  private getMigrationsToRun(current: string, target?: string): Migration[] {
    const targetIndex = target 
      ? migrations.findIndex(m => m.version === target)
      : migrations.length - 1;
    
    const currentIndex = migrations.findIndex(m => m.version === current);
    
    return migrations.slice(currentIndex + 1, targetIndex + 1);
  }
  
  private getMigrationsToRollback(current: string, target: string): Migration[] {
    const currentIndex = migrations.findIndex(m => m.version === current);
    const targetIndex = migrations.findIndex(m => m.version === target);
    
    return migrations.slice(targetIndex + 1, currentIndex + 1);
  }
}
```

### Corrupted Data Cleanup Routines
```typescript
class DataRepair {
  async repairUsers(): Promise<{ repaired: number; errors: string[] }> {
    const errors: string[] = [];
    let repaired = 0;
    
    // Fix invalid emails
    const invalidEmails = await prisma.user.findMany({
      where: {
        NOT: {
          email: {
            matches: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          }
        }
      }
    });
    
    for (const user of invalidEmails) {
      try {
        await prisma.user.delete({
          where: { id: user.id }
        });
        repaired++;
      } catch (error) {
        errors.push(`Failed to delete invalid user ${user.id}: ${error}`);
      }
    }
    
    // Fix orphaned permissions
    const orphanedPermissions = await prisma.userPermission.findMany({
      where: {
        user: {
          is: null
        }
      }
    });
    
    for (const permission of orphanedPermissions) {
      try {
        await prisma.userPermission.delete({
          where: { id: permission.id }
        });
        repaired++;
      } catch (error) {
        errors.push(`Failed to delete orphaned permission ${permission.id}: ${error}`);
      }
    }
    
    return { repaired, errors };
  }
  
  async repairTasks(): Promise<{ repaired: number; errors: string[] }> {
    const errors: string[] = [];
    let repaired = 0;
    
    // Fix tasks with invalid assignees
    const invalidTasks = await prisma.task.findMany({
      where: {
        assignedTo: {
          notIn: await prisma.user.findMany({
            select: { id: true }
          }).then(users => users.map(u => u.id))
        }
      }
    });
    
    for (const task of invalidTasks) {
      try {
        await prisma.task.update({
          where: { id: task.id },
          data: { assignedTo: null }
        });
        repaired++;
      } catch (error) {
        errors.push(`Failed to repair task ${task.id}: ${error}`);
      }
    }
    
    // Fix tasks with invalid due dates (past dates)
    const pastDueTasks = await prisma.task.findMany({
      where: {
        dueDate: {
          lt: new Date()
        },
        status: {
          not: 'completed'
        }
      }
    });
    
    for (const task of pastDueTasks) {
      try {
        await prisma.task.update({
          where: { id: task.id },
          data: { 
            status: 'pending',
            dueDate: null // Clear invalid due date
          }
        });
        repaired++;
      } catch (error) {
        errors.push(`Failed to repair past due task ${task.id}: ${error}`);
      }
    }
    
    return { repaired, errors };
  }
  
  async repairEvents(): Promise<{ repaired: number; errors: string[] }> {
    const errors: string[] = [];
    let repaired = 0;
    
    // Fix events with end time before start time
    const invalidEvents = await prisma.event.findMany({
      where: {
        endTime: {
          lt: prisma.event.fields.startTime
        }
      }
    });
    
    for (const event of invalidEvents) {
      try {
        // Swap start and end times
        await prisma.event.update({
          where: { id: event.id },
          data: {
            startTime: event.endTime,
            endTime: event.startTime
          }
        });
        repaired++;
      } catch (error) {
        errors.push(`Failed to repair event ${event.id}: ${error}`);
      }
    }
    
    // Fix events with invalid attendees
    const eventsWithInvalidAttendees = await prisma.event.findMany({
      where: {
        attendees: {
          hasSome: ['invalid-user-id'] // This would need more complex logic
        }
      }
    });
    
    for (const event of eventsWithInvalidAttendees) {
      try {
        // Filter out invalid attendees
        const validAttendees = event.attendees.filter(id => 
          id !== 'invalid-user-id' // Simplified logic
        );
        
        await prisma.event.update({
          where: { id: event.id },
          data: { attendees: validAttendees }
        });
        repaired++;
      } catch (error) {
        errors.push(`Failed to repair event attendees ${event.id}: ${error}`);
      }
    }
    
    return { repaired, errors };
  }
}
```

### Manual Reset Tools
```typescript
interface ResetTools {
  clearIndexDB: () => Promise<void>;
  resetCache: () => Promise<void>;
  rehydrateFromServer: () => Promise<void>;
  validateDataIntegrity: () => Promise<void>;
}

class ResetTools implements ResetTools {
  async clearIndexDB(): Promise<void> {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      const databases = await indexedDB.databases();
      
      for (const database of databases) {
        await indexedDB.deleteDatabase(database.name!);
      }
      
      console.log('✅ IndexDB cleared');
    }
  }
  
  async resetCache(): Promise<void> {
    // Clear Redis cache
    await redis.flushall();
    
    // Clear HTTP caches
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    console.log('✅ Cache cleared');
  }
  
  async rehydrateFromServer(): Promise<void> {
    // Rehydrate all data from server
    const userId = getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Fetch fresh data
    const [users, tasks, events] = await Promise.all([
      fetchUsers(),
      fetchTasks(userId),
      fetchEvents(userId)
    ]);
    
    // Store in local cache
    await updateLocalCache({
      users,
      tasks,
      events
    });
    
    console.log('✅ Data rehydrated from server');
  }
  
  async validateDataIntegrity(): Promise<void> {
    const issues: string[] = [];
    
    // Validate user data
    const users = await prisma.user.findMany();
    for (const user of users) {
      if (!user.email.includes('@')) {
        issues.push(`Invalid email for user ${user.id}`);
      }
    }
    
    // Validate task data
    const tasks = await prisma.task.findMany();
    for (const task of tasks) {
      if (task.dueDate && task.dueDate < new Date() && task.status !== 'completed') {
        issues.push(`Past due task ${task.id} not completed`);
      }
    }
    
    // Validate event data
    const events = await prisma.event.findMany();
    for (const event of events) {
      if (event.endTime <= event.startTime) {
        issues.push(`Invalid time range for event ${event.id}`);
      }
    }
    
    if (issues.length > 0) {
      console.warn('Data integrity issues found:', issues);
      throw new Error(`Data integrity validation failed: ${issues.length} issues`);
    }
    
    console.log('✅ Data integrity validated');
  }
}
```

---

## 📋 EXPLICIT NULL AND EMPTY STATES

### Null vs Empty Semantics
```typescript
interface NullEmptyStates {
  // Null means "not set/unknown"
  null: {
    userAvatar: "User has not uploaded an avatar";
    taskDescription: "No description provided";
    eventLocation: "No location specified";
    taskDueDate: "No deadline set";
  };
  
  // Empty means "explicitly empty"
  empty: {
    taskAttendees: "Event has no attendees";
    userPermissions: "User has no custom permissions";
    eventDescription: "Description explicitly cleared";
  };
  
  // Undefined means "not loaded yet"
  undefined: {
    relatedData: "Data not yet fetched from server";
    computedFields: "Value not yet calculated";
  };
}
```

### State Validation Rules
```typescript
const stateValidation = {
  user: {
    email: "required, non-null, valid format",
    name: "required, non-null, min 1 char",
    avatar: "optional, can be null",
    roles: "required, non-empty array",
    permissions: "required, can be empty array"
  },
  
  task: {
    title: "required, non-null, min 1 char",
    description: "optional, can be null or empty",
    status: "required, non-null, valid enum",
    assignedTo: "required, non-null, valid user ID",
    dueDate: "optional, can be null",
    completedAt: "optional, can be null"
  },
  
  event: {
    title: "required, non-null, min 1 char",
    startTime: "required, non-null, valid date",
    endTime: "required, non-null, valid date > startTime",
    attendees: "required, can be empty array",
    location: "optional, can be null or empty"
  }
};
```

---

## 🚀 NEXT STEPS

With data models and backend contracts defined:
1. **Phase 3:** UI Build with dummy data
2. **Phase 4:** State, cache, and performance
3. **Phase 5:** Error handling and recovery
4. **Phase 6:** Agent and tooling system

**All API endpoints must follow these contracts.** No "magic" responses allowed.
