# Quick Start: Using the New Architecture

Fast reference for developers implementing the new single-source-of-truth architecture.

## 5-Minute Setup

### 1. Wrap Your App (Already Done)
```typescript
// app/layout.tsx
import { AppProvider } from '@/src/providers/AppContext';
import Shell from '@/src/components/Shell';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
```

### 2. Use Global State in Your Page
```typescript
'use client';

import { useAppContext } from '@/src/providers/AppContext';
import { usePageState } from '@/src/hooks/usePageState';

export default function MyPage() {
  const { ui, setFilter, addNotification } = useAppContext();
  
  // Data fetching
  const { data, loading, refetch } = usePageState(
    async () => {
      const response = await fetch('/api/my-data');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    [] // dependencies
  );

  // Use global filters
  const search = (ui.filters.mySearch as string) || '';

  // Update filter
  const handleSearch = (value) => {
    setFilter('mySearch', value);
  };

  // Show notification
  const handleAction = async () => {
    try {
      // ... do something
      addNotification('Success!', 'success');
    } catch (error) {
      addNotification('Error!', 'error');
    }
  };

  return (
    <div>
      <input value={search} onChange={(e) => handleSearch(e.target.value)} />
      {loading ? <Spinner /> : <Content data={data} />}
    </div>
  );
}
```

## Common Patterns

### Pattern 1: Search + Filter + Pagination
```typescript
const { ui, setFilter } = useAppContext();
const [page, setPage] = useState(1);

const search = (ui.filters.userSearch as string) || '';
const role = (ui.filters.userRole as string) || '';

const { data, loading, refetch } = usePageState(
  async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      ...(search && { search }),
      ...(role && { role })
    });
    const response = await fetch(`/api/users?${params}`);
    return response.json();
  },
  [search, role, page]
);
```

### Pattern 2: Form with Submission
```typescript
const { addNotification } = useAppContext();
const [formData, setFormData] = useState({ name: '', email: '' });

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    if (!response.ok) throw new Error('Failed to create user');
    addNotification('User created successfully', 'success');
    setFormData({ name: '', email: '' });
  } catch (error) {
    addNotification(error.message, 'error');
  }
};
```

### Pattern 3: Delete with Confirmation
```typescript
const { addNotification } = useAppContext();
const { refetch } = usePageState(...);

const handleDelete = async (id) => {
  if (!confirm('Are you sure?')) return;
  
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete');
    addNotification('Deleted successfully', 'success');
    refetch();
  } catch (error) {
    addNotification(error.message, 'error');
  }
};
```

### Pattern 4: Global Modal
```typescript
const { ui } = useAppContext();

// Open modal
<button onClick={() => ui.setActiveModal('createUser')}>
  Add User
</button>

// Render modal (in Shell or page)
{ui.activeModal === 'createUser' && (
  <Modal onClose={() => ui.setActiveModal(null)} />
)}
```

### Pattern 5: Responsive Behavior
```typescript
import { useMediaQuery } from '@/src/hooks/useMediaQuery';

const isDesktop = useMediaQuery({ minWidth: 768 });

return (
  <div>
    {isDesktop ? (
      <DesktopLayout />
    ) : (
      <MobileLayout />
    )}
  </div>
);
```

## API Reference

### useAppContext()
```typescript
const {
  ui,                    // Current UI state
  setTheme,              // (theme: 'light' | 'dark' | 'system') => void
  setSidebarOpen,        // (open: boolean) => void
  setMobileNavOpen,      // (open: boolean) => void
  setActiveModal,        // (modal: ModalType | null) => void
  setFilter,             // (key: string, value: any) => void
  clearFilters,          // () => void
  addNotification,       // (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
  removeNotification     // (id: string) => void
} = useAppContext();
```

### usePageState()
```typescript
const {
  data,      // T | null - fetched data
  loading,   // boolean - is loading
  error,     // Error | null - error if any
  refetch    // () => Promise<void> - manual refetch
} = usePageState(
  fetchFn,   // async () => T
  deps       // any[] - dependencies
);
```

### useMediaQuery()
```typescript
const isDesktop = useMediaQuery({ minWidth: 768 });
const isMobile = useMediaQuery({ maxWidth: 767 });
```

## Global State Structure

```typescript
interface AppUIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  activeModal: ModalType;
  filters: Record<string, string | boolean>;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>;
}
```

## Routing Constants

```typescript
import { ROUTES, NAVIGATION_ITEMS } from '@/src/lib/routes';

// Use in links
<Link href={ROUTES.ADMIN_USERS}>Users</Link>

// Check active route
import { usePathname } from 'next/navigation';
const pathname = usePathname();
const isActive = pathname === ROUTES.DASHBOARD;
```

## Component Structure

```
app/
├── layout.tsx                    # Root layout with providers
├── page.tsx                      # Home page
├── admin/
│   ├── users/
│   │   └── page.tsx             # Users page
│   ├── kill-switches/
│   │   └── page.tsx             # Kill switches page
│   └── ...
└── dashboard/
    └── page.tsx                 # Dashboard page

src/
├── providers/
│   └── AppContext.tsx           # Global state provider
├── components/
│   ├── Shell.tsx                # Root layout shell
│   ├── Notifications.tsx        # Global notifications
│   └── navigation/
│       ├── Sidebar.tsx          # Desktop nav
│       └── MobileNav.tsx        # Mobile nav
├── hooks/
│   ├── usePageState.ts          # Data fetching hook
│   └── useMediaQuery.ts         # Media query hook
└── lib/
    └── routes.ts                # Routing constants
```

## Checklist for New Pages

- [ ] Import `useAppContext` and `usePageState`
- [ ] Use `usePageState` for data fetching
- [ ] Use `ui.filters` for filters (not local state)
- [ ] Use `addNotification()` for errors/success
- [ ] Use `ui.setActiveModal()` for modals (not local state)
- [ ] Use CSS for responsive layout (not React)
- [ ] No `useState` for theme/sidebar/modals
- [ ] No direct component imports from other pages
- [ ] All navigation uses `ROUTES` constants
- [ ] Dark mode classes added (dark:)

## Debugging

### Check Global State
```typescript
const { ui } = useAppContext();
console.log('Current UI state:', ui);
```

### Check Data Fetching
```typescript
const { data, loading, error } = usePageState(...);
console.log('Data:', data);
console.log('Loading:', loading);
console.log('Error:', error);
```

### Check Route
```typescript
import { usePathname } from 'next/navigation';
const pathname = usePathname();
console.log('Current route:', pathname);
```

### Verify No Duplication
```typescript
// Should only appear once in console
const { ui, setTheme } = useAppContext();
setTheme('dark');
// Only one console.log should appear
```

## Performance Tips

1. **Memoize callbacks** in pages to prevent unnecessary re-renders
```typescript
const handleSearch = useCallback((value) => {
  setFilter('search', value);
}, [setFilter]);
```

2. **Use `refetch` instead of re-fetching manually**
```typescript
// Good
const { refetch } = usePageState(...);
refetch();

// Bad
const [data, setData] = useState(null);
const fetchData = async () => { ... };
```

3. **Keep filters in global store only**
```typescript
// Good
const search = ui.filters.search;

// Bad
const [search, setSearch] = useState('');
```

4. **Use CSS for layout, not React**
```typescript
// Good
<div className="hidden md:flex">Desktop</div>

// Bad
const isMobile = window.innerWidth < 768;
{isMobile ? <Mobile /> : <Desktop />}
```

## Common Issues

### Issue: Filters not persisting
**Solution**: Make sure you're using `setFilter()` from `useAppContext()`, not local `useState`.

### Issue: Notifications not showing
**Solution**: Make sure you're calling `addNotification()` from `useAppContext()`, not using `console.error()`.

### Issue: Modal not appearing
**Solution**: Make sure you're using `ui.setActiveModal()` from `useAppContext()`, not local `useState`.

### Issue: Layout not responsive
**Solution**: Use CSS classes (`hidden md:flex`), not React branching (`isMobile ? ... : ...`).

### Issue: State duplicated across pages
**Solution**: Move to global store via `useAppContext()` if it's UI chrome (theme, nav, modals).

## Next Steps

1. Migrate remaining pages to use `useAppContext()` and `usePageState()`
2. Add auth context to AppProvider
3. Implement persistent state (localStorage)
4. Add Zustand for better performance (optional)
5. Create reusable modal components
6. Add form validation/state management

See `MIGRATION_EXAMPLES.md` for detailed examples.
