/**
 * Organism Components - Complex UI Assemblies
 * 
 * These combine molecules and atoms into complex, feature-rich components.
 * All organisms must use molecules and atoms consistently.
 */

import React, { useState } from 'react';
import { UserCard, TaskItem, EventCard, SearchInput, FilterChips, LoadingStates, ErrorStates } from '../molecules';
import { Button, Text, Card } from '../atoms';
import { User, Task, Event } from '../../core/data-models';

// UserList Organism
interface UserListProps {
  users: User[];
  loading?: boolean;
  error?: string;
  onUserSelect?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (user: User) => void;
  onRetry?: () => void;
  className?: string;
  searchable?: boolean;
  filterable?: boolean;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  loading = false,
  error,
  onUserSelect,
  onUserEdit,
  onUserDelete,
  onRetry,
  className = '',
  searchable = true,
  filterable = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filters = [
    { id: 'active', label: 'Active', active: activeFilters.includes('active'), count: users.filter(u => u.status === 'active').length },
    { id: 'inactive', label: 'Inactive', active: activeFilters.includes('inactive'), count: users.filter(u => u.status === 'inactive').length },
    { id: 'suspended', label: 'Suspended', active: activeFilters.includes('suspended'), count: users.filter(u => u.status === 'suspended').length },
    { id: 'admin', label: 'Admin', active: activeFilters.includes('admin'), count: users.filter(u => u.roles.includes('admin')).length }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilters = activeFilters.length === 0 || activeFilters.some(filter => {
      switch (filter) {
        case 'active':
        case 'inactive':
        case 'suspended':
          return user.status === filter;
        case 'admin':
          return user.roles.includes('admin');
        default:
          return true;
      }
    });

    return matchesSearch && matchesFilters;
  });

  const handleFilterToggle = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingStates.UserCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorStates.NetworkError onRetry={onRetry || (() => {})} />
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className={className}>
        <ErrorStates.EmptyState
          title="No Users Found"
          description="Get started by inviting your first team member."
          action={{ label: "Invite User", onClick: () => {} }}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <Card>
          {searchable && (
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search users..."
              className="mb-3"
            />
          )}
          
          {filterable && (
            <FilterChips
              filters={filters}
              onToggle={handleFilterToggle}
            />
          )}
        </Card>
      )}

      {/* User Count */}
      <Text variant="body" color="secondary">
        Showing {filteredUsers.length} of {users.length} users
      </Text>

      {/* User Cards */}
      <div className="space-y-3">
        {filteredUsers.map(user => (
          <UserCard
            key={user.id}
            user={user}
            actions={[
              ...(onUserSelect ? [{ id: 'view', label: 'View', onClick: () => onUserSelect(user) }] : []),
              ...(onUserEdit ? [{ id: 'edit', label: 'Edit', onClick: () => onUserEdit(user) }] : []),
              ...(onUserDelete ? [{ id: 'delete', label: 'Delete', onClick: () => onUserDelete(user), variant: 'danger' as const }] : [])
            ]}
          />
        ))}
      </div>

      {/* Empty State for Filtered Results */}
      {filteredUsers.length === 0 && users.length > 0 && (
        <ErrorStates.EmptyState
          title="No Matching Users"
          description="Try adjusting your search or filters."
        />
      )}
    </div>
  );
};

// TaskBoard Organism
interface TaskBoardProps {
  tasks: Task[];
  users: User[];
  loading?: boolean;
  error?: string;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  onRetry?: () => void;
  className?: string;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  users,
  loading = false,
  error,
  onTaskUpdate,
  onTaskDelete,
  onRetry,
  className = ''
}) => {
  const columns = [
    { id: 'pending', title: 'To Do', status: 'pending' as const },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress' as const },
    { id: 'completed', title: 'Completed', status: 'completed' as const }
  ];

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        {columns.map(column => (
          <Card key={column.id} className="p-4">
            <Text variant="h4" className="mb-4">{column.title}</Text>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <LoadingStates.TaskItem key={i} />
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorStates.NetworkError onRetry={onRetry || (() => {})} />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {columns.map(column => {
        const columnTasks = getTasksByStatus(column.status);
        
        return (
          <Card key={column.id} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Text variant="h4">{column.title}</Text>
              <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                {columnTasks.length}
              </div>
            </div>
            
            <div className="space-y-3 min-h-[200px]">
              {columnTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  compact={true}
                  onEdit={() => onTaskUpdate?.(task.id, { title: task.title })}
                  onDelete={() => onTaskDelete?.(task.id)}
                  onStatusChange={(newStatus) => onTaskUpdate?.(task.id, { status: newStatus })}
                />
              ))}
              
              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Text variant="body" color="secondary">
                    No tasks in {column.title.toLowerCase()}
                  </Text>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// EventCalendar Organism
interface EventCalendarProps {
  events: Event[];
  users: User[];
  loading?: boolean;
  error?: string;
  onEventSelect?: (event: Event) => void;
  onEventEdit?: (event: Event) => void;
  onEventDelete?: (eventId: string) => void;
  onRetry?: () => void;
  className?: string;
  view?: 'list' | 'calendar';
}

export const EventCalendar: React.FC<EventCalendarProps> = ({
  events,
  users,
  loading = false,
  error,
  onEventSelect,
  onEventEdit,
  onEventDelete,
  onRetry,
  className = '',
  view = 'list'
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const groupEventsByDate = () => {
    const grouped = new Map<string, Event[]>();
    
    events.forEach(event => {
      const dateKey = new Date(event.startTime).toDateString();
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });
    
    return Array.from(grouped.entries()).map(([date, dateEvents]) => ({
      date: new Date(date),
      events: dateEvents.sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
    }));
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingStates.EventCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorStates.NetworkError onRetry={onRetry || (() => {})} />
      </div>
    );
  }

  if (view === 'list') {
    const groupedEvents = groupEventsByDate();
    
    return (
      <div className={`space-y-6 ${className}`}>
        {groupedEvents.length === 0 ? (
          <ErrorStates.EmptyState
            title="No Events Scheduled"
            description="Your calendar is clear. Time to plan something!"
            action={{ label: "Schedule Event", onClick: () => {} }}
          />
        ) : (
          groupedEvents.map(({ date, events: dateEvents }) => (
            <div key={date.toISOString()}>
              <Text variant="h3" className="mb-3">
                {date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              
              <div className="space-y-3">
                {dateEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={() => onEventEdit?.(event)}
                    onDelete={() => onEventDelete?.(event.id)}
                    onStatusChange={(newStatus) => onEventEdit?.({ ...event, status: newStatus })}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // Calendar view would go here - simplified for now
  return (
    <div className={className}>
      <Text variant="h3">Calendar View</Text>
      <Text variant="body" color="secondary">
        Calendar view implementation would go here
      </Text>
    </div>
  );
};

// Dashboard Organism
interface DashboardProps {
  user: User;
  tasks: Task[];
  events: Event[];
  users: User[];
  loading?: boolean;
  error?: string;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onEventSelect?: (event: Event) => void;
  onUserSelect?: (user: User) => void;
  className?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  tasks,
  events,
  users,
  loading = false,
  error,
  onTaskUpdate,
  onEventSelect,
  onUserSelect,
  className = ''
}) => {
  const myTasks = tasks.filter(task => task.assignedTo === user.id);
  const upcomingEvents = events.filter(event => 
    new Date(event.startTime) > new Date() && 
    event.attendees.includes(user.id)
  );

  const taskStats = {
    total: myTasks.length,
    pending: myTasks.filter(t => t.status === 'pending').length,
    inProgress: myTasks.filter(t => t.status === 'in_progress').length,
    completed: myTasks.filter(t => t.status === 'completed').length
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse mb-2" />
              <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Welcome Header */}
      <div>
        <Text variant="h2">Welcome back, {user.name}!</Text>
        <Text variant="body" color="secondary">
          Here's what's happening with your tasks and events today.
        </Text>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <Text variant="body" color="secondary">Total Tasks</Text>
          <Text variant="h3">{taskStats.total}</Text>
        </Card>
        
        <Card className="p-4">
          <Text variant="body" color="secondary">To Do</Text>
          <Text variant="h3">{taskStats.pending}</Text>
        </Card>
        
        <Card className="p-4">
          <Text variant="body" color="secondary">In Progress</Text>
          <Text variant="h3">{taskStats.inProgress}</Text>
        </Card>
        
        <Card className="p-4">
          <Text variant="body" color="secondary">Upcoming Events</Text>
          <Text variant="h3">{upcomingEvents.length}</Text>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Text variant="h3">My Tasks</Text>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          
          <div className="space-y-3">
            {myTasks.slice(0, 3).map(task => (
              <TaskItem
                key={task.id}
                task={task}
                compact={true}
                onStatusChange={(status) => onTaskUpdate?.(task.id, { status })}
              />
            ))}
            
            {myTasks.length === 0 && (
              <ErrorStates.EmptyState
                title="No Tasks Assigned"
                description="You don't have any tasks assigned to you."
              />
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Text variant="h3">Upcoming Events</Text>
            <Button variant="ghost" size="sm">View Calendar</Button>
          </div>
          
          <div className="space-y-3">
            {upcomingEvents.slice(0, 3).map(event => (
              <EventCard
                key={event.id}
                event={event}
                compact={true}
                onClick={() => onEventSelect?.(event)}
              />
            ))}
            
            {upcomingEvents.length === 0 && (
              <ErrorStates.EmptyState
                title="No Upcoming Events"
                description="You have no events scheduled."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
