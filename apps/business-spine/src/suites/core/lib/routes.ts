import React from 'react';

// Route constants
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_KILL_SWITCHES: '/admin/kill-switches',
  ADMIN_DIAGNOSTICS: '/admin/diagnostics',
  ADMIN_AUTH_OPS: '/admin/auth-ops',
  ADMIN_PAYROLL: '/admin/payroll',
  PAYROLL: '/payroll',
  TOOLS_UI_TROUBLESHOOT: '/tools/ui-troubleshoot',
  DESIGN_CUPERTINO: '/design/cupertino',
} as const;

// Navigation items structure
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  children?: NavigationItem[];
  requiredRole?: string[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    requiredRole: ['user', 'admin'],
  },
  {
    id: 'admin',
    label: 'Admin',
    href: ROUTES.ADMIN,
    requiredRole: ['admin'],
    children: [
      {
        id: 'admin-users',
        label: 'Users',
        href: ROUTES.ADMIN_USERS,
        requiredRole: ['admin'],
      },
      {
        id: 'admin-kill-switches',
        label: 'Kill Switches',
        href: ROUTES.ADMIN_KILL_SWITCHES,
        requiredRole: ['admin'],
      },
      {
        id: 'admin-diagnostics',
        label: 'Diagnostics',
        href: ROUTES.ADMIN_DIAGNOSTICS,
        requiredRole: ['admin'],
      },
      {
        id: 'admin-auth-ops',
        label: 'Auth Operations',
        href: ROUTES.ADMIN_AUTH_OPS,
        requiredRole: ['admin'],
      },
      {
        id: 'admin-payroll',
        label: 'Payroll',
        href: ROUTES.ADMIN_PAYROLL,
        requiredRole: ['admin'],
      },
    ],
  },
  {
    id: 'payroll',
    label: 'Payroll',
    href: ROUTES.PAYROLL,
    requiredRole: ['user', 'admin'],
  },
  {
    id: 'tools',
    label: 'Tools',
    href: ROUTES.TOOLS_UI_TROUBLESHOOT,
    requiredRole: ['user', 'admin'],
  },
];

// Helper function to check if a route is active
export function isRouteActive(currentPath: string, targetPath: string): boolean {
  if (currentPath === targetPath) return true;
  
  // Check if current path starts with target path (for nested routes)
  if (currentPath.startsWith(targetPath + '/')) return true;
  
  return false;
}

// Helper function to get navigation items for user role
export function getNavigationItemsForRole(userRole: string): NavigationItem[] {
  return NAVIGATION_ITEMS.filter(item => {
    if (!item.requiredRole) return true;
    return item.requiredRole.includes(userRole);
  }).map(item => ({
    ...item,
    children: item.children?.filter(child => {
      if (!child.requiredRole) return true;
      return child.requiredRole.includes(userRole);
    }),
  }));
}

// Helper function to get breadcrumb items
export function getBreadcrumbs(pathname: string): Array<{ label: string; href: string }> {
  const parts = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', href: '/' }];
  
  let currentPath = '';
  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    const route = Object.values(ROUTES).find(route => route === currentPath);
    const navItem = NAVIGATION_ITEMS.find(item => item.href === currentPath);
    const childItem = NAVIGATION_ITEMS.flatMap(item => item.children || []).find(child => child.href === currentPath);
    
    const label = navItem?.label || childItem?.label || part.charAt(0).toUpperCase() + part.slice(1);
    breadcrumbs.push({ label, href: currentPath });
  });
  
  return breadcrumbs;
}
