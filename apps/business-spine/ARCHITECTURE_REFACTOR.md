# Auth-Spine Architecture Refactor: Single Source of Truth

## Overview

This document outlines the complete architectural refactoring of Auth-Spine to implement a **single source of truth** pattern, eliminating UI conflicts and state duplication.

## Problem Statement (Before Refactor)

The original codebase suffered from:

1. **No Global State Management** - Each page had isolated `useState` hooks
2. **Duplicate State** - Same data tracked in multiple places (route, local state, filters)
3. **Layout Logic in Components** - React deciding mobile vs desktop instead of CSS
4. **No Centralized Navigation** - Each page implemented its own routing logic
5. **Component Coupling** - Pages couldn't communicate; no shared notifications or modals
6. **Responsive Design Chaos** - No consistent mobile/desktop handling

**Result**: UI fighting itself, state drift, inconsistent behavior across pages.

## Solution Architecture

### 1. Global State Management (AppProvider)

**File**: `src/providers/AppContext.tsx`

Single source of truth for all app-level UI state:

```typescript
interface AppUIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  activeModal: ModalType;
  filters: Record<string, string | boolean>;
  notifications: Array<{ id, message, type }>;
}
```

**Key Principle**: Route is the truth for page content. Global store is only for UI chrome (theme, nav, modals, filters).

**Usage**:
```typescript
const { ui, setTheme, setSidebarOpen, setFilter, addNotification } = useAppContext();
```

### 2. Routing as Source of Truth

**File**: `src/lib/routes.ts`

Centralized routing constants and navigation metadata:

```typescript
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ADMIN_USERS: '/admin/users',
  // ... all routes
};

export const NAVIGATION_ITEMS = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
  // ... navigation structure
];
```

**Key Principle**: Route URL is the single source of truth for which page is active. Never duplicate this in state.

### 3. Responsive Layout (CSS-First)

**File**: `src/components/Shell.tsx`

Tailwind handles all layout decisions:

```tsx
<div className="flex h-screen">
  {/* Desktop Sidebar - hidden on mobile */}
  <aside className="hidden md:flex md:w-64">
    <Sidebar />
  </aside>

  {/* Mobile Navigation - visible only on mobile */}
  <div className="md:hidden fixed top-0 left-0 right-0">
    <MobileNav />
  </div>

  {/* Main Content */}
  <main className="flex-1 overflow-auto">
    {children}
  </main>
</div>
```

**Key Principle**: CSS (Tailwind) decides layout. React only decides interaction behavior (drawer open/close).

### 4. Page Data Fetching Hook

**File**: `src/hooks/usePageState.ts`

Standardized data fetching with global notification integration:

```typescript
const { data, loading, error, refetch } = usePageState(
  async () => {
    const response = await fetch(`/api/admin/users?${params}`);
    return response.json();
  },
  [search, roleFilter, page] // Dependencies trigger refetch
);
```

**Key Principle**: Pages fetch their own data, but errors/success notifications go to global store.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│ app/layout.tsx (Root Layout)                                │
│ - AppProvider (global state)                                │
│ - Shell (responsive layout)                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Shell Component                                             │
│ - Desktop Sidebar (hidden md:flex)                          │
│ - Mobile Nav (md:hidden)                                    │
│ - Main Content Area                                         │
│ - Notifications (global)                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Pages (app/admin/users, app/dashboard, etc.)               │
│ - Use useAppContext() for global state                      │
│ - Use usePageState() for data fetching                      │
│ - CSS handles responsive layout                             │
│ - No local useState for UI chrome                           │
└─────────────────────────────────────────────────────────────┘
```

## State Ownership Rules

### Route-Owned State
- Current page/path
- Page-specific content (users list, dashboard data)
- **Never duplicate in global store**

### Global Store-Owned State
- Theme (light/dark/system)
- Sidebar open/closed
- Mobile nav open/closed
- Active modal
- Global filters (if shared across pages)
- Notifications

### Local Component-Owned State
- Form input values (before submission)
- Dropdown open/closed (local to component)
- Pagination (local to page)
- **Never communicate between components**

## Migration Guide

### For Existing Pages

**Before** (isolated state):
```typescript
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState('');
const [showModal, setShowModal] = useState(false);

useEffect(() => {
  fetchUsers();
}, [search]);
```

**After** (global state):
```typescript
const { ui, setFilter, addNotification } = useAppContext();
const [localPage, setLocalPage] = useState(1);

const search = (ui.filters.userSearch as string) || '';
const { data: usersData, loading, refetch } = usePageState(
  async () => {
    const response = await fetch(`/api/admin/users?search=${search}`);
    return response.json();
  },
  [search]
);

// Use global modal
onClick={() => ui.setActiveModal('createUser')}
```

### Key Changes

1. **Filters** → Move to `ui.filters` in global store
2. **Modals** → Use `ui.activeModal` from global store
3. **Notifications** → Call `addNotification()` instead of console.error
4. **Data Fetching** → Use `usePageState()` hook
5. **Responsive** → Let CSS handle it, remove `isMobile` checks

## Component Structure

### Navigation Components

**Sidebar** (`src/components/navigation/Sidebar.tsx`)
- Reads current route via `usePathname()`
- Reads expanded state from local component state
- Renders navigation items from `NAVIGATION_ITEMS`
- Highlights active route

**MobileNav** (`src/components/navigation/MobileNav.tsx`)
- Hamburger menu button
- Dropdown menu (controlled by `ui.mobileNavOpen`)
- Closes on navigation

### Notifications

**Notifications** (`src/components/Notifications.tsx`)
- Reads from `ui.notifications`
- Auto-dismisses after 5 seconds
- Shows success/error/info/warning types
- Positioned fixed bottom-right

## Responsive Design Pattern

### CSS Handles Layout
```tsx
<div className="flex h-screen">
  <aside className="hidden md:flex md:w-64">Desktop Sidebar</aside>
  <div className="md:hidden">Mobile Nav</div>
  <main className="flex-1">Content</main>
</div>
```

### React Handles Behavior
```tsx
const isDesktop = useMediaQuery({ minWidth: 768 });

{isDesktop ? <Sidebar /> : <BottomSheet />}
```

**Rule**: Use CSS for layout existence. Use React only for behavior differences.

## Benefits

✅ **Single Source of Truth** - No state drift
✅ **Consistent Navigation** - All pages use same routing
✅ **Global Notifications** - Errors/success visible everywhere
✅ **Responsive by Default** - CSS-first approach
✅ **Testable** - Global state is predictable
✅ **Scalable** - Easy to add new pages/features
✅ **No Component Coupling** - Pages don't reach into each other

## Testing the Architecture

### Test 1: Navigate Between Pages
- Sidebar/mobile nav should highlight correct page
- Global state should persist
- Notifications should appear on actions

### Test 2: Responsive Behavior
- Mobile: sidebar hidden, mobile nav visible
- Desktop: sidebar visible, mobile nav hidden
- No React re-renders for layout changes

### Test 3: Global State
- Change theme → affects all pages
- Open modal → visible everywhere
- Add notification → appears in fixed position

### Test 4: Data Fetching
- Filters update → data refetches
- Errors show as notifications
- Loading state works correctly

## Future Enhancements

1. **Auth Context** - Add user/auth state to AppProvider
2. **Zustand/Redux** - Replace Context with Zustand for performance
3. **Persisted State** - Save theme/sidebar preference to localStorage
4. **Modals** - Create reusable modal system
5. **Form State** - Add form validation/state management
6. **Real-time Updates** - WebSocket integration with global state

## Files Created/Modified

### New Files
- `src/providers/AppContext.tsx` - Global state provider
- `src/lib/routes.ts` - Routing constants
- `src/components/Shell.tsx` - Root layout shell
- `src/components/navigation/Sidebar.tsx` - Desktop navigation
- `src/components/navigation/MobileNav.tsx` - Mobile navigation
- `src/components/Notifications.tsx` - Global notifications
- `src/hooks/usePageState.ts` - Data fetching hook

### Modified Files
- `app/layout.tsx` - Wrapped with AppProvider and Shell
- `app/admin/users/page.tsx` - Refactored to use global state
- `app/page.tsx` - Updated imports

## Checklist for Full Migration

- [ ] All pages use `useAppContext()` for UI state
- [ ] All pages use `usePageState()` for data fetching
- [ ] No local `useState` for theme/sidebar/modals
- [ ] All navigation uses `ROUTES` constants
- [ ] Responsive layout uses CSS, not React branching
- [ ] All errors/success use `addNotification()`
- [ ] No direct component-to-component communication
- [ ] Tests pass for all pages
- [ ] Mobile and desktop layouts work correctly
