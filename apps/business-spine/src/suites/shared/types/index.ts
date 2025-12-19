// Shared Types - Common interfaces used across suites

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  timestamp?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
  };
}

/**
 * Select option for dropdowns
 */
export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
  description?: string;
}

/**
 * Table column definition
 */
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'client' | 'owner' | 'system';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session entity
 */
export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Booking entity
 */
export interface Booking {
  id: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  startTime: Date;
  endTime: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payment entity
 */
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification entity
 */
export interface Notification {
  id: string;
  userId: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

/**
 * Audit log entity
 */
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  name: string;
  status: 'ok' | 'degraded' | 'error';
  responseTime?: number;
  message?: string;
  details?: Record<string, any>;
}

/**
 * System health status
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: HealthCheckResult[];
  uptime: number;
}

/**
 * Async state
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Form field error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Form submission result
 */
export interface FormSubmitResult {
  success: boolean;
  message?: string;
  errors?: FieldError[];
  data?: any;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * Filter params
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * Query params
 */
export interface QueryParams extends PaginationParams, FilterParams {}

/**
 * Request context
 */
export interface RequestContext {
  requestId: string;
  userId?: string;
  timestamp: string;
  path: string;
  method: string;
  ip?: string;
}

/**
 * Feature flag
 */
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  percentage?: number;
  users?: string[];
}
