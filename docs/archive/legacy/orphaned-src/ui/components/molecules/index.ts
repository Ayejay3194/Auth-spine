/**
 * Molecular Components - Combinations of Atoms
 * 
 * These combine atoms into meaningful components that can be reused.
 * All molecules must use atoms consistently.
 */

import React from 'react';
import { Avatar, Button, Text, Badge, Card } from '../atoms';
import { User, Task, Event } from '../../core/data-models';

// UserCard Molecule
interface UserCardProps {
  user: User;
  actions?: Array<{
    id: string;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  className?: string;
  showStatus?: boolean;
  showRoles?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  actions = [],
  className = '',
  showStatus = true,
  showRoles = true
}) => {
  const statusColors = {
    active: 'success',
    inactive: 'secondary',
    suspended: 'danger'
  } as const;

  return (
    <Card className={className}>
      <div className="flex items-center space-x-4">
        <Avatar 
          src={user.avatar} 
          name={user.name} 
          size="lg"
        />
        
        <div className="flex-1 min-w-0">
          <Text variant="h4" className="truncate">
            {user.name}
          </Text>
          <Text variant="body" color="secondary" className="truncate">
            {user.email}
          </Text>
          
          {showRoles && user.roles.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {user.roles.map(role => (
                <Badge key={role} variant="secondary" size="xs">
                  {role}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          {showStatus && (
            <Badge variant={statusColors[user.status]} size="sm">
              {user.status}
            </Badge>
          )}
          
          {actions.length > 0 && (
            <div className="flex space-x-1">
              {actions.map(action => (
                <Button
                  key={action.id}
                  size="xs"
                  variant={action.variant || 'secondary'}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// TaskItem Molecule
interface TaskItemProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: Task['status']) => void;
  className?: string;
  showAssignee?: boolean;
  showDueDate?: boolean;
  compact?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  className = '',
  showAssignee = true,
  showDueDate = true,
  compact = false
}) => {
  const priorityColors = {
    low: 'secondary',
    medium: 'primary',
    high: 'warning',
    urgent: 'danger'
  } as const;

  const statusColors = {
    pending: 'secondary',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'danger'
  } as const;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <Card className={className} padding={compact ? 'sm' : 'md'}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Text variant="h4" className="truncate">
              {task.title}
            </Text>
            {task.description && !compact && (
              <Text variant="body" color="secondary" className="mt-1 line-clamp-2">
                {task.description}
              </Text>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Badge variant={priorityColors[task.priority]} size="xs">
              {task.priority}
            </Badge>
            <Badge variant={statusColors[task.status]} size="xs">
              {task.status}
            </Badge>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showAssignee && (
              <div className="flex items-center space-x-2">
                <Text variant="caption" color="secondary">
                  Assigned to:
                </Text>
                <Text variant="caption" weight="medium">
                  {task.assignedTo}
                </Text>
              </div>
            )}
            
            {showDueDate && task.dueDate && (
              <div className="flex items-center space-x-2">
                <Text variant="caption" color={isOverdue ? 'danger' : 'secondary'}>
                  Due:
                </Text>
                <Text 
                  variant="caption" 
                  weight="medium"
                  color={isOverdue ? 'danger' : 'primary'}
                >
                  {new Date(task.dueDate).toLocaleDateString()}
                </Text>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-1">
            {onStatusChange && task.status !== 'completed' && (
              <Button
                size="xs"
                variant="primary"
                onClick={() => onStatusChange('completed')}
              >
                Complete
              </Button>
            )}
            
            {onEdit && (
              <Button
                size="xs"
                variant="secondary"
                onClick={onEdit}
              >
                Edit
              </Button>
            )}
            
            {onDelete && (
              <Button
                size="xs"
                variant="danger"
                onClick={onDelete}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// EventCard Molecule
interface EventCardProps {
  event: Event;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: Event['status']) => void;
  className?: string;
  showAttendees?: boolean;
  showLocation?: boolean;
  compact?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onStatusChange,
  className = '',
  showAttendees = true,
  showLocation = true,
  compact = false
}) => {
  const statusColors = {
    confirmed: 'success',
    tentative: 'warning',
    cancelled: 'danger'
  } as const;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: event.timezone
    }).format(date);
  };

  const isPast = new Date(event.endTime) < new Date();

  return (
    <Card className={className} padding={compact ? 'sm' : 'md'}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Text variant="h4" className="truncate">
              {event.title}
            </Text>
            {event.description && !compact && (
              <Text variant="body" color="secondary" className="mt-1 line-clamp-2">
                {event.description}
              </Text>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Badge variant={statusColors[event.status]} size="xs">
              {event.status}
            </Badge>
            {isPast && (
              <Badge variant="secondary" size="xs">
                Past
              </Badge>
            )}
          </div>
        </div>

        {/* Time and Location */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Text variant="caption" color="secondary">
              {formatDate(event.startTime)} - {formatDate(event.endTime)}
            </Text>
            <Text variant="caption" color="muted">
              ({event.timezone})
            </Text>
          </div>
          
          {showLocation && event.location && (
            <div className="flex items-center space-x-2">
              <Text variant="caption" color="secondary">
                📍 {event.location}
              </Text>
            </div>
          )}
        </div>

        {/* Attendees */}
        {showAttendees && event.attendees.length > 0 && !compact && (
          <div className="flex items-center space-x-2">
            <Text variant="caption" color="secondary">
              Attendees:
            </Text>
            <div className="flex -space-x-2">
              {event.attendees.slice(0, 3).map((attendeeId, index) => (
                <Avatar
                  key={attendeeId}
                  name={`User ${index + 1}`}
                  size="xs"
                  className="ring-2 ring-white"
                />
              ))}
              {event.attendees.length > 3 && (
                <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full ring-2 ring-white">
                  <Text variant="caption" weight="medium">
                    +{event.attendees.length - 3}
                  </Text>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-1">
          {onStatusChange && event.status !== 'cancelled' && (
            <Button
              size="xs"
              variant="danger"
              onClick={() => onStatusChange('cancelled')}
            >
              Cancel
            </Button>
          )}
          
          {onEdit && (
            <Button
              size="xs"
              variant="secondary"
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
          
          {onDelete && (
            <Button
              size="xs"
              variant="danger"
              onClick={onDelete}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

// SearchInput Molecule
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
  disabled?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  className = '',
  disabled = false
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
      />
      
      {value && onClear && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

// FilterChips Molecule
interface FilterChipsProps {
  filters: Array<{
    id: string;
    label: string;
    active: boolean;
    count?: number;
  }>;
  onToggle: (id: string) => void;
  className?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onToggle,
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filters.map(filter => (
        <button
          key={filter.id}
          onClick={() => onToggle(filter.id)}
          className={`
            inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors
            ${filter.active
              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          {filter.label}
          {filter.count !== undefined && (
            <span className="ml-1 text-xs opacity-75">
              ({filter.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

// LoadingStates Molecules
export const LoadingStates = {
  UserCard: () => (
    <Card>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    </Card>
  ),

  TaskItem: () => (
    <Card>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
        <div className="flex justify-between">
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
      </div>
    </Card>
  ),

  EventCard: () => (
    <Card>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
      </div>
    </Card>
  )
};

// ErrorStates Molecules
export const ErrorStates = {
  NetworkError: ({ onRetry }: { onRetry: () => void }) => (
    <Card className="text-center py-8">
      <div className="text-red-500 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <Text variant="h3" className="mb-2">Connection Lost</Text>
      <Text variant="body" color="secondary" className="mb-4">
        Unable to connect to the server. Please check your internet connection.
      </Text>
      <Button onClick={onRetry}>Try Again</Button>
    </Card>
  ),

  EmptyState: ({ 
    title, 
    description, 
    action 
  }: { 
    title: string; 
    description: string; 
    action?: { label: string; onClick: () => void } 
  }) => (
    <Card className="text-center py-8">
      <div className="text-gray-400 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <Text variant="h3" className="mb-2">{title}</Text>
      <Text variant="body" color="secondary" className="mb-4">
        {description}
      </Text>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </Card>
  )
};
