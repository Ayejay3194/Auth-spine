/**
 * Template Components - Page Layouts
 * 
 * These combine organisms, molecules, and atoms into complete page layouts.
 * All templates must use the component hierarchy consistently.
 */

import React from 'react';
import { Dashboard, UserList, TaskBoard, EventCalendar } from '../organisms';
import { Button, Text, Card } from '../atoms';
import { User, Task, Event } from '../../core/data-models';

// Main Layout Template
interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  sidebar,
  header,
  footer,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      {header && (
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {header}
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          {sidebar && (
            <aside className="w-64 flex-shrink-0">
              {sidebar}
            </aside>
          )}

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
};

// Dashboard Page Template
interface DashboardPageProps {
  user: User;
  tasks: Task[];
  events: Event[];
  users: User[];
  loading?: boolean;
  error?: string;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onEventSelect?: (event: Event) => void;
  onUserSelect?: (user: User) => void;
  onLogout?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  tasks,
  events,
  users,
  loading,
  error,
  onTaskUpdate,
  onEventSelect,
  onUserSelect,
  onLogout
}) => {
  const header = (
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center">
        <Text variant="h2">Auth-Spine Dashboard</Text>
      </div>
      
      <div className="flex items-center space-x-4">
        <Text variant="body" color="secondary">
          {user.email}
        </Text>
        <Button variant="ghost" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </div>
  );

  const sidebar = (
    <div className="space-y-6">
      {/* Navigation */}
      <nav className="space-y-1">
        <Button variant="primary" className="w-full justify-start">
          Dashboard
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Users
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Tasks
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Calendar
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Settings
        </Button>
      </nav>

      {/* Quick Stats */}
      <Card className="p-4">
        <Text variant="h4" className="mb-3">Quick Stats</Text>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Text variant="body" color="secondary">Total Users</Text>
            <Text variant="body" weight="medium">{users.length}</Text>
          </div>
          <div className="flex justify-between">
            <Text variant="body" color="secondary">Active Tasks</Text>
            <Text variant="body" weight="medium">
              {tasks.filter(t => t.status !== 'completed').length}
            </Text>
          </div>
          <div className="flex justify-between">
            <Text variant="body" color="secondary">Today's Events</Text>
            <Text variant="body" weight="medium">
              {events.filter(e => {
                const today = new Date().toDateString();
                return new Date(e.startTime).toDateString() === today;
              }).length}
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );

  const footer = (
    <div className="text-center">
      <Text variant="body" color="secondary">
        © 2024 Auth-Spine. Built with the canonical app building system.
      </Text>
    </div>
  );

  return (
    <MainLayout header={header} sidebar={sidebar} footer={footer}>
      <Dashboard
        user={user}
        tasks={tasks}
        events={events}
        users={users}
        loading={loading}
        error={error}
        onTaskUpdate={onTaskUpdate}
        onEventSelect={onEventSelect}
        onUserSelect={onUserSelect}
      />
    </MainLayout>
  );
};

// Users Page Template
interface UsersPageProps {
  users: User[];
  loading?: boolean;
  error?: string;
  onUserSelect?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (user: User) => void;
  onUserCreate?: () => void;
  onRetry?: () => void;
  currentUser?: User;
  onLogout?: () => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({
  users,
  loading,
  error,
  onUserSelect,
  onUserEdit,
  onUserDelete,
  onUserCreate,
  onRetry,
  currentUser,
  onLogout
}) => {
  const header = (
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center">
        <Text variant="h2">User Management</Text>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button onClick={onUserCreate}>
          Create User
        </Button>
        <Text variant="body" color="secondary">
          {currentUser?.email}
        </Text>
        <Button variant="ghost" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </div>
  );

  const sidebar = (
    <div className="space-y-6">
      {/* Navigation */}
      <nav className="space-y-1">
        <Button variant="ghost" className="w-full justify-start">
          Dashboard
        </Button>
        <Button variant="primary" className="w-full justify-start">
          Users
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Tasks
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Calendar
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Settings
        </Button>
      </nav>

      {/* User Stats */}
      <Card className="p-4">
        <Text variant="h4" className="mb-3">User Statistics</Text>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Text variant="body" color="secondary">Total Users</Text>
            <Text variant="body" weight="medium">{users.length}</Text>
          </div>
          <div className="flex justify-between">
            <Text variant="body" color="secondary">Active</Text>
            <Text variant="body" weight="medium">
              {users.filter(u => u.status === 'active').length}
            </Text>
          </div>
          <div className="flex justify-between">
            <Text variant="body" color="secondary">Admins</Text>
            <Text variant="body" weight="medium">
              {users.filter(u => u.roles.includes('admin')).length}
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );

  const footer = (
    <div className="text-center">
      <Text variant="body" color="secondary">
        © 2024 Auth-Spine. Built with the canonical app building system.
      </Text>
    </div>
  );

  return (
    <MainLayout header={header} sidebar={sidebar} footer={footer}>
      <UserList
        users={users}
        loading={loading}
        error={error}
        onUserSelect={onUserSelect}
        onUserEdit={onUserEdit}
        onUserDelete={onUserDelete}
        onRetry={onRetry}
      />
    </MainLayout>
  );
};

// Tasks Page Template
interface TasksPageProps {
  tasks: Task[];
  users: User[];
  loading?: boolean;
  error?: string;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskCreate?: () => void;
  onRetry?: () => void;
  currentUser?: User;
  onLogout?: () => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  users,
  loading,
  error,
  onTaskUpdate,
  onTaskDelete,
  onTaskCreate,
  onRetry,
  currentUser,
  onLogout
}) => {
  const header = (
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center">
        <Text variant="h2">Task Management</Text>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button onClick={onTaskCreate}>
          Create Task
        </Button>
        <Text variant="body" color="secondary">
          {currentUser?.email}
        </Text>
        <Button variant="ghost" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </div>
  );

  const sidebar = (
    <div className="space-y-6">
      {/* Navigation */}
      <nav className="space-y-1">
        <Button variant="ghost" className="w-full justify-start">
          Dashboard
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Users
        </Button>
        <Button variant="primary" className="w-full justify-start">
          Tasks
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Calendar
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Settings
        </Button>
      </nav>

      {/* Task Stats */}
      <Card className="p-4">
        <Text variant="h4" className="mb-3">Task Statistics</Text>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Text variant="body" color="secondary">Total Tasks</Text>
            <Text variant="body" weight="medium">{tasks.length}</Text>
          </div>
          <div className="flex justify-between">
            <Text variant="body" color="secondary">Pending</Text>
            <Text variant="body" weight="medium">
              {tasks.filter(t => t.status === 'pending').length}
            </Text>
          </div>
          <div className="flex justify-between">
            <Text variant="body" color="secondary">In Progress</Text>
            <Text variant="body" weight="medium">
              {tasks.filter(t => t.status === 'in_progress').length}
            </Text>
          </div>
          <div className="flex justify-between">
            <Text variant="body" color="secondary">Completed</Text>
            <Text variant="body" weight="medium">
              {tasks.filter(t => t.status === 'completed').length}
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );

  const footer = (
    <div className="text-center">
      <Text variant="body" color="secondary">
        © 2024 Auth-Spine. Built with the canonical app building system.
      </Text>
    </div>
  );

  return (
    <MainLayout header={header} sidebar={sidebar} footer={footer}>
      <TaskBoard
        tasks={tasks}
        users={users}
        loading={loading}
        error={error}
        onTaskUpdate={onTaskUpdate}
        onTaskDelete={onTaskDelete}
        onRetry={onRetry}
      />
    </MainLayout>
  );
};

// Calendar Page Template
interface CalendarPageProps {
  events: Event[];
  users: User[];
  loading?: boolean;
  error?: string;
  onEventSelect?: (event: Event) => void;
  onEventEdit?: (event: Event) => void;
  onEventDelete?: (eventId: string) => void;
  onEventCreate?: () => void;
  onRetry?: () => void;
  currentUser?: User;
  onLogout?: () => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  events,
  users,
  loading,
  error,
  onEventSelect,
  onEventEdit,
  onEventDelete,
  onEventCreate,
  onRetry,
  currentUser,
  onLogout
}) => {
  const header = (
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center">
        <Text variant="h2">Calendar</Text>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button onClick={onEventCreate}>
          Create Event
        </Button>
        <Text variant="body" color="secondary">
          {currentUser?.email}
        </Text>
        <Button variant="ghost" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </div>
  );

  const sidebar = (
    <div className="space-y-6">
      {/* Navigation */}
      <nav className="space-y-1">
        <Button variant="ghost" className="w-full justify-start">
          Dashboard
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Users
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Tasks
        </Button>
        <Button variant="primary" className="w-full justify-start">
          Calendar
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Settings
        </Button>
      </nav>

      {/* Calendar Stats */}
      <Card className="p-4">
        <Text variant="h4" className="mb-3">Event Statistics</Text>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Text variant="body" color="secondary">Total Events</Text>
            <Text variant="body" weight="medium">{events.length}</Text>
          </div>
          <div className="flex justify-between">
            <Text variant="body" color="secondary">This Week</Text>
            <Text variant="body" weight="medium">
              {events.filter(e => {
                const now = new Date();
                const eventDate = new Date(e.startTime);
                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return eventDate >= now && eventDate <= weekFromNow;
              }).length}
            </Text>
          </div>
          <div className="flex justify-between">
            <Text variant="body" color="secondary">My Events</Text>
            <Text variant="body" weight="medium">
              {events.filter(e => e.attendees.includes(currentUser?.id || '')).length}
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );

  const footer = (
    <div className="text-center">
      <Text variant="body" color="secondary">
        © 2024 Auth-Spine. Built with the canonical app building system.
      </Text>
    </div>
  );

  return (
    <MainLayout header={header} sidebar={sidebar} footer={footer}>
      <EventCalendar
        events={events}
        users={users}
        loading={loading}
        error={error}
        onEventSelect={onEventSelect}
        onEventEdit={onEventEdit}
        onEventDelete={onEventDelete}
        onRetry={onRetry}
      />
    </MainLayout>
  );
};

// Auth Page Template (for login/register)
interface AuthPageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footerText?: string;
  footerLink?: {
    text: string;
    href: string;
  };
}

export const AuthPage: React.FC<AuthPageProps> = ({
  title,
  subtitle,
  children,
  footerText,
  footerLink
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Text variant="h2" className="mb-2">
            Auth-Spine
          </Text>
          <Text variant="body" color="secondary">
            Secure authentication infrastructure
          </Text>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4">
          <div className="text-center mb-6">
            <Text variant="h3">{title}</Text>
            {subtitle && (
              <Text variant="body" color="secondary" className="mt-2">
                {subtitle}
              </Text>
            )}
          </div>
          
          {children}
          
          {footerText && footerLink && (
            <div className="mt-6 text-center">
              <Text variant="body" color="secondary">
                {footerText}{' '}
                <a 
                  href={footerLink.href}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  {footerLink.text}
                </a>
              </Text>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
