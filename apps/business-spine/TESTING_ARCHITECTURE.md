# Testing the New Architecture

This guide provides comprehensive testing procedures to verify the single-source-of-truth architecture is working correctly.

## Test Suite 1: Global State Management

### Test 1.1: Theme Persistence
**Goal**: Verify theme changes persist across page navigation

**Steps**:
1. Start app on home page
2. Open DevTools → check `useAppContext()` theme value
3. Click theme toggle button
4. Navigate to `/admin/users`
5. Verify theme is still changed
6. Navigate back to home
7. Verify theme persists

**Expected**: Theme state persists across all pages

**Code to verify**:
```typescript
const { ui, setTheme } = useAppContext();
console.log('Current theme:', ui.theme);
```

### Test 1.2: Sidebar State Persistence
**Goal**: Verify sidebar open/closed state persists

**Steps**:
1. On desktop, verify sidebar is visible
2. Click sidebar toggle
3. Navigate to different page
4. Verify sidebar is still hidden
5. Navigate back
6. Verify sidebar state persists

**Expected**: Sidebar state consistent across navigation

### Test 1.3: Filter Persistence
**Goal**: Verify filters persist in global store

**Steps**:
1. Go to `/admin/users`
2. Enter search term "john"
3. Verify `ui.filters.userSearch === 'john'`
4. Select role filter "admin"
5. Verify `ui.filters.userRole === 'admin'`
6. Navigate away and back
7. Verify filters are still set

**Expected**: Filters persist in global store

### Test 1.4: Notification System
**Goal**: Verify notifications appear and auto-dismiss

**Steps**:
1. Trigger an error action (e.g., delete user without confirmation)
2. Verify error notification appears bottom-right
3. Verify notification has correct icon and color
4. Wait 5 seconds
5. Verify notification auto-dismisses
6. Trigger success action
7. Verify success notification appears with correct styling

**Expected**: Notifications appear, style correctly, and auto-dismiss

---

## Test Suite 2: Responsive Layout

### Test 2.1: Desktop Layout
**Goal**: Verify desktop layout shows sidebar

**Steps**:
1. Open app in desktop browser (width > 768px)
2. Verify sidebar is visible (not hidden)
3. Verify mobile nav is hidden
4. Verify main content takes remaining space
5. Resize to mobile width
6. Verify sidebar hides
7. Verify mobile nav appears

**Expected**: Layout changes based on screen size via CSS

**Check in DevTools**:
```css
/* Desktop sidebar should be visible */
aside { display: flex; /* md:flex */ }

/* Mobile nav should be hidden */
.mobile-nav { display: none; /* md:hidden */ }
```

### Test 2.2: Mobile Layout
**Goal**: Verify mobile layout shows mobile nav

**Steps**:
1. Open app on mobile device or DevTools mobile mode
2. Verify sidebar is hidden
3. Verify mobile nav is visible at top
4. Verify hamburger menu works
5. Click hamburger
6. Verify dropdown menu appears
7. Click menu item
8. Verify dropdown closes
9. Verify navigation works

**Expected**: Mobile nav fully functional, sidebar hidden

### Test 2.3: Responsive Transitions
**Goal**: Verify layout transitions smoothly

**Steps**:
1. Open DevTools responsive mode
2. Set width to 768px (breakpoint)
3. Slowly resize down to 500px
4. Verify sidebar gradually hides
5. Verify mobile nav gradually appears
6. Resize back to 1200px
7. Verify sidebar reappears

**Expected**: Smooth CSS transitions, no React re-renders

---

## Test Suite 3: Data Fetching

### Test 3.1: usePageState Hook
**Goal**: Verify data fetching works correctly

**Steps**:
1. Go to `/admin/users`
2. Verify loading spinner appears
3. Verify data loads after API response
4. Verify table populates with users
5. Check network tab for API call
6. Verify correct query parameters sent

**Expected**: Data loads correctly, loading state works

### Test 3.2: Filter-Triggered Refetch
**Goal**: Verify filters trigger data refetch

**Steps**:
1. Go to `/admin/users`
2. Wait for initial load
3. Enter search term
4. Verify loading spinner appears
5. Verify new API call made with search param
6. Verify results update
7. Change role filter
8. Verify another API call made
9. Verify results update

**Expected**: Each filter change triggers refetch

**Network tab should show**:
```
GET /api/admin/users?page=1&limit=10&search=john
GET /api/admin/users?page=1&limit=10&search=john&role=admin
```

### Test 3.3: Error Handling
**Goal**: Verify errors show as notifications

**Steps**:
1. Mock API to return 500 error
2. Go to `/admin/users`
3. Verify error notification appears
4. Verify notification shows error message
5. Verify data is empty/null
6. Verify refetch button works
7. Restore API
8. Click refetch
9. Verify data loads

**Expected**: Errors handled gracefully with notifications

### Test 3.4: Refetch Button
**Goal**: Verify manual refetch works

**Steps**:
1. Go to `/admin/users`
2. Wait for data to load
3. Manually trigger refetch (if button exists)
4. Verify loading spinner appears
5. Verify data refreshes
6. Verify API call made

**Expected**: Manual refetch works correctly

---

## Test Suite 4: Navigation

### Test 4.1: Route Highlighting
**Goal**: Verify current route is highlighted in nav

**Steps**:
1. Go to `/dashboard`
2. Verify Dashboard nav item is highlighted
3. Go to `/admin/users`
4. Verify Users nav item is highlighted
5. Verify Dashboard is no longer highlighted
6. Go to `/admin/kill-switches`
7. Verify Kill Switches is highlighted

**Expected**: Active route always highlighted in nav

### Test 4.2: Navigation Links
**Goal**: Verify all nav links work

**Steps**:
1. Click each nav item
2. Verify correct page loads
3. Verify URL changes
4. Verify page content updates
5. Verify nav highlights correct item

**Expected**: All navigation works correctly

### Test 4.3: Mobile Navigation
**Goal**: Verify mobile nav works

**Steps**:
1. Open on mobile
2. Verify hamburger menu visible
3. Click hamburger
4. Verify dropdown appears
5. Click nav item
6. Verify page navigates
7. Verify dropdown closes
8. Verify hamburger toggles correctly

**Expected**: Mobile nav fully functional

---

## Test Suite 5: No State Duplication

### Test 5.1: Single Source of Truth
**Goal**: Verify no state duplication

**Steps**:
1. Open DevTools console
2. Add logging to AppContext:
```typescript
const setTheme = useCallback((theme: Theme) => {
  console.log('Setting theme to:', theme);
  setUI((prev) => ({ ...prev, theme }));
}, []);
```
3. Change theme
4. Verify only ONE console.log appears
5. Verify no duplicate state updates

**Expected**: State updates only once per action

### Test 5.2: No Component Coupling
**Goal**: Verify components don't reach into each other

**Steps**:
1. Search codebase for direct component imports
2. Verify no page imports another page
3. Verify no component imports another component's state
4. Verify all communication goes through global store
5. Verify all navigation uses ROUTES constants

**Expected**: No component coupling detected

---

## Test Suite 6: Performance

### Test 6.1: No Unnecessary Re-renders
**Goal**: Verify components don't re-render unnecessarily

**Steps**:
1. Install React DevTools Profiler
2. Go to `/admin/users`
3. Open Profiler
4. Record interaction
5. Change search filter
6. Stop recording
7. Verify only affected components re-render
8. Verify Shell doesn't re-render
9. Verify Sidebar doesn't re-render

**Expected**: Only necessary components re-render

### Test 6.2: CSS Layout Changes Don't Trigger Re-renders
**Goal**: Verify layout changes don't cause React re-renders

**Steps**:
1. Open Profiler
2. Resize browser window
3. Record interaction
4. Resize from desktop to mobile
5. Stop recording
6. Verify NO React components re-rendered
7. Verify only CSS changed

**Expected**: Layout changes are pure CSS, no React overhead

---

## Test Suite 7: Dark Mode

### Test 7.1: Theme Toggle
**Goal**: Verify dark mode works

**Steps**:
1. Add theme toggle to UI (if not present)
2. Click to toggle theme
3. Verify entire app switches to dark mode
4. Verify all components have dark classes
5. Toggle back to light
6. Verify all components switch back
7. Navigate to different page
8. Verify theme persists

**Expected**: Dark mode works across entire app

### Test 7.2: Dark Mode Styling
**Goal**: Verify all components have dark mode styles

**Steps**:
1. Toggle to dark mode
2. Check each component:
   - Sidebar: dark background
   - Mobile nav: dark background
   - Tables: dark background
   - Inputs: dark background
   - Text: light color
3. Verify no white text on white background
4. Verify no black text on black background
5. Verify contrast is sufficient

**Expected**: All components properly styled for dark mode

---

## Test Suite 8: Modal System

### Test 8.1: Global Modal State
**Goal**: Verify modals use global state

**Steps**:
1. Go to `/admin/users`
2. Click "Add User" button
3. Verify `ui.activeModal === 'createUser'`
4. Verify modal appears
5. Click close/cancel
6. Verify `ui.activeModal === null`
7. Verify modal disappears

**Expected**: Modals controlled by global state

### Test 8.2: Modal Persistence
**Goal**: Verify modal persists across navigation

**Steps**:
1. Open modal on `/admin/users`
2. Navigate to `/dashboard`
3. Verify modal is still open
4. Navigate back to `/admin/users`
5. Verify modal is still open
6. Close modal
7. Verify modal closes

**Expected**: Modal state persists across navigation

---

## Automated Test Examples

### useAppContext Hook
```typescript
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useAppContext } from '@/src/providers/AppContext';

describe('useAppContext', () => {
  it('should update theme', () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.ui.theme).toBe('system');

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.ui.theme).toBe('dark');
  });

  it('should add notification', () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.addNotification('Test message', 'success');
    });

    expect(result.current.ui.notifications).toHaveLength(1);
    expect(result.current.ui.notifications[0].message).toBe('Test message');
  });
});
```

### usePageState Hook
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { usePageState } from '@/src/hooks/usePageState';
import { AppProvider } from '@/src/providers/AppContext';

describe('usePageState', () => {
  it('should fetch data', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' })
    });
    global.fetch = mockFetch;

    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(
      () => usePageState(async () => {
        const res = await fetch('/api/test');
        return res.json();
      }, []),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ data: 'test' });
  });
});
```

---

## Checklist for QA

- [ ] Theme persists across pages
- [ ] Sidebar state persists
- [ ] Filters persist in global store
- [ ] Notifications appear and auto-dismiss
- [ ] Desktop layout shows sidebar
- [ ] Mobile layout shows mobile nav
- [ ] Data fetches correctly
- [ ] Filters trigger refetch
- [ ] Errors show as notifications
- [ ] Navigation highlights current route
- [ ] All nav links work
- [ ] Mobile nav works
- [ ] No state duplication
- [ ] No component coupling
- [ ] No unnecessary re-renders
- [ ] Layout changes don't trigger re-renders
- [ ] Dark mode works
- [ ] All components styled for dark mode
- [ ] Modals use global state
- [ ] Modal persists across navigation

---

## Performance Benchmarks

Target metrics:

- **First Paint**: < 1s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Re-renders per filter change**: 1-2 (only affected components)
- **Layout shift on resize**: 0 (pure CSS)

Use Lighthouse and DevTools Performance tab to measure.
