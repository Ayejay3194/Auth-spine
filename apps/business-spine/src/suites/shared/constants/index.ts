// Shared Constants - Used across all suites

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_REFRESH: '/api/auth/refresh',
  
  // Users
  USERS: '/api/users',
  USERS_ME: '/api/users/me',
  USERS_PROFILE: '/api/users/profile',
  
  // Dashboard
  DASHBOARD: '/api/dashboard',
  DASHBOARD_STATS: '/api/dashboard/stats',
  
  // Admin
  ADMIN: '/api/admin',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_SETTINGS: '/api/admin/settings',
  
  // Health
  HEALTH: '/api/health',
  HEALTH_DB: '/api/health/db',
  
  // Business
  BOOKINGS: '/api/bookings',
  PAYMENTS: '/api/payments',
  PAYROLL: '/api/payroll',
} as const;

/**
 * Responsive Design Breakpoints (Tailwind)
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

/**
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;

/**
 * Theme Options
 */
export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * User Roles
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CLIENT: 'client',
  OWNER: 'owner',
  SYSTEM: 'system',
} as const;

/**
 * Booking Status
 */
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
} as const;

/**
 * Payment Status
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

/**
 * Cache Keys
 */
export const CACHE_KEYS = {
  USER: (id: string) => `user:${id}`,
  USERS: 'users:all',
  BOOKINGS: 'bookings:all',
  DASHBOARD: 'dashboard:stats',
  HEALTH: 'health:status',
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
} as const;

/**
 * Time Constants (in milliseconds)
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * File Upload Limits
 */
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
} as const;

/**
 * Validation Rules
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRES_UPPERCASE: true,
  PASSWORD_REQUIRES_NUMBER: true,
  PASSWORD_REQUIRES_SPECIAL: true,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\d\s\-\+\(\)]+$/,
} as const;
