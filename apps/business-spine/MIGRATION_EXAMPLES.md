# Migration Examples: Converting Pages to New Architecture

This document provides step-by-step examples of converting existing pages to use the new single-source-of-truth architecture.

## Example 1: Admin Users Page (Complete)

### Before (Isolated State)

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter })
      });
      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
        <option value="">All Roles</option>
      </select>
      <button onClick={() => setShowModal(true)}>Add User</button>
      {/* ... table rendering ... */}
      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </div>
  );
}
```

### After (Global State)

```typescript
'use client';

import { useAppContext } from '@/src/providers/AppContext';
import { usePageState } from '@/src/hooks/usePageState';
import { useState } from 'react';

export default function UsersPage() {
  const { ui, setFilter, addNotification } = useAppContext();
  const [localPage, setLocalPage] = useState(1);

  // Read filters from global store
  const search = (ui.filters.userSearch as string) || '';
  const roleFilter = (ui.filters.userRole as string) || '';

  // Use centralized data fetching
  const { data: usersData, loading, refetch } = usePageState(
    async () => {
      const params = new URLSearchParams({
        page: localPage.toString(),
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter })
      });
      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    [search, roleFilter, localPage]
  );

  const users = usersData?.users || [];

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete user');
      addNotification('User deleted successfully', 'success');
      refetch();
    } catch (error) {
      addNotification(
        error instanceof Error ? error.message : 'Failed to delete user',
        'error'
      );
    }
  };

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setFilter('userSearch', e.target.value)}
        placeholder="Search..."
      />
      <select
        value={roleFilter}
        onChange={(e) => setFilter('userRole', e.target.value)}
      >
        <option value="">All Roles</option>
      </select>
      <button onClick={() => ui.setActiveModal('createUser')}>Add User</button>
      {/* ... table rendering ... */}
      {/* Modal is now global, rendered in Shell */}
    </div>
  );
}
```

### Key Changes

1. **Filters** - Moved from `useState` to `ui.filters` in global store
2. **Modal** - Changed from `setShowModal(true)` to `ui.setActiveModal('createUser')`
3. **Notifications** - Changed from `console.error` to `addNotification()`
4. **Data Fetching** - Wrapped in `usePageState()` hook
5. **Pagination** - Kept as local state (page-specific)

---

## Example 2: Dashboard Page

### Before

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const response = await fetch('/api/dashboard/stats');
    setStats(await response.json());
    setLoading(false);
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Toggle Theme
      </button>
      <button onClick={() => setSidebarOpen(!sidebarOpen)}>
        Toggle Sidebar
      </button>
      {/* ... dashboard content ... */}
    </div>
  );
}
```

### After

```typescript
'use client';

import { useAppContext } from '@/src/providers/AppContext';
import { usePageState } from '@/src/hooks/usePageState';

export default function Dashboard() {
  const { ui, setTheme, setSidebarOpen } = useAppContext();

  // Data fetching is page-specific
  const { data: stats, loading } = usePageState(
    async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    []
  );

  return (
    <div>
      <button onClick={() => setTheme(ui.theme === 'dark' ? 'light' : 'dark')}>
        Toggle Theme
      </button>
      <button onClick={() => setSidebarOpen(!ui.sidebarOpen)}>
        Toggle Sidebar
      </button>
      {/* ... dashboard content ... */}
    </div>
  );
}
```

### Key Changes

1. **Theme** - Now controlled globally via `setTheme()`
2. **Sidebar** - Now controlled globally via `setSidebarOpen()`
3. **Data Fetching** - Still page-specific, but uses `usePageState()`
4. **No Local State for UI Chrome** - Theme and sidebar are global

---

## Example 3: Kill Switches Page

### Before

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function KillSwitchesPage() {
  const [switches, setSwitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSwitch, setSelectedSwitch] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  useEffect(() => {
    fetchKillSwitches();
  }, []);

  const fetchKillSwitches = async () => {
    const response = await fetch('/api/admin/kill-switches');
    setSwitches(await response.json());
    setLoading(false);
  };

  const handleSwitchAction = async (switchItem, action) => {
    setActionModal({ switch: switchItem, action });
  };

  const executeSwitchAction = async (reason) => {
    try {
      const response = await fetch('/api/admin/kill-switches', {
        method: 'POST',
        body: JSON.stringify({
          switchId: actionModal.switch.id,
          action: actionModal.action,
          reason
        })
      });
      const result = await response.json();
      setSwitches(result.data.switches);
      setActionModal(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {/* ... switches list ... */}
      {actionModal && (
        <Modal
          onConfirm={executeSwitchAction}
          onClose={() => setActionModal(null)}
        />
      )}
    </div>
  );
}
```

### After

```typescript
'use client';

import { useAppContext } from '@/src/providers/AppContext';
import { usePageState } from '@/src/hooks/usePageState';
import { useState } from 'react';

export default function KillSwitchesPage() {
  const { addNotification } = useAppContext();
  const [actionData, setActionData] = useState(null);

  const { data: switchesData, loading, refetch } = usePageState(
    async () => {
      const response = await fetch('/api/admin/kill-switches');
      if (!response.ok) throw new Error('Failed to fetch kill switches');
      return response.json();
    },
    []
  );

  const switches = switchesData?.data?.switches || [];

  const handleSwitchAction = (switchItem, action) => {
    setActionData({ switch: switchItem, action });
  };

  const executeSwitchAction = async (reason) => {
    if (!actionData) return;

    try {
      const response = await fetch('/api/admin/kill-switches', {
        method: 'POST',
        body: JSON.stringify({
          switchId: actionData.switch.id,
          action: actionData.action,
          reason
        })
      });

      if (!response.ok) throw new Error('Failed to update kill switch');

      const result = await response.json();
      addNotification('Kill switch updated successfully', 'success');
      setActionData(null);
      refetch();
    } catch (error) {
      addNotification(
        error instanceof Error ? error.message : 'Failed to update kill switch',
        'error'
      );
    }
  };

  return (
    <div>
      {/* ... switches list ... */}
      {actionData && (
        <Modal
          onConfirm={executeSwitchAction}
          onClose={() => setActionData(null)}
        />
      )}
    </div>
  );
}
```

### Key Changes

1. **Data Fetching** - Wrapped in `usePageState()`
2. **Notifications** - Changed from `console.error` to `addNotification()`
3. **Local Modal State** - Kept as local state (page-specific interaction)
4. **Refetch** - Called after successful action

---

## Pattern Summary

### Always Move to Global Store
- Theme (light/dark/system)
- Sidebar open/closed
- Mobile nav open/closed
- Global modals
- Global filters (if shared across pages)

### Always Keep as Local State
- Form input values
- Pagination (page number)
- Local dropdowns/accordions
- Page-specific interaction state

### Always Use usePageState
- Data fetching
- Loading states
- Error handling
- Refetch logic

### Never Do
- Duplicate state across pages
- Use `console.error` for user-facing errors
- Decide layout in React (use CSS)
- Component-to-component communication
- Multiple sources of truth for same data

---

## Testing Migration

After migrating a page, test:

1. **Global State Persistence**
   - Change theme → verify it persists across page navigation
   - Open sidebar → navigate to another page → verify it's still open

2. **Data Fetching**
   - Apply filters → data should refetch
   - Errors should show as notifications
   - Loading state should work

3. **Responsive Layout**
   - Resize browser → layout should change via CSS
   - No React re-renders for layout changes
   - Mobile nav should work on small screens

4. **Notifications**
   - Actions should trigger notifications
   - Notifications should auto-dismiss
   - Multiple notifications should stack

---

## Common Mistakes to Avoid

❌ **Wrong**: Storing page content in global state
```typescript
const { ui, setUsers } = useAppContext();
setUsers(data); // DON'T DO THIS
```

✅ **Right**: Storing page content in component/page state
```typescript
const { data: users } = usePageState(fetchFn, deps);
```

---

❌ **Wrong**: Deciding layout in React
```typescript
const isMobile = window.innerWidth < 768;
return isMobile ? <MobileLayout /> : <DesktopLayout />;
```

✅ **Right**: Using CSS for layout
```typescript
<div className="hidden md:flex">Desktop</div>
<div className="md:hidden">Mobile</div>
```

---

❌ **Wrong**: Multiple sources of truth
```typescript
const [theme, setTheme] = useState('light');
const { ui } = useAppContext();
// Now theme is in two places!
```

✅ **Right**: Single source of truth
```typescript
const { ui, setTheme } = useAppContext();
// Theme only in global store
```
