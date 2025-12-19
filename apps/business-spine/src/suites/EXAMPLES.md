# Suite Organization - Usage Examples

Examples of how to use the organized suite structure in Auth-Spine.

## Importing from Suites

### 1. Import Specific Components
```typescript
// Import from specific suites
import { SmoothButton, LoadingSpinner } from '@/suites/ui';
import { useAppContext, usePageState } from '@/suites/core';
import { Sidebar, MobileNav } from '@/suites/navigation';
import { formatDate, debounce } from '@/suites/shared';
import { UITroubleshootKit } from '@/suites/tools';
```

### 2. Import Entire Suites
```typescript
// Import entire suites
import * as UI from '@/suites/ui';
import * as Core from '@/suites/core';
import * as Navigation from '@/suites/navigation';
import * as Shared from '@/suites/shared';

// Usage
const MyComponent = () => {
  return (
    <UI.SmoothButton>
      <UI.LoadingSpinner size="sm" />
      Click Me
    </UI.SmoothButton>
  );
};
```

### 3. Import from Main Suite Index
```typescript
// Import commonly used items from main index
import {
  SmoothButton,
  LoadingSpinner,
  useAppContext,
  usePageState,
  formatDate,
  ROUTES,
} from '@/suites';
```

## Component Examples

### 1. Using UI Components
```typescript
import { SmoothButton, SmoothInput, CupertinoBlankState } from '@/suites/ui';
import { useAppContext } from '@/suites/core';

export default function UserForm() {
  const { addNotification } = useAppContext();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Submit form
      addNotification('User created successfully', 'success');
    } catch (error) {
      addNotification('Failed to create user', 'error');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <SmoothInput
        label="Name"
        placeholder="Enter user name"
        required
      />
      <SmoothButton type="submit" variant="primary">
        Create User
      </SmoothButton>
    </form>
  );
}
```

### 2. Using Core Hooks
```typescript
import { usePageState, useMediaQuery } from '@/suites/core';
import { LoadingSpinner } from '@/suites/ui';

export default function UserList() {
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const { data, loading, error } = usePageState(
    async () => {
      const response = await fetch('/api/users');
      return response.json();
    },
    []
  );
  
  if (loading) return <LoadingSpinner text="Loading users..." />;
  if (error) return <div>Failed to load users</div>;
  
  return (
    <div className={isDesktop ? 'grid grid-cols-3' : 'space-y-4'}>
      {data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### 3. Using Navigation Components
```typescript
import { Sidebar, MobileNav, Notifications } from '@/suites/navigation';
import { Shell } from '@/suites/core';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      <Sidebar />
      <MobileNav />
      <main>{children}</main>
      <Notifications />
    </Shell>
  );
}
```

### 4. Using Shared Utilities
```typescript
import { formatDate, formatCurrency, debounce, clsx } from '@/suites/shared';
import { useState, useEffect } from 'react';

export default function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  
  // Debounced search
  const debouncedSearch = debounce(async (term: string) => {
    if (!term) return setResults([]);
    
    const response = await fetch(`/api/search?q=${term}`);
    const data = await response.json();
    setResults(data);
  }, 300);
  
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);
  
  return (
    <div className={clsx(
      'p-4 rounded-lg',
      'bg-white dark:bg-slate-800',
      searchTerm && 'ring-2 ring-blue-500'
    )}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
        className="w-full px-4 py-2 border rounded-lg"
      />
      {results.map(item => (
        <div key={item.id}>
          <div>{item.name}</div>
          <div>{formatDate(item.createdAt)}</div>
          <div>{formatCurrency(item.price)}</div>
        </div>
      ))}
    </div>
  );
}
```

## Page Examples

### 1. Admin Dashboard Page
```typescript
import { 
  useAppContext, 
  usePageState, 
  ROUTES 
} from '@/suites/core';
import { 
  SmoothButton, 
  LoadingSpinner, 
  CupertinoBlankState 
} from '@/suites/ui';
import { formatDate } from '@/suites/shared';

export default function AdminDashboard() {
  const { ui, addNotification } = useAppContext();
  const { data, loading, refetch } = usePageState(
    async () => {
      const response = await fetch('/api/admin/dashboard');
      return response.json();
    },
    []
  );
  
  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (!data) return <CupertinoBlankState title="No data available" />;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
          <h3 className="font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{data.totalUsers}</p>
        </div>
        
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
          <h3 className="font-semibold mb-2">Revenue</h3>
          <p className="text-3xl font-bold">{formatCurrency(data.revenue)}</p>
        </div>
        
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
          <h3 className="font-semibold mb-2">Last Updated</h3>
          <p className="text-sm">{formatDate(data.lastUpdated)}</p>
        </div>
      </div>
      
      <div className="mt-6">
        <SmoothButton onClick={refetch}>
          Refresh Data
        </SmoothButton>
      </div>
    </div>
  );
}
```

### 2. Settings Page
```typescript
import { useAppContext } from '@/suites/core';
import { SmoothButton, SmoothInput } from '@/suites/ui';
import { useState } from 'react';

export default function SettingsPage() {
  const { ui, addNotification } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    theme: ui.theme
  });
  
  const handleSave = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        addNotification('Settings saved successfully', 'success');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      addNotification('Failed to save settings', 'error');
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        <SmoothInput
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />
        
        <SmoothInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
        
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <select
            value={formData.theme}
            onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        
        <SmoothButton onClick={handleSave}>
          Save Settings
        </SmoothButton>
      </div>
    </div>
  );
}
```

## Hook Examples

### 1. Custom Hook Using Suites
```typescript
import { useAppContext } from '@/suites/core';
import { useState, useEffect } from 'react';
import { debounce } from '@/suites/shared';

export function useSearch<T>(
  searchFn: (term: string) => Promise<T[]>,
  delay = 300
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useAppContext();
  
  const debouncedSearch = debounce(async (term: string) => {
    if (!term) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const data = await searchFn(term);
      setResults(data);
    } catch (error) {
      addNotification('Search failed', 'error');
    } finally {
      setLoading(false);
    }
  }, delay);
  
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);
  
  return {
    searchTerm,
    setSearchTerm,
    results,
    loading
  };
}
```

### 2. Using the Custom Hook
```typescript
import { useSearch } from '@/hooks/useSearch';
import { LoadingSpinner, CupertinoBlankState } from '@/suites/ui';

export default function UserSearch() {
  const { searchTerm, setSearchTerm, results, loading } = useSearch(
    async (term: string) => {
      const response = await fetch(`/api/users/search?q=${term}`);
      return response.json();
    }
  );
  
  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users..."
        className="w-full px-4 py-2 border rounded-lg"
      />
      
      {loading && <LoadingSpinner />}
      
      {!loading && results.length === 0 && searchTerm && (
        <CupertinoBlankState title="No users found" />
      )}
      
      {results.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

## Best Practices

### 1. Import Organization
```typescript
// 1. React and external libraries
import React, { useState } from 'react';

// 2. Suites (in logical order)
import { useAppContext, usePageState } from '@/suites/core';
import { SmoothButton, LoadingSpinner } from '@/suites/ui';
import { formatDate, debounce } from '@/suites/shared';

// 3. Local imports
import { localUtility } from './utils';
```

### 2. Component Structure
```typescript
import { useAppContext } from '@/suites/core';
import { SmoothButton, SmoothInput } from '@/suites/ui';
import { formatDate } from '@/suites/shared';

export default function MyComponent() {
  // 1. Hooks
  const { addNotification } = useAppContext();
  
  // 2. State
  const [loading, setLoading] = useState(false);
  
  // 3. Handlers
  const handleClick = async () => {
    setLoading(true);
    // ... logic
    addNotification('Success!', 'success');
    setLoading(false);
  };
  
  // 4. Render
  return (
    <div>
      <SmoothInput label="Name" />
      <SmoothButton 
        onClick={handleClick}
        isLoading={loading}
      >
        Submit
      </SmoothButton>
    </div>
  );
}
```

### 3. Type Safety
```typescript
import type { 
  SmoothButtonProps, 
  ApiResponse 
} from '@/suites';

interface UserListProps {
  onUserSelect: (user: User) => void;
}

export default function UserList({ onUserSelect }: UserListProps) {
  // ... implementation
}
```

## Migration Guide

### From Old Structure
```typescript
// Before
import { useAppContext } from '@/src/providers/AppContext';
import { SmoothButton } from '@/src/components/SmoothButton';
import { formatDate } from '@/src/utils/format';

// After
import { useAppContext, SmoothButton, formatDate } from '@/suites';
```

### Gradual Migration
1. Update imports to use suite paths
2. Group related functionality
3. Create custom hooks using suite utilities
4. Update component exports to use suite index

This suite organization provides a clean, scalable structure that makes the codebase more maintainable and easier to navigate.
