export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  DASHBOARD_BOOKING: '/dashboard/booking',
  DASHBOARD_STAFF: '/dashboard/staff',
  DASHBOARD_LOYALTY: '/dashboard/loyalty',
  DASHBOARD_AUTOMATION: '/dashboard/automation',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_KILL_SWITCHES: '/admin/kill-switches',
  ADMIN_DIAGNOSTICS: '/admin/diagnostics',
  ADMIN_AUTH_OPS: '/admin/auth-ops',
  PAYROLL: '/payroll',
  PAYROLL_RUNS: '/payroll/runs',
  SWAGGER: '/swagger',
} as const;

export const NAVIGATION_ITEMS = [
  {
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
    roles: ['owner', 'admin', 'manager'],
  },
  {
    label: 'Admin',
    href: ROUTES.ADMIN,
    icon: 'Shield',
    roles: ['owner', 'admin'],
    children: [
      { label: 'Users', href: ROUTES.ADMIN_USERS },
      { label: 'Kill Switches', href: ROUTES.ADMIN_KILL_SWITCHES },
      { label: 'Diagnostics', href: ROUTES.ADMIN_DIAGNOSTICS },
      { label: 'Auth Ops', href: ROUTES.ADMIN_AUTH_OPS },
    ],
  },
  {
    label: 'Payroll',
    href: ROUTES.PAYROLL,
    icon: 'DollarSign',
    roles: ['owner', 'admin'],
  },
  {
    label: 'API Docs',
    href: ROUTES.SWAGGER,
    icon: 'BookOpen',
    roles: ['owner', 'admin', 'manager'],
  },
];

export function isRouteActive(currentPath: string, routePath: string): boolean {
  return currentPath === routePath || currentPath.startsWith(routePath + '/');
}
