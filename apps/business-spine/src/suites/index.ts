// Suite Organization - Main exports for all suites

// Foundation Suites
export * from './core';
export * from './ui';
export * from './navigation';
export * from './tools';
export * from './shared';

// Business Domain Suites
export * from './business';

// Security Domain Suites
export * from './security';

// Infrastructure Domain Suites
export * from './infrastructure';
export { DEPLOYMENT_STATUS as INFRA_DEPLOYMENT_STATUS } from './infrastructure';

// Platform Domain Suites
export * from './platform';
export { TenantSettings as PlatformTenantSettings } from './platform';

// Integration Domain Suites
export * from './integrations';

// Legal Domain Suites
export * from './legal';

// Development Domain Suites
export * from './development';

// Enterprise Domain Suites
export * from './enterprise';

// Re-export commonly used items for convenience
export {
  // Core Foundation
  AppProvider,
  useAppContext,
  Shell,
  usePageState,
  useMediaQuery,
  ROUTES,
  NAVIGATION_ITEMS,
} from './core';

export {
  // UI Components
  SmoothButton,
  SmoothInput,
  SmoothCard,
  LoadingSpinner,
  PageTransition,
  CupertinoBlankState,
  CupertinoSkeleton,
} from './ui';

export {
  // Navigation
  Sidebar,
  MobileNav,
  Notifications,
} from './navigation';

export {
  // Tools
  UITroubleshootKit,
} from './tools';

export {
  // Shared Utilities
  formatDate,
  formatCurrency,
  debounce,
  throttle,
  clsx,
  API_ENDPOINTS,
  BREAKPOINTS,
  NOTIFICATION_TYPES,
  THEME_OPTIONS,
} from './shared';

export type {
  // Business Domain
  BusinessCustomer,
  BusinessBooking,
  BusinessPayroll,
  BusinessTransaction,
  BusinessAnalytics,
} from './business';

export type {
  // Security Domain
  SecurityUser,
  SecurityRole,
  SecurityPermission,
  SecurityAudit,
  SecurityCompliance,
} from './security';

export type {
  // Infrastructure Domain
  InfrastructureMetrics,
  DeploymentStatus,
  KillSwitch,
  OperationsAlert,
} from './infrastructure';

export type {
  // Platform Domain
  PlatformTenant,
  PlatformService,
  PlatformSubscription,
} from './platform';

export type {
  // Integration Domain
  PaymentProvider,
  PaymentTransaction,
  NotificationChannel,
  StorageProvider,
  ExternalAPI,
} from './integrations';

export type {
  // Legal Domain
  LegalCompliance,
  LegalGovernance,
  LegalDocument,
} from './legal';

export type {
  // Development Domain
  TestSuite,
  DebugSession,
  LintReport,
  DocumentationPage,
} from './development';

export type {
  // Enterprise Domain
  EnterpriseTenant,
  EnterpriseAuth,
  EnterpriseSecurity,
  EnterpriseMonitoring,
} from './enterprise';

// Foundation Types
export type {
  AppUIState,
  NotificationType,
  ModalType,
} from './core';

export type {
  SmoothButtonProps,
  SmoothInputProps,
  SmoothCardProps,
  LoadingSpinnerProps,
  CupertinoBlankStateProps,
  CupertinoSkeletonProps,
} from './ui';

export type {
  NavigationItem,
  NotificationItem,
} from './navigation';

export type {
  ApiResponse,
  PaginatedResponse,
  SelectOption,
  TableColumn,
} from './shared';
