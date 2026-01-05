# UI BUILD - PHASE 3

**Date:** January 4, 2026  
**Status:** ✅ IMPLEMENTED  
**Purpose:** Dummy data first, realistic states, no backend until UI survives chaos

---

## 🎭 DUMMY DATA FIRST

### Realistic Seeded Data
```typescript
// Users with realistic profiles
const dummyUsers = [
  {
    id: "user_001",
    email: "sarah.chen@techcorp.com",
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    roles: ["admin"],
    permissions: ["users:read", "users:write", "tasks:read", "tasks:write"],
    status: "active" as const,
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
    status: "active" as const,
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
    status: "active" as const,
    createdAt: new Date("2024-03-10T13:45:00Z"),
    updatedAt: new Date("2024-12-02T11:30:00Z"),
    version: 1
  }
];

// Tasks with realistic scenarios
const dummyTasks = [
  {
    id: "task_001",
    title: "Implement user authentication flow",
    description: "Add JWT-based authentication with refresh tokens and secure cookie handling",
    status: "in_progress" as const,
    priority: "high" as const,
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
    description: "Create high-fidelity mockups for the admin dashboard with responsive layouts",
    status: "completed" as const,
    priority: "medium" as const,
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
    description: "Resolve intermittent connection timeouts in production environment",
    status: "pending" as const,
    priority: "urgent" as const,
    assignedTo: "user_002",
    createdBy: "user_001",
    dueDate: new Date("2024-12-05T23:59:59Z"),
    createdAt: new Date("2024-12-03T08:45:00Z"),
    updatedAt: new Date("2024-12-04T12:15:00Z"),
    version: 2
  }
];

// Events with realistic calendar scenarios
const dummyEvents = [
  {
    id: "event_001",
    type: "meeting",
    title: "Sprint Planning Session",
    description: "Q1 2025 sprint planning and backlog grooming",
    startTime: new Date("2024-12-12T14:00:00Z"),
    endTime: new Date("2024-12-12T16:00:00Z"),
    timezone: "America/New_York",
    location: "Conference Room A",
    attendees: ["user_001", "user_002", "user_003"],
    organizerId: "user_001",
    calendarId: "cal_main",
    status: "confirmed" as const,
    createdAt: new Date("2024-12-01T10:30:00Z"),
    updatedAt: new Date("2024-12-05T09:15:00Z"),
    version: 2
  },
  {
    id: "event_002",
    type: "review",
    title: "Security Audit Review",
    description: "Review findings from recent security audit and plan remediation",
    startTime: new Date("2024-12-13T10:00:00Z"),
    endTime: new Date("2024-12-13T11:30:00Z"),
    timezone: "America/New_York",
    location: "Virtual - Zoom",
    attendees: ["user_001"],
    organizerId: "user_001",
    calendarId: "cal_security",
    status: "confirmed" as const,
    createdAt: new Date("2024-12-02T14:20:00Z"),
    updatedAt: new Date("2024-12-02T14:20:00Z"),
    version: 1
  }
];
```

### Edge Case Data
```typescript
// Empty states
const emptyStates = {
  users: [],
  tasks: [],
  events: [],
  notifications: []
};

// Loading states
const loadingStates = {
  users: { loading: true, data: null },
  tasks: { loading: true, data: null },
  events: { loading: true, data: null }
};

// Error states
const errorStates = {
  users: { loading: false, error: "Failed to load users", data: null },
  tasks: { loading: false, error: "Network timeout", data: null },
  events: { loading: false, error: "Permission denied", data: null }
};

// Partial states (some data loaded)
const partialStates = {
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
};

// Corrupted states
const corruptedStates = {
  users: [
    { ...dummyUsers[0], email: "invalid-email" }, // Invalid email
    { ...dummyUsers[1], name: "" }, // Empty name
    { ...dummyUsers[2], roles: [] } // No roles
  ],
  tasks: [
    { ...dummyTasks[0], assignedTo: "nonexistent-user" }, // Invalid assignee
    { ...dummyTasks[1], dueDate: new Date("2020-01-01") } // Past due date
  ]
};
```

---

## 🎨 UI ASSEMBLY RULES

### No Placeholders Allowed
```typescript
// ❌ BAD - Placeholder components
const BadComponent = () => (
  <div>
    <div className="placeholder-avatar" />
    <div className="placeholder-text" />
    <div className="placeholder-button" />
  </div>
);

// ✅ GOOD - Real data or realistic loading states
const GoodComponent = ({ user, loading, error }) => {
  if (loading) return <UserSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!user) return <EmptyState />;
  
  return (
    <div>
      <Avatar src={user.avatar} name={user.name} />
      <Text>{user.name}</Text>
      <Button onClick={handleAction}>Action</Button>
    </div>
  );
};
```

### Every Interaction Must Visibly Respond
```typescript
// ✅ GOOD - Immediate visual feedback
const InteractiveButton = ({ onClick, children, ...props }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    setIsPressed(true);
    setIsLoading(true);
    
    try {
      await onClick();
    } finally {
      setIsPressed(false);
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        transition-all duration-150
        ${isPressed ? 'scale-95' : 'scale-100'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
      `}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};
```

---

## 🎭 STATE COVERAGE REQUIREMENTS

### Must Cover All States
```typescript
interface StateCoverage {
  // Empty state
  empty: {
    users: "No users found";
    tasks: "No tasks assigned";
    events: "No events scheduled";
  };
  
  // Loading state
  loading: {
    users: <UserListSkeleton />;
    tasks: <TaskListSkeleton />;
    events: <EventListSkeleton />;
  };
  
  // Error state
  error: {
    users: <ErrorState message="Failed to load users" action="Retry" />;
    tasks: <ErrorState message="Cannot connect to server" action="Check connection" />;
    events: <ErrorState message="Permission denied" action="Contact admin" />;
  };
  
  // Partial state
  partial: {
    users: <UserList loaded={someUsers} pending={pendingUsers} />;
    tasks: <TaskList loaded={someTasks} failed={failedTasks} />;
    events: <EventList loaded={someEvents} loading={loadingEvents} />;
  };
  
  // Corrupted state
  corrupted: {
    users: <UserList users={invalidUsers} validationErrors={errors} />;
    tasks: <TaskList tasks={invalidTasks} repairActions={repairs} />;
    events: <EventList events={invalidEvents} warnings={warnings} />;
  };
}
```

### State Transition Testing
```typescript
const StateTransitions = {
  // Loading → Success
  loadingToSuccess: {
    trigger: "API call succeeds",
    visual: "Skeleton fades out, content fades in",
    duration: "300ms"
  },
  
  // Loading → Error
  loadingToError: {
    trigger: "API call fails",
    visual: "Skeleton replaced with error state",
    duration: "200ms"
  },
  
  // Success → Error (network loss)
  successToError: {
    trigger: "Connection lost",
    visual: "Content dims, error toast appears",
    duration: "150ms"
  },
  
  // Error → Success (retry)
  errorToSuccess: {
    trigger: "Retry succeeds",
    visual: "Error fades out, content fades in",
    duration: "300ms"
  }
};
```

---

## 🎨 COMPONENT ARCHITECTURE

### Atomic Design Pattern
```typescript
// Atoms (smallest units)
const Avatar = ({ src, name, size = "md" }) => { /* ... */ };
const Button = ({ children, variant, size, onClick }) => { /* ... */ };
const Text = ({ children, variant, color }) => { /* ... */ };
const Icon = ({ name, size, color }) => { /* ... */ };

// Molecules (combinations of atoms)
const UserCard = ({ user, actions }) => (
  <Card>
    <Avatar src={user.avatar} name={user.name} size="lg" />
    <Text variant="h3">{user.name}</Text>
    <Text variant="body">{user.email}</Text>
    <ButtonGroup>
      {actions.map(action => <Button key={action.id} {...action} />)}
    </ButtonGroup>
  </Card>
);

const TaskItem = ({ task, onEdit, onDelete }) => (
  <TaskCard>
    <TaskHeader>
      <Text variant="h4">{task.title}</Text>
      <PriorityBadge priority={task.priority} />
    </TaskHeader>
    <TaskBody>
      <Text variant="body">{task.description}</Text>
      <TaskMeta>
        <AssigneeAvatar userId={task.assignedTo} />
        <DueDate date={task.dueDate} />
      </TaskMeta>
    </TaskBody>
    <TaskActions>
      <Button onClick={onEdit}>Edit</Button>
      <Button variant="danger" onClick={onDelete}>Delete</Button>
    </TaskActions>
  </TaskCard>
);

// Organisms (complex components)
const UserList = ({ users, loading, error, onUserSelect }) => {
  if (loading) return <UserListSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!users?.length) return <EmptyState message="No users found" />;
  
  return (
    <List>
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user}
          actions={[
            { id: 'view', children: 'View', onClick: () => onUserSelect(user) },
            { id: 'edit', children: 'Edit', onClick: () => onEdit(user) }
          ]}
        />
      ))}
    </List>
  );
};

const TaskBoard = ({ tasks, users, onTaskUpdate }) => (
  <Board>
    <Column title="To Do" status="pending">
      {tasks.filter(t => t.status === 'pending').map(task => (
        <TaskItem 
          key={task.id} 
          task={task}
          onEdit={() => onTaskUpdate(task.id, { status: 'in_progress' })}
          onDelete={() => onTaskUpdate(task.id, { status: 'cancelled' })}
        />
      ))}
    </Column>
    <Column title="In Progress" status="in_progress">
      {tasks.filter(t => t.status === 'in_progress').map(task => (
        <TaskItem 
          key={task.id} 
          task={task}
          onEdit={() => onTaskUpdate(task.id, { status: 'completed' })}
          onDelete={() => onTaskUpdate(task.id, { status: 'cancelled' })}
        />
      ))}
    </Column>
    <Column title="Completed" status="completed">
      {tasks.filter(t => t.status === 'completed').map(task => (
        <TaskItem 
          key={task.id} 
          task={task}
          onEdit={() => onTaskUpdate(task.id, { status: 'pending' })}
          onDelete={() => onTaskUpdate(task.id, { status: 'cancelled' })}
        />
      ))}
    </Column>
  </Board>
);

// Templates (page layouts)
const DashboardPage = ({ user, tasks, events }) => (
  <Page>
    <Header>
      <WelcomeMessage user={user} />
      <QuickActions />
    </Header>
    <Main>
      <Section>
        <TaskBoard tasks={tasks} users={users} onTaskUpdate={handleTaskUpdate} />
      </Section>
      <Section>
        <EventCalendar events={events} onEventSelect={handleEventSelect} />
      </Section>
    </Main>
    <Sidebar>
      <UserList users={users} onUserSelect={handleUserSelect} />
    </Sidebar>
  </Page>
);
```

---

## 🎭 INTERACTION PATTERNS

### Loading States
```typescript
const SkeletonComponents = {
  UserCard: () => (
    <Card className="animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-3 bg-gray-300 rounded w-1/2" />
        </div>
      </div>
    </Card>
  ),
  
  TaskItem: () => (
    <div className="p-4 border rounded-lg animate-pulse">
      <div className="h-5 bg-gray-300 rounded w-2/3 mb-2" />
      <div className="h-3 bg-gray-300 rounded w-full mb-3" />
      <div className="flex justify-between">
        <div className="h-6 bg-gray-300 rounded w-20" />
        <div className="h-6 bg-gray-300 rounded w-16" />
      </div>
    </div>
  ),
  
  EventCard: () => (
    <div className="p-4 border rounded-lg animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-300 rounded w-1/2 mb-3" />
      <div className="flex space-x-2">
        <div className="h-8 bg-gray-300 rounded w-24" />
        <div className="h-8 bg-gray-300 rounded w-20" />
      </div>
    </div>
  )
};
```

### Error States
```typescript
const ErrorStates = {
  NetworkError: ({ onRetry }) => (
    <div className="text-center p-8">
      <Icon name="wifi-off" size="xl" className="text-red-500 mb-4" />
      <Text variant="h3" className="mb-2">Connection Lost</Text>
      <Text variant="body" className="mb-4">
        Unable to connect to the server. Please check your internet connection.
      </Text>
      <Button onClick={onRetry}>Try Again</Button>
    </div>
  ),
  
  PermissionError: ({ onContact }) => (
    <div className="text-center p-8">
      <Icon name="lock" size="xl" className="text-yellow-500 mb-4" />
      <Text variant="h3" className="mb-2">Access Denied</Text>
      <Text variant="body" className="mb-4">
        You don't have permission to view this content.
      </Text>
      <Button onClick={onContact}>Contact Admin</Button>
    </div>
  ),
  
  DataError: ({ onReport }) => (
    <div className="text-center p-8">
      <Icon name="alert-triangle" size="xl" className="text-red-500 mb-4" />
      <Text variant="h3" className="mb-2">Something Went Wrong</Text>
      <Text variant="body" className="mb-4">
        We encountered an unexpected error. Our team has been notified.
      </Text>
      <Button onClick={onReport}>Report Issue</Button>
    </div>
  )
};
```

### Empty States
```typescript
const EmptyStates = {
  NoUsers: () => (
    <div className="text-center p-8">
      <Icon name="users" size="xl" className="text-gray-400 mb-4" />
      <Text variant="h3" className="mb-2">No Users Yet</Text>
      <Text variant="body" className="mb-4">
        Get started by inviting your first team member.
      </Text>
      <Button onClick={handleInviteUser}>Invite User</Button>
    </div>
  ),
  
  NoTasks: () => (
    <div className="text-center p-8">
      <Icon name="check-square" size="xl" className="text-gray-400 mb-4" />
      <Text variant="h3" className="mb-2">All Caught Up!</Text>
      <Text variant="body" className="mb-4">
        You have no tasks assigned. Enjoy your free time!
      </Text>
      <Button onClick={handleCreateTask}>Create Task</Button>
    </div>
  ),
  
  NoEvents: () => (
    <div className="text-center p-8">
      <Icon name="calendar" size="xl" className="text-gray-400 mb-4" />
      <Text variant="h3" className="mb-2">No Events Scheduled</Text>
      <Text variant="body" className="mb-4">
        Your calendar is clear. Time to plan something!
      </Text>
      <Button onClick={handleCreateEvent}>Schedule Event</Button>
    </div>
  )
};
```

---

## 🎨 RESPONSIVE DESIGN RULES

### Mobile-First Approach
```typescript
const ResponsiveBreakpoints = {
  mobile: "640px",   // sm
  tablet: "768px",   // md
  desktop: "1024px", // lg
  wide: "1280px"     // xl
};

const ResponsivePatterns = {
  // Stack on mobile, side-by-side on desktop
  StackToSideBySide: {
    mobile: "flex flex-col space-y-4",
    desktop: "flex flex-row space-x-4"
  },
  
  // Single column mobile, multi-column desktop
  SingleToMultiColumn: {
    mobile: "grid grid-cols-1",
    tablet: "grid grid-cols-2",
    desktop: "grid grid-cols-3"
  },
  
  // Full width mobile, constrained desktop
  FullToConstrained: {
    mobile: "w-full",
    desktop: "max-w-4xl mx-auto"
  }
};
```

---

## 🎯 UI QUALITY GATES

### Before Backend Integration
```typescript
const QualityChecks = {
  visual: {
    noPlaceholders: "All components show real content or loading states",
    responsive: "Layout works on mobile, tablet, desktop",
    accessible: "Keyboard navigation, screen readers, color contrast",
    consistent: "Design system followed throughout"
  },
  
  interaction: {
    feedback: "Every interaction has visual feedback",
    transitions: "Smooth state transitions",
    errors: "Clear error states with recovery actions",
    loading: "Loading states for all async operations"
  },
  
  data: {
    coverage: "All data states covered (empty, loading, error, partial)",
    edgeCases: "Corrupted data handled gracefully",
    validation: "Input validation with helpful errors",
    sync: "Optimistic updates with conflict resolution"
  }
};
```

---

## 🚀 NEXT STEPS

UI is now battle-tested with realistic data and states:

1. **Phase 4:** State, Cache, Performance
2. **Phase 5:** Error & Recovery  
3. **Phase 6:** Agent & Tooling System
4. **Phase 7:** Calendar & Coordination
5. **Phase 8:** Feedback & Iteration

**Rule:** No backend integration until UI survives all chaos tests.
